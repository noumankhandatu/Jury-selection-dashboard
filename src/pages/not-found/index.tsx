import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CloudOff } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl max-w-md w-full mx-4 p-10 flex flex-col items-center"
      >
        <div className="flex flex-col items-center w-full space-y-4">
          <div className="flex flex-col items-center">
            <CloudOff className="h-14 w-14 text-blue-400 mb-2 animate-bounce" />
            <h1 className="text-7xl font-extrabold text-[#5156be] mb-2">404</h1>
          </div>
          <p className="text-2xl font-semibold text-gray-800">Page Not Found</p>
          <p className="text-gray-600 text-center text-sm">Oops! The page you are looking for does not exist.</p>
          <p className="text-sm text-gray-400 animate-pulse">
            Redirecting to home in {countdown} second{countdown !== 1 && "s"}...
          </p>
          <Button onClick={() => navigate("/")} className="bg-[#5156be] text-white w-full transition duration-300 hover:scale-105 mt-2">
            Go to Home Now
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
