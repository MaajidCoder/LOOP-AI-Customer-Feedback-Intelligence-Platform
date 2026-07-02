"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Menu, Search, User, LogOut } from "lucide-react";

interface TopNavbarProps {
  onMenuClick: () => void;
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Loop User";
  const userRole = (session?.user as any)?.role || "Viewer";

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left: Menu & Search */}
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden">
          <Menu className="h-6 w-6" />
        </button>

        <div className="hidden sm:flex max-w-md flex-1 items-center relative">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Right: Notifications, Profile, & Logout */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-red-500" />
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-medium text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{userRole.toLowerCase()}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <User className="h-5 w-5" />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
