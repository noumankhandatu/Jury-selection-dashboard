/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";
import { Scale, Mail, Eye, EyeOff, Lock } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      // Step 1: Login
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/auth/login`,
        {
          email,
          password,
        }
      );

      if (response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("user", JSON.stringify(user));

        // Step 2: Check for organizations
        try {
          const orgsResponse = await axios.get(
            `${import.meta.env.VITE_BASEURL}/organizations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const organizations = orgsResponse.data.organizations;

          if (!organizations || organizations.length === 0) {
            // No organization - redirect to create one
            toast.success("Welcome! Let's set up your organization");
            setTimeout(() => {
              window.location.href = "/create-organization"; // Force full page reload
            }, 1000);
            return;
          }

          // Has organization(s) - use the first one
          const org = organizations[0];
          localStorage.setItem("organizationId", org.id);
          localStorage.setItem("organizationName", org.name);
          localStorage.setItem("userRole", org.memberRole);

          // Step 3: Check subscription status
          try {
            const subResponse = await axios.get(
              `${import.meta.env.VITE_BASEURL}/subscriptions/${org.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const subscription = subResponse.data.subscription;

            if (
              subscription.status === "ACTIVE" ||
              subscription.status === "TRIALING"
            ) {
              // All good - go to dashboard
              toast.success("Login successful!");
              setTimeout(() => {
                window.location.href = "/dashboard"; // Force full page reload
              }, 1000);
            } else {
              // Subscription not active - redirect to pricing
              toast.warning("Please activate your subscription");
              setTimeout(() => {
                window.location.href = "/subscription/select"; // Force full page reload
              }, 1000);
            }
          } catch {
            // No subscription or error - redirect to pricing
            toast.warning("Please select a subscription plan");
            setTimeout(() => {
              window.location.href = "/subscription/select"; // Force full page reload
            }, 1000);
          }
        } catch (orgError) {
          // Error checking organizations - redirect to create one
          console.error("Error checking organizations:", orgError);
          window.location.href = "/create-organization"; // Force full page reload
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg =
        err?.response?.data?.message || "Invalid email or password";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/bg/1.png')",
      }}
    >
      {/* Frosted Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl max-w-md w-full mx-4 p-8 flex flex-col items-center"
      >
        <div className="flex flex-col items-center w-full">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Scale className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Sign in with email
            </h2>
            <p className="text-gray-600 text-center mt-2 text-sm">
              Welcome to the official Juror Selection Portal.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 transition"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </motion.div>
            <div className="flex items-center justify-between text-sm">
              <div></div>
              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Get Started"}
            </motion.button>
          </form>
          <div className="flex items-center w-full my-4">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-2 text-gray-400 text-xs">Or sign in with</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center w-full"
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
