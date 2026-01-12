"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Home03Icon,
  Car01Icon,
  Calendar03Icon,
  Analytics01Icon,
  ChartLineData02Icon,
  FileExportIcon,
  Settings01Icon,
  Logout03Icon,
  WalletDone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home03Icon },
  { name: "My Loans", href: "/loans", icon: Car01Icon },
  { name: "Payments", href: "/tracker", icon: WalletDone01Icon },
  { name: "Planning", href: "/planning", icon: Calendar03Icon },
  { name: "Scenarios", href: "/scenarios", icon: ChartLineData02Icon },
  { name: "Analytics", href: "/analytics", icon: Analytics01Icon },
  { name: "Reports", href: "/reports", icon: FileExportIcon },
];

interface AppSidebarProps {
  user: {
    name: string;
    email: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            GLT
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Guyana Loan Tracker</span>
            <span className="text-xs text-muted-foreground">Pro Edition</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive}>
                      <HugeiconsIcon icon={item.icon} size={20} />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/settings" />} isActive={pathname === "/settings"}>
                  <HugeiconsIcon icon={Settings01Icon} size={20} />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {user.email}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
          >
            <HugeiconsIcon icon={Logout03Icon} size={18} />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
