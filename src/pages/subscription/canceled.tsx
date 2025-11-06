import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Mail } from "lucide-react";

export default function SubscriptionCanceledPage() {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate("/subscription/select");
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:support@jurydutysaas.com?subject=Subscription Help";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl">
        <CardHeader className="text-center pb-6 pt-12">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-orange-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Payment Canceled
          </CardTitle>
          <CardDescription className="text-lg">
            Your subscription setup was not completed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-12">
          {/* Info Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <p className="text-orange-900 mb-4">
              It looks like you canceled the payment process. Don't worry, no charges were made to your account.
            </p>
            <p className="text-orange-800 text-sm">
              You can try again anytime, or contact our support team if you need assistance.
            </p>
          </div>

          {/* Why Subscribe? */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              Why Subscribe to Jury Duty SaaS?
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>AI-powered jury assessment saves hours of manual work</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Team collaboration features for law firms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>14-day free trial - no commitment required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Cancel anytime with no penalties</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleTryAgain}
              className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={handleContactSupport}
              variant="outline"
              className="flex-1 h-12 text-base font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
          </div>

          {/* Additional Help */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 mb-2">
              Have questions about pricing or features?
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="/pricing"
                className="text-blue-600 hover:underline"
              >
                View Pricing
              </a>
              <span className="text-gray-400">•</span>
              <a
                href="/features"
                className="text-blue-600 hover:underline"
              >
                See Features
              </a>
              <span className="text-gray-400">•</span>
              <a
                href="mailto:support@jurydutysaas.com"
                className="text-blue-600 hover:underline"
              >
                Email Us
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

