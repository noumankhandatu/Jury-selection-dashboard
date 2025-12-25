import { useEffect, useState, useRef } from "react";
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
  Coins,
  Sparkles,
  Zap,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { verifyTokenPackPurchaseApi } from "@/api/api";

interface PurchaseDetails {
  packName: string;
  tokensAmount: number;
  price: number;
  currency: string;
  status: string;
}

interface NewBalance {
  purchasedTokensRemaining: number;
  purchasedTokensTotal: number;
}

const formatTokens = (tokens: number): string => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K`;
  }
  return tokens.toLocaleString();
};

export default function TokenPurchaseSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);
  const [newBalance, setNewBalance] = useState<NewBalance | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent double API calls in React StrictMode
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPurchase = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");

        if (!sessionId) {
          setError("Invalid session");
          setLoading(false);
          return;
        }

        const response = await verifyTokenPackPurchaseApi(sessionId);

        // Check if we have a purchase object (both first call and "already completed" return it)
        if (response.purchase) {
          setPurchaseDetails(response.purchase);
          setNewBalance(response.newBalance || null);
          toast.success("Token purchase successful!");
        } else {
          setError(response.message || "Purchase verification failed");
        }
      } catch (err: any) {
        console.error("Error verifying purchase:", err);
        const errorMsg = err?.response?.data?.message || "Failed to verify purchase";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    verifyPurchase();
  }, []);

  const handleContinue = () => {
    window.location.href = "/dashboard/billing";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
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
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl">
                  <Loader2 className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Verifying Your Purchase...
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your token purchase
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6 pt-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-xl mb-4"
              >
                <XCircle className="w-12 h-12 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Purchase Verification Failed
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <Button
                onClick={handleContinue}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800"
              >
                Go to Billing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Header Section */}
          <CardHeader className="text-center pb-8 pt-12 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-b border-amber-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-24 h-24 mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3">
              Purchase Successful!
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Your tokens have been added to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Purchase Details */}
            {purchaseDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg"
              >
                <h3 className="font-bold text-amber-900 mb-4 text-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-600" />
                  Purchase Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pack Purchased</span>
                    <span className="font-semibold text-gray-900">
                      {purchaseDetails.packName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tokens Added</span>
                    <span className="font-semibold text-amber-600">
                      +{formatTokens(purchaseDetails.tokensAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-semibold text-gray-900">
                      ${purchaseDetails.price} {purchaseDetails.currency.toUpperCase()}
                    </span>
                  </div>
                  {newBalance && (
                    <div className="border-t border-amber-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">New Token Balance</span>
                        <span className="font-bold text-lg text-green-600">
                          {formatTokens(newBalance.purchasedTokensRemaining)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Ready to Use</h4>
                  <p className="text-blue-800 text-sm">
                    Your purchased tokens are now available and will be used after your
                    monthly subscription tokens are depleted. They never expire!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={handleContinue}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Continue to Billing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
