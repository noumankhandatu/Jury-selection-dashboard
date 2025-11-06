import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getUserOrganizationsApi, verifySubscriptionApi } from "@/api/api";

export default function SubscriptionSuccessPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify and activate subscription
    const verifySubscription = async () => {
      try {
        // Get session ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");

        if (!sessionId) {
          toast.error("Invalid session");
          window.location.href = "/dashboard";
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
        } else {
          toast.error("Organization not found");
          window.location.href = "/create-organization";
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
    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Activating Your Subscription...
            </h2>
            <p className="text-gray-600">
              Please wait while we set up your account
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl">
        <CardHeader className="text-center pb-6 pt-12">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Jury Duty SaaS! 🎉
          </CardTitle>
          <CardDescription className="text-lg">
            Your subscription is now active and your 14-day free trial has started
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pb-12">
          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3 text-lg">
              What's Next?
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Create your first case and add screening questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Import jurors or add them manually</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Start a live Q&A session with AI-powered assessments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Invite team members (Business plan only)</span>
              </li>
            </ul>
          </div>

          {/* Trial Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">
              Your 14-Day Free Trial
            </h3>
            <p className="text-purple-800 text-sm">
              You won't be charged until your trial ends. Cancel anytime from the billing settings.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-center text-sm text-gray-500">
            Need help getting started? Check out our{" "}
            <a href="/docs" className="text-blue-600 hover:underline">
              documentation
            </a>{" "}
            or{" "}
            <a href="mailto:support@jurydutysaas.com" className="text-blue-600 hover:underline">
              contact support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

