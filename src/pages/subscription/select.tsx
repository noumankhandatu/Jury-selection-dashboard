import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createCheckoutSessionApi } from "@/api/api";
import { Check, Loader2, CreditCard, Users, Briefcase, Sparkles } from "lucide-react";

type Plan = "STANDARD" | "BUSINESS";

export default function SubscriptionSelectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("BUSINESS");

  useEffect(() => {
    // Check if plan was pre-selected from marketing site
    const preSelected = localStorage.getItem("selectedPlan");
    if (preSelected && (preSelected === "STANDARD" || preSelected === "BUSINESS")) {
      setSelectedPlan(preSelected as Plan);
    }
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    const organizationId = localStorage.getItem("organizationId");

    if (!organizationId) {
      toast.error("Organization not found. Please create an organization first.");
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
      toast.error(error.response?.data?.error || "Failed to create checkout session");
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
        "1 team member (just you)",
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
        "Up to 3 team members",
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            Choose Your Plan
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Start Your 14-Day Free Trial
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No credit card required • Cancel anytime • Full access to all features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative border-2 transition-all duration-300 hover:shadow-2xl ${
                  plan.popular
                    ? "border-blue-600 shadow-xl scale-105"
                    : "border-gray-200 hover:border-blue-400"
                } ${isSelected ? "ring-4 ring-blue-300" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-1 text-sm font-semibold shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1 inline" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-10">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    plan.popular ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gray-200"
                  }`}>
                    <Icon className={`w-8 h-8 ${plan.popular ? "text-white" : "text-gray-600"}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500 text-lg">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading}
                    className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
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
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    Secure payment powered by Stripe
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Have questions? <a href="mailto:support@jurydutysaas.com" className="text-blue-600 hover:underline">Contact us</a>
          </p>
          <p className="text-sm text-gray-500">
            All plans include our 14-day free trial. No credit card required to start.
          </p>
        </div>
      </div>
    </div>
  );
}

