import { db, lenders } from "../src/lib/db";

// Guyanese financial institutions that offer car loans
const guyanaLenders = [
  {
    name: "Guyana Public Service Co-operative Credit Union",
    shortName: "GPSCCU",
    defaultRate: "12.00",
    country: "Guyana",
  },
  {
    name: "Guyana Bank for Trade and Industry",
    shortName: "GBTI",
    defaultRate: "14.00",
    country: "Guyana",
  },
  {
    name: "Republic Bank Guyana",
    shortName: "Republic",
    defaultRate: "13.00",
    country: "Guyana",
  },
  {
    name: "Demerara Bank Limited",
    shortName: "Demerara",
    defaultRate: "13.50",
    country: "Guyana",
  },
  {
    name: "Citizens Bank Guyana",
    shortName: "Citizens",
    defaultRate: "14.00",
    country: "Guyana",
  },
  {
    name: "Guyana National Co-operative Bank",
    shortName: "GNCB",
    defaultRate: "12.50",
    country: "Guyana",
  },
  {
    name: "Hand-in-Hand Trust Corporation",
    shortName: "HIH",
    defaultRate: "13.00",
    country: "Guyana",
  },
  {
    name: "Other",
    shortName: "Other",
    defaultRate: "15.00",
    country: "Guyana",
  },
];

async function seed() {
  console.log("Seeding lenders...");

  for (const lender of guyanaLenders) {
    await db
      .insert(lenders)
      .values(lender)
      .onConflictDoNothing();
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
