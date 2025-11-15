import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { acceptInvitationApi, getUserOrganizationsApi } from "@/api/api";
import { CheckCircle2, Loader2, UserPlus, XCircle, Sparkles, Users, FileText, Brain, Shield } from "lucide-react";
import axios from "axios";

export default function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn) {
      // Redirect to team signup page with token
      navigate(`/signup/team?token=${token}`);
      return;
    }

    // If logged in, fetch invitation details (we'll just show accept button)
    setLoading(false);
  }, [token, isLoggedIn, navigate]);

  const handleAccept = async () => {
    if (!token) {
      toast.error("Invalid invitation token");
      return;
    }

    setAccepting(true);

    try {
      await acceptInvitationApi(token);
      
      toast.success("Invitation accepted successfully!");
      
      // Fetch updated organizations
      const orgsResponse = await getUserOrganizationsApi();
      const organizations = orgsResponse.organizations;

      if (organizations && organizations.length > 0) {
        // Find the newly joined organization
        const newOrg = organizations[organizations.length - 1];
        
        localStorage.setItem("organizationId", newOrg.id);
        localStorage.setItem("organizationName", newOrg.name);
        localStorage.setItem("userRole", newOrg.memberRole);

        // Check if organization has active subscription
        try {
          const token = localStorage.getItem("token");
          const subResponse = await axios.get(
            `${import.meta.env.VITE_BASEURL}/subscriptions/${newOrg.id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          const subscription = subResponse.data.subscription;
          
          if (subscription && (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING')) {
            // Organization has active subscription - go to dashboard
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 1500);
          } else {
            // No active subscription - should not happen for invited members
            toast.warning("Organization subscription is not active. Contact the owner.");
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 2000);
          }
        } catch (subError) {
          console.error("Error checking subscription:", subError);
          // Continue to dashboard anyway - let the org owner handle subscription
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        }
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      const errorMsg = error.response?.data?.error || "Failed to accept invitation";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setAccepting(false);
    }
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
              Loading Invitation...
            </h2>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="text-center pb-6 pt-12 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border-b border-red-100">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative mx-auto w-20 h-20 mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-500 rounded-full shadow-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-white" />
            </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
              Invalid Invitation
            </CardTitle>
              <CardDescription className="text-base text-gray-600">{error}</CardDescription>
          </CardHeader>
            <CardContent className="p-8">
            <Button
              onClick={() => navigate("/dashboard")}
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    );
  }

  const benefits = [
    {
      icon: FileText,
      text: "You'll gain access to all cases, jurors, and sessions",
      color: "blue",
    },
    {
      icon: Users,
      text: "Collaborate with your team on jury selection",
      color: "indigo",
    },
    {
      icon: Brain,
      text: "Use AI-powered assessments and analytics",
      color: "purple",
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
          <CardHeader className="text-center pb-8 pt-12 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-24 h-24 mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-full shadow-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-14 h-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
            </motion.div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            You've Been Invited! 🎉
          </CardTitle>
            <CardDescription className="text-lg text-gray-600">
            You've been invited to join an organization on Jury Duty SaaS
          </CardDescription>
        </CardHeader>

          <CardContent className="p-8 space-y-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* What happens next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg"
            >
              <h3 className="font-bold text-blue-900 mb-4 text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
              What happens next?
            </h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  const colorClasses = {
                    blue: "from-blue-500 to-blue-600",
                    indigo: "from-indigo-500 to-indigo-600",
                    purple: "from-purple-500 to-purple-600",
                  };
                  
                  return (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 bg-gradient-to-br ${colorClasses[benefit.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-blue-900 font-medium text-base leading-relaxed group-hover:text-blue-950 transition-colors">
                        {benefit.text}
                      </span>
                    </motion.li>
                  );
                })}
            </ul>
            </motion.div>

          {/* Accept Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
          <Button
            onClick={handleAccept}
            disabled={accepting}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            {accepting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Accepting Invitation...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Accept Invitation
              </>
            )}
          </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2"
            >
              <Shield className="w-4 h-4 text-gray-400" />
              <span>By accepting, you agree to join this organization and access its resources</span>
            </motion.div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}

