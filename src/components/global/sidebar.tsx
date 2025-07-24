import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, PlusCircle, Search, Radio, UserCog, Scale, FileSearch } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
// import { Separator } from "../ui/separator";
import { FaCircleArrowLeft } from "react-icons/fa6";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/fn";

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const routes = [
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
    // {
    //   label: "Juror Analysis",
    //   icon: BarChart3,
    //   href: "/dashboard/juror-analysis",
    //   active: location.pathname === "/dashboard/juror-analysis",
    //   color: "white",
    // },
    {
      label: "Session Analysis",
      icon: FileSearch,
      href: "/dashboard/session-analysis",
      active: location.pathname === "/dashboard/session-analysis",
    },
    {
      label: "Account",
      icon: Users,
      href: "/dashboard/account",
      active: location.pathname === "/dashboard/account",
      color: "white",
    },
  ];

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
      <motion.div className="p-6 flex items-center space-x-3" variants={itemVariants}>
        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shadow-lg">
          <Scale className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Case </h1>
      </motion.div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-3">
        <motion.div className="space-y-1 py-2" variants={containerVariants}>
          {routes.map((route) => (
            <motion.div key={route.href} variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  route.active
                    ? "bg-white/10 backdrop-blur-sm text-white shadow-lg from-blue-500 to-blue-600"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${route.color}`}>
                  <route.icon className="h-4 w-4 text-white" />
                </div>
                {route.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>

      {/* Logout Section */}
      {/* <motion.div className="p-4 mt-auto" variants={itemVariants}>
        <Separator className="bg-white/10 mb-4" />
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={logoutUser}
            className="w-full justify-start text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border-none transition-all duration-200"
            variant="outline"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-r  mr-2">
              <LogOut className="h-4 w-4 text-white" />
            </div>
            Logout
          </Button>
        </motion.div>
      </motion.div> */}
    </motion.div>
  );
}
