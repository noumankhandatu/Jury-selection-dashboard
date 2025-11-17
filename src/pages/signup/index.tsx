/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import BaseUrl from "@/utils/config/baseUrl";
import { motion } from "framer-motion";
import { Eye, EyeOff, Scale, Mail, Lock, User, Phone } from "lucide-react";
import { formatPhoneInput } from "@/utils/format";

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phoneNumber,
    } = form;
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName ||
      !phoneNumber
    ) {
      toast.error("Please fill in all the fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { email, password, firstName, lastName, phoneNumber };
      const response = await BaseUrl.post(
        `${import.meta.env.VITE_BASEURL}/auth/signup`,
        payload
      );

      // Store token and user data
      if (response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("user", JSON.stringify(user));

      toast.success("Account created successfully!");

      // If there's an invitation token, redirect to accept invitation
      if (inviteToken) {
        setTimeout(() => {
            window.location.href = `/accept-invitation?token=${inviteToken}`;
          }, 1000);
          return;
        }

        // Check for organizations to determine next step
        try {
          const orgsResponse = await BaseUrl.get(
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
              window.location.href = "/create-organization";
            }, 1000);
            return;
          }

          // Has organization(s) - use the first one
          const org = organizations[0];
          localStorage.setItem("organizationId", org.id);
          localStorage.setItem("organizationName", org.name);
          localStorage.setItem("userRole", org.memberRole);

          // Check subscription status
          try {
            const subResponse = await BaseUrl.get(
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
              toast.success("Welcome back!");
              setTimeout(() => {
                window.location.href = "/dashboard";
        }, 1000);
      } else {
              // Subscription not active - redirect to pricing
              toast.warning("Please activate your subscription");
              setTimeout(() => {
                window.location.href = "/subscription/select";
              }, 1000);
            }
          } catch {
            // No subscription or error - redirect to pricing
            toast.warning("Please select a subscription plan");
            setTimeout(() => {
              window.location.href = "/subscription/select";
            }, 1000);
          }
        } catch (orgError) {
          // Error checking organizations - redirect to create one
          console.error("Error checking organizations:", orgError);
          toast.success("Welcome! Let's set up your organization");
        setTimeout(() => {
            window.location.href = "/create-organization";
          }, 1000);
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg =
        err?.response?.data?.message || "Signup failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/bg/2.png')",
      }}
    >
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
              Create an account
            </h2>
            <p className="text-gray-600 text-center mt-2 text-sm">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Log in
              </Link>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 transition"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="relative"
            >
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="lastName"
                type="text"
                required
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 transition"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 transition"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="relative"
            >
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="phoneNumber"
                type="tel"
                required
                value={form.phoneNumber}
                onChange={(e) => {
                  const formatted = formatPhoneInput(e.target.value);
                  setForm((prev) => ({ ...prev, phoneNumber: formatted }));
                }}
                placeholder="(555) 123-4567"
                maxLength={14}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 transition"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={handleChange}
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
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="relative"
            >
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition"
                tabIndex={-1}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-60"
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
