import { Sidebar } from "@/components/global/sidebar";
import type React from "react";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen width and close sidebar on mobile by default
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen, isMobile]);

  return (
    <div className="min-h-screen relative">
      {/* Backdrop Overlay (Mobile Only) */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Toggleable Sidebar */}
      {isSidebarOpen && (
        <div
          className={`fixed top-0 left-0 h-screen w-64 z-40 transform transition-transform duration-300 ease-in-out ${
            isMobile ? "animate-in slide-in-from-left" : ""
          }`}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* Toggle Button */}
      {!isSidebarOpen && (
        <Button
          className="fixed top-4 left-3 z-30"
          variant="outline"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
