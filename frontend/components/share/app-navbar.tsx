"use client";

import { LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/services/logoutAction";

export function AppNavbar() {
  return (
    <header className="flex items-center justify-between border-b bg-card px-6 py-3">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-primary" />
        <span className="font-semibold">Boards</span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => logoutAction()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
