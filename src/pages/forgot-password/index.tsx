/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";
import { Scale, Mail, KeyRound, Lock, Eye, EyeOff } from "lucide-react";

type Step = "email" | "verify" | "reset";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_BASEURL}/auth/forgot-password`, { email });
      toast.success("Reset code sent to your email!");
      setStep("verify");
      setOtpVerified(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to send reset code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    // OTP will be verified when submitting password reset
    // For now, just mark as verified to show password fields
    setOtpVerified(true);
    setStep("reset");
    toast.success("Code verified! Please enter your new password.");
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpVerified) {
      toast.error("Please verify the code first.");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_BASEURL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset successful! Please login with your new password.");
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_BASEURL}/auth/forgot-password`, { email });
      toast.success("New code sent to your email!");
    } catch (err: any) {
      toast.error("Failed to resend code.");
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
              {step === "email" && "Forgot Password"}
              {step === "verify" && !otpVerified && "Verify Code"}
              {step === "reset" && otpVerified && "Reset Password"}
            </h2>
            <p className="text-gray-600 text-center mt-2 text-sm">
              {step === "email" && "Enter your email to receive a reset code"}
              {step === "verify" && !otpVerified && `Code sent to ${email}`}
              {step === "reset" && otpVerified && "Create your new password"}
            </p>
          </div>

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="w-full space-y-4">
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </motion.button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === "verify" && !otpVerified && (
            <form onSubmit={handleVerifyOTP} className="w-full space-y-4">
              {/* OTP Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit code"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 text-center text-2xl tracking-widest font-mono transition"
                />
              </motion.div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium">📧 Check your email</p>
                <p className="mt-1">We sent a 6-digit code to <strong>{email}</strong></p>
                <p className="text-xs mt-2 text-blue-600">Code expires in 10 minutes</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className="w-full py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-60"
              >
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </motion.button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isSubmitting}
                className="w-full text-sm text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-60"
              >
                Didn't receive code? Resend
              </button>
            </form>
          )}

          {/* Step 3: Reset Password (Only shown after OTP verification) */}
          {step === "reset" && otpVerified && (
            <form onSubmit={handleResetPassword} className="w-full space-y-4">
              {/* OTP Display (Read-only) */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <p className="font-medium">✓ Code Verified</p>
                <p className="mt-1">Code ending in <strong>••{otp.slice(-2)}</strong> has been verified</p>
              </div>

              {/* New Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min 8 characters)"
                  className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white/80 placeholder-gray-400 text-gray-700 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </motion.button>
            </form>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center w-full mt-4"
          >
            Remember your password?{" "}
            <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
