/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import BaseUrl from "@/utils/config/baseUrl";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, Users, XCircle, Loader2 } from "lucide-react";
import { getInvitationByTokenApi } from "@/api/api";

export default function TeamSignUpPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch invitation details on mount
  useEffect(() => {
    const fetchInvitationDetails = async () => {
      if (!inviteToken) {
        setLoadingInvitation(false);
        setInvitationError("Invalid invitation link");
        return;
      }

      try {
        const response = await getInvitationByTokenApi(inviteToken);
        if (response.invitation) {
          // Auto-fill email from invitation
          setForm((prev) => ({
            ...prev,
            email: response.invitation.email,
          }));
        }
        setLoadingInvitation(false);
      } catch (error: any) {
        console.error("Error fetching invitation:", error);
        const errorMsg = error?.response?.data?.error || "Failed to load invitation details";
        setInvitationError(errorMsg);
        setLoadingInvitation(false);
        toast.error(errorMsg);
      }
    };

    fetchInvitationDetails();
  }, [inviteToken]);

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

    if (!inviteToken) {
      toast.error("Invalid invitation link. Please contact your organization administrator.");
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

        // Redirect to accept invitation
        setTimeout(() => {
          window.location.href = `/accept-invitation?token=${inviteToken}`;
        }, 1000);
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

  if (loadingInvitation) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: "url('/bg/2.png')" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl max-w-md w-full mx-4 p-8 flex flex-col items-center"
        >
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-indigo-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Invitation...</h2>
            <p className="text-gray-600">Please wait while we verify your invitation.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!inviteToken || invitationError) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: "url('/bg/2.png')" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl max-w-md w-full mx-4 p-8 flex flex-col items-center"
        >
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-4">{invitationError || "This invitation link is invalid or has expired."}</p>
            <Link to="/signin" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Go to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
              <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Join Your Team
            </h2>
            <p className="text-gray-600 text-center mt-2 text-sm">
              You've been invited to join a team. Create your account to get started.
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
                disabled
                placeholder="Email"
                className="w-full pl-10 pr-20 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed outline-none transition"
                title="Email is pre-filled from your invitation and cannot be changed"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Locked</span>
              </div>
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
                onChange={handleChange}
                placeholder="Phone Number"
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
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-60"
            >
              {isSubmitting ? "Joining Team..." : "Join Team"}
            </motion.button>
          </form>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center w-full mt-4 text-sm"
          >
            Already have an account?{" "}
            <Link
              to={`/signin?inviteToken=${inviteToken}`}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

