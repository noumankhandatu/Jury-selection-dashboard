import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Search,
  Radio,
  UserCog,
  Scale,
  FileSearch,
  UsersRound,
  CreditCard,
  Building2,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCircleArrowLeft } from "react-icons/fa6";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/fn";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get user role and organization info from localStorage
  const userRole = localStorage.getItem("userRole") || "MEMBER";
  const organizationName =
    localStorage.getItem("organizationName") || "Organization";

  // Logout function
  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    navigate("/");
    window.location.reload();
    // Show success message
    toast.success("Logged out successfully");

    // Redirect to login page
  };

  // Base routes available to all users
  const baseRoutes: Array<{
    label: string;
    icon: any;
    href: string;
    active: boolean;
    color: string;
    badge?: string;
  }> = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: location.pathname === "/dashboard",
      color: "white",
    },
    {
      label: "Create Case",
      icon: PlusCircle,
      href: "/dashboard/create-case",
      active: location.pathname === "/dashboard/create-case",
      color: "white",
    },
    {
      label: "Manage Jurors",
      icon: UserCog,
      href: "/dashboard/manage-jurors",
      active: location.pathname === "/dashboard/manage-jurors",
      color: "white",
    },
    {
      label: "Search Case",
      icon: Search,
      href: "/dashboard/search-case",
      active: location.pathname === "/dashboard/search-case",
      color: "white",
    },
    {
      label: "Live Session",
      icon: Radio,
      href: "/dashboard/live-session",
      active: location.pathname === "/dashboard/live-session",
      color: "white",
    },
    {
      label: "Session Analysis",
      icon: FileSearch,
      href: "/dashboard/session-analysis",
      active: location.pathname === "/dashboard/session-analysis",
      color: "white",
    },
    {
      label: "Account",
      icon: Users,
      href: "/dashboard/account",
      active: location.pathname === "/dashboard/account",
      color: "white",
    },
  ];

  // Team management routes (OWNER & ADMIN only)
  const teamRoutes: Array<{
    label: string;
    icon: any;
    href: string;
    active: boolean;
    color: string;
    badge?: string;
  }> =
    userRole === "OWNER" || userRole === "ADMIN"
      ? [
          {
            label: "Team Management",
            icon: UsersRound,
            href: "/dashboard/team-management",
            active: location.pathname === "/dashboard/team-management",
            color: "white",
            badge: "Team",
          },
        ]
      : [];

  // Billing & settings routes (OWNER only)
  const ownerRoutes: Array<{
    label: string;
    icon: any;
    href: string;
    active: boolean;
    color: string;
    badge?: string;
  }> =
    userRole === "OWNER"
      ? [
          {
            label: "Billing",
            icon: CreditCard,
            href: "/dashboard/billing",
            active: location.pathname === "/dashboard/billing",
            color: "white",
            badge: "Owner",
          },
        ]
      : [];

  // Combine all routes
  const routes = [...baseRoutes, ...teamRoutes, ...ownerRoutes];

  return (
    <motion.div
      className="h-full w-full flex flex-col relative bg-gradient-to-br bg-[#003270] text-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="absolute top-6 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        variants={itemVariants}
      >
        <FaCircleArrowLeft className="h-5 w-5 text-white" />
      </motion.button>

      {/* Logo and Title */}
      <motion.div className="p-6 space-y-3" variants={itemVariants}>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shadow-lg">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Jury AI
          </h1>
        </div>
        {/* Organization Name */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
          <Building2 className="h-4 w-4 text-white/70" />
          <span className="text-sm text-white/90 font-medium truncate">
            {organizationName}
          </span>
        </div>
      </motion.div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-3">
        <motion.div className="space-y-1 py-2" variants={containerVariants}>
          {routes.map((route) => (
            <motion.div
              key={route.href}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  route.active
                    ? "bg-white/10 backdrop-blur-sm text-white shadow-lg from-blue-500 to-blue-600"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <div
                  className={`p-1.5 rounded-lg bg-gradient-to-r ${route.color}`}
                >
                  <route.icon className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1">{route.label}</span>
                {route.badge && (
                  <Badge className="bg-white/20 text-white border-0 text-xs px-2 py-0">
                    {route.badge}
                  </Badge>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>

      {/* Logout Section */}
      <motion.div
        className="p-4 mt-auto border-t border-white/10"
        variants={itemVariants}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleLogout}
            className="w-full justify-start text-white bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border-none transition-all duration-200 shadow-lg"
            variant="outline"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 mr-2">
              <LogOut className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">Logout</span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
