import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { acceptInvitationApi, getUserOrganizationsApi } from "@/api/api";
import { CheckCircle2, Loader2, UserPlus, XCircle } from "lucide-react";
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
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Loading Invitation...
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center pb-6 pt-12">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Invitation
            </CardTitle>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
          <CardContent className="pb-12">
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl">
        <CardHeader className="text-center pb-6 pt-12">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <UserPlus className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            You've Been Invited! 🎉
          </CardTitle>
          <CardDescription className="text-lg">
            You've been invited to join an organization on Jury Duty SaaS
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-12">
          {/* Invitation Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              What happens next?
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>You'll gain access to all cases, jurors, and sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Collaborate with your team on jury selection</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Use AI-powered assessments and analytics</span>
              </li>
            </ul>
          </div>

          {/* Accept Button */}
          <Button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
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

          <p className="text-center text-sm text-gray-500">
            By accepting, you agree to join this organization and access its resources
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

