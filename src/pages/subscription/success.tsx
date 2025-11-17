import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  FileText,
  Users,
  MessageSquare,
  UserPlus,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { getUserOrganizationsApi, verifySubscriptionApi } from "@/api/api";

export default function SubscriptionSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  useEffect(() => {
    // Get returnTo from URL
    const urlParams = new URLSearchParams(window.location.search);
    const returnToParam = urlParams.get("returnTo");
    setReturnTo(returnToParam);

    // Verify and activate subscription
    const verifySubscription = async () => {
      try {
        // Get session ID from URL
        const sessionId = urlParams.get("session_id");

        if (!sessionId) {
          toast.error("Invalid session");
          window.location.href = returnToParam || "/dashboard";
          return;
        }

        // Call backend to verify and activate subscription
        await verifySubscriptionApi(sessionId);

        // Get updated organizations
        const response = await getUserOrganizationsApi();
        const organizations = response.organizations;

        if (organizations && organizations.length > 0) {
          const org = organizations[0];

          // Update localStorage
          localStorage.setItem("organizationId", org.id);
          localStorage.setItem("organizationName", org.name);
          localStorage.setItem("userRole", org.memberRole);

          setLoading(false);
          toast.success("Your subscription is now active!");

          // Redirect to returnTo URL if provided, otherwise stay on success page
          if (returnToParam) {
            setTimeout(() => {
              window.location.href = returnToParam;
            }, 2000); // Show success message for 2 seconds then redirect
          }
        } else {
          toast.error("Organization not found");
          window.location.href = returnToParam || "/create-organization";
        }
      } catch (error) {
        console.error("Error verifying subscription:", error);
        toast.error("Failed to activate subscription");
        setLoading(false);
      }
    };

    verifySubscription();
  }, []);

  const handleContinue = () => {
    window.location.href = returnTo || "/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md border-none shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
                  <Loader2 className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Activating Your Subscription...
              </h2>
              <p className="text-gray-600">
                Please wait while we set up your account
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const nextSteps = [
    {
      icon: FileText,
      text: "Create your first case and add screening questions",
      color: "blue",
    },
    {
      icon: Users,
      text: "Import jurors or add them manually",
      color: "indigo",
    },
    {
      icon: MessageSquare,
      text: "Start a live Q&A session with AI-powered assessments",
      color: "purple",
    },
    {
      icon: UserPlus,
      text: "Invite team members (Business plan only)",
      color: "pink",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Header Section */}
          <CardHeader className="text-center pb-8 pt-12 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-green-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-24 h-24 mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </motion.div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
              Welcome to Jury AI! 🎉
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Your subscription is now active and your 14-day free trial has
              started
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 space-y-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* What's Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg"
            >
              <h3 className="font-bold text-blue-900 mb-4 text-xl flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                What's Next?
              </h3>
              <ul className="space-y-3">
                {nextSteps.map((step, index) => {
                  const Icon = step.icon;
                  const colorClasses = {
                    blue: "from-blue-500 to-blue-600",
                    indigo: "from-indigo-500 to-indigo-600",
                    purple: "from-purple-500 to-purple-600",
                    pink: "from-pink-500 to-pink-600",
                  };

                  return (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <div
                        className={`mt-0.5 flex-shrink-0 w-8 h-8 bg-gradient-to-br ${
                          colorClasses[step.color as keyof typeof colorClasses]
                        } rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-blue-900 font-medium text-base leading-relaxed group-hover:text-blue-950 transition-colors">
                        {step.text}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Trial Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-900 mb-2 text-lg">
                    Your 14-Day Free Trial
                  </h3>
                  <p className="text-purple-800 text-sm leading-relaxed">
                    You won't be charged until your trial ends. Cancel anytime
                    from the billing settings.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={handleContinue}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center text-sm text-gray-600 pt-2"
            >
              Need help getting started? Check out our{" "}
              <a
                href="/docs"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                documentation
              </a>{" "}
              or{" "}
              <a
                href="mailto:support@jurydutysaas.com"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                contact support
              </a>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
