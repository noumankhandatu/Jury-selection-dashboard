import { Sidebar } from "@/components/global/sidebar";
import type React from "react";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Detect screen width and close sidebar on mobile by default
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    <div className="min-h-screen  relative ">
      {/* Toggleable Sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 h-screen w-64 z-20 ">
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* Toggle Button */}
      {!isSidebarOpen && (
        <Button className="fixed top-4 left-3 z-30" variant="outline" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all ${isSidebarOpen ? "ml-64" : "ml-0 lg:ml-12"}   `}>{children}</div>
    </div>
  );
}
