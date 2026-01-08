import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createCheckoutSessionApi } from "@/api/api";
import {
  Check,
  Loader2,
  CreditCard,
  Users,
  Briefcase,
  Sparkles,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Building2,
} from "lucide-react";

type Plan = "STANDARD" | "BUSINESS" | "ENTERPRISE";

export default function SubscriptionSelectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("BUSINESS");

  useEffect(() => {
    // Check if plan was pre-selected from marketing site
    const preSelected = localStorage.getItem("selectedPlan");
    if (
      preSelected &&
      (preSelected === "STANDARD" || preSelected === "BUSINESS")
    ) {
      setSelectedPlan(preSelected as Plan);
    }
    // Note: Enterprise plan cannot be pre-selected as it's coming soon
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    // Enterprise plan is coming soon
    if (plan === "ENTERPRISE") {
      toast.info("Enterprise plan is coming soon! Contact sales for more information.");
      return;
    }

    const organizationId = localStorage.getItem("organizationId");

    if (!organizationId) {
      toast.error(
        "Organization not found. Please create an organization first."
      );
      navigate("/create-organization");
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);

    try {
      const response = await createCheckoutSessionApi({
        plan,
        organizationId,
      });

      // Clear pre-selected plan
      localStorage.removeItem("selectedPlan");

      // Redirect to Stripe checkout
      if (response.url) {
        window.location.href = response.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast.error(
        error.response?.data?.error || "Failed to create checkout session"
      );
      setLoading(false);
    }
  };

  const plans = [
    {
      id: "STANDARD" as Plan,
      name: "Standard Plan",
      price: 29,
      description: "Perfect for solo practitioners",
      icon: Briefcase,
      popular: false,
      features: [
        "Owner only (no team members)",
        "3M AI tokens/month",
        "Unlimited cases",
        "Unlimited jurors",
        "AI-powered jury assessment",
        "Live Q&A sessions",
        "Session analytics",
        "Email notifications",
        "14-day free trial",
      ],
    },
    {
      id: "BUSINESS" as Plan,
      name: "Business Plan",
      price: 79,
      description: "Ideal for law firms and teams",
      icon: Users,
      popular: true,
      features: [
        "Up to 4 team members (plus owner)",
        "15M AI tokens/month",
        "Unlimited cases",
        "Unlimited jurors",
        "AI-powered jury assessment",
        "Live Q&A sessions",
        "Session analytics",
        "Team collaboration",
        "Activity logs & audit trails",
        "Email & push notifications",
        "Priority support",
        "14-day free trial",
      ],
    },
    {
      id: "ENTERPRISE" as Plan,
      name: "Enterprise Plan",
      price: "Custom",
      description: "For large organizations",
      icon: Building2,
      popular: false,
      comingSoon: true,
      features: [
        "Unlimited team members",
        "Custom integrations",
        "Dedicated support",
        "White-label options",
        "On-premise deployment",
        "Custom AI training",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-1.5 text-sm font-semibold">
              <Sparkles className="w-3 h-3 mr-1.5 inline" />
              Choose Your Plan
            </Badge>
          </motion.div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Select Your Subscription Plan
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Start with a 14-day free
            trial and explore all features risk-free.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 max-w-2xl mx-auto mb-6">
            <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
              <Shield className="w-5 h-5" />
              <span>You won't be charged until after your free trial ends</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-lg text-gray-600 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              <span>Full access to all features</span>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                <Card
                  className={`relative border-none shadow-2xl transition-all duration-300 overflow-hidden ${
                    plan.popular
                      ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 scale-105"
                      : plan.comingSoon
                      ? "bg-white/70 backdrop-blur-sm opacity-90"
                      : "bg-white/90 backdrop-blur-sm"
                  } ${
                    isSelected ? "ring-4 ring-blue-300 ring-opacity-50" : ""
                  }`}
                >
                  <CardHeader
                    className={`text-center pb-6 pt-12 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100"
                        : ""
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.4 + index * 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className={`relative mx-auto w-20 h-20 mb-6 ${
                        plan.popular ? "" : ""
                      }`}
                    >
                      <div
                        className={`absolute inset-0 rounded-full ${
                          plan.popular
                            ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-xl"
                            : "bg-gradient-to-br from-gray-300 to-gray-400"
                        }`}
                      ></div>
                      <div
                        className={`absolute inset-0 rounded-full flex items-center justify-center ${
                          plan.popular
                            ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}
                      >
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      {plan.popular && (
                        <div className="absolute -top-1 -right-1">
                          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                        </div>
                      )}
                      {plan.comingSoon && (
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold shadow-lg">
                            Coming Soon
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2 text-gray-600">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-8">
                      {typeof plan.price === "number" ? (
                        <>
                          <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ${plan.price}
                          </span>
                          <span className="text-gray-500 text-xl ml-2">/month</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {plan.price}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 space-y-8">
                    {/* Features List */}
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.5 + index * 0.1 + featureIndex * 0.05,
                          }}
                          className="flex items-start gap-3 group"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                              <Check className="w-4 h-4 text-white font-bold" />
                            </div>
                          </div>
                          <span className="text-gray-700 text-base leading-relaxed group-hover:text-gray-900 transition-colors">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {plan.comingSoon ? (
                        <Button
                          onClick={() => handleSelectPlan(plan.id)}
                          disabled
                          className="group w-full h-14 text-base font-bold transition-all duration-300 cursor-not-allowed opacity-60 bg-gray-200 border-2 border-gray-300 text-gray-500"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Coming Soon
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSelectPlan(plan.id)}
                          disabled={loading}
                          className={`group w-full h-14 text-base font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl ${
                            plan.popular
                              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white"
                              : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-700"
                          }`}
                        >
                          {loading && isSelected ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              Start Free Trial
                              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      )}
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span>Secure payment powered by Stripe</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
