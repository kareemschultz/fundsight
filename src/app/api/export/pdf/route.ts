import { auth } from "@/lib/auth";
import { db, loans, payments } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { type, loanId } = await req.json(); // 'summary' or 'payment-history'

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 20;

        // Header
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("FundSight — Personal Finance", pageWidth / 2, yPosition, { align: "center" });

        yPosition += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" });

        yPosition += 15;

        if (type === "summary") {
            // Loan Summary Report
            const userLoans = await db.query.loans.findMany({
                where: loanId ? eq(loans.id, loanId) : eq(loans.userId, session.user.id),
                with: { lender: true },
            });

            if (userLoans.length === 0) {
                return new NextResponse("No loans found", { status: 404 });
            }

            // Report Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(loanId ? "Loan Detail Report" : "Loan Portfolio Summary", 14, yPosition);
            yPosition += 10;

            // Summary Statistics
            const totalOriginal = userLoans.reduce((sum, l) => sum + parseFloat(l.originalAmount), 0);
            const totalCurrent = userLoans.reduce((sum, l) => sum + parseFloat(l.currentBalance), 0);
            const totalPaid = totalOriginal - totalCurrent;
            const activeCount = userLoans.filter(l => l.isActive).length;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            const summaryData = [
                ["Total Loans", userLoans.length.toString()],
                ["Active Loans", activeCount.toString()],
                ["Original Amount", `$${totalOriginal.toLocaleString()} GYD`],
                ["Current Balance", `$${totalCurrent.toLocaleString()} GYD`],
                ["Total Paid", `$${totalPaid.toLocaleString()} GYD`],
                ["Progress", `${((totalPaid / totalOriginal) * 100).toFixed(2)}%`],
            ];

            autoTable(doc, {
                startY: yPosition,
                head: [["Metric", "Value"]],
                body: summaryData,
                theme: "grid",
                headStyles: { fillColor: [59, 130, 246] }, // Blue color
                margin: { left: 14, right: 14 },
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            yPosition = (doc as any).lastAutoTable.finalY + 15;

            // Loan Details Table
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Loan Details", 14, yPosition);
            yPosition += 5;

            const loanTableData = userLoans.map(loan => [
                loan.lender?.shortName || "N/A",
                loan.vehicleDescription || "N/A",
                `$${parseFloat(loan.originalAmount).toLocaleString()}`,
                `$${parseFloat(loan.currentBalance).toLocaleString()}`,
                `${parseFloat(loan.interestRate) * 100}%`,
                `$${parseFloat(loan.monthlyPayment).toLocaleString()}`,
                loan.isActive ? "Active" : "Paid Off",
            ]);

            autoTable(doc, {
                startY: yPosition,
                head: [["Lender", "Vehicle", "Original", "Balance", "Rate", "Payment", "Status"]],
                body: loanTableData,
                theme: "striped",
                headStyles: { fillColor: [59, 130, 246] },
                margin: { left: 14, right: 14 },
                styles: { fontSize: 8 },
                columnStyles: {
                    1: { cellWidth: 35 }, // Vehicle column
                },
            });

        } else if (type === "payment-history") {
            // Payment History Report
            const loanFilter = loanId ? eq(payments.loanId, loanId) : eq(payments.userId, session.user.id);

            const userPayments = await db.query.payments.findMany({
                where: loanFilter,
                orderBy: (payments, { desc }) => [desc(payments.paymentDate)],
                with: {
                    loan: {
                        with: { lender: true }
                    }
                }
            });

            if (userPayments.length === 0) {
                return new NextResponse("No payments found", { status: 404 });
            }

            // Report Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Payment History Report", 14, yPosition);
            yPosition += 10;

            // Payment Summary
            const totalPayments = userPayments.length;
            const totalAmount = userPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            const regularPayments = userPayments.filter(p => p.paymentType === "regular");
            const extraPayments = userPayments.filter(p => p.paymentType === "extra");

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            const paymentSummary = [
                ["Total Payments", totalPayments.toString()],
                ["Total Amount", `$${totalAmount.toLocaleString()} GYD`],
                ["Regular Payments", regularPayments.length.toString()],
                ["Extra Payments", extraPayments.length.toString()],
                ["Average Payment", `$${(totalAmount / totalPayments).toLocaleString()} GYD`],
            ];

            autoTable(doc, {
                startY: yPosition,
                head: [["Metric", "Value"]],
                body: paymentSummary,
                theme: "grid",
                headStyles: { fillColor: [34, 197, 94] }, // Green color
                margin: { left: 14, right: 14 },
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            yPosition = (doc as any).lastAutoTable.finalY + 15;

            // Payment Details Table
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Payment Details", 14, yPosition);
            yPosition += 5;

            const paymentTableData = userPayments.map(payment => [
                payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "N/A",
                payment.loan?.lender?.shortName || "N/A",
                `$${parseFloat(payment.amount).toLocaleString()}`,
                payment.paymentType,
                payment.source,
                payment.notes || "-",
            ]);

            autoTable(doc, {
                startY: yPosition,
                head: [["Date", "Lender", "Amount", "Type", "Source", "Notes"]],
                body: paymentTableData,
                theme: "striped",
                headStyles: { fillColor: [34, 197, 94] },
                margin: { left: 14, right: 14 },
                styles: { fontSize: 8 },
                columnStyles: {
                    5: { cellWidth: 30 }, // Notes column
                },
            });
        } else {
            return new NextResponse("Invalid export type. Use 'summary' or 'payment-history'", { status: 400 });
        }

        // Footer
        const pageCount = doc.internal.pages.length - 1;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: "center" }
            );
            doc.text(
                "Generated by FundSight",
                pageWidth - 14,
                doc.internal.pageSize.getHeight() - 10,
                { align: "right" }
            );
        }

        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

        // Return as downloadable PDF
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="loan-tracker-${type}-${new Date().toISOString().split("T")[0]}.pdf"`,
            },
        });
    } catch (error) {
        console.error("[EXPORT_PDF]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
