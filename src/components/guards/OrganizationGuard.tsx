import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface OrganizationGuardProps {
  children: React.ReactNode;
}

/**
 * OrganizationGuard - Protects routes that require an organization
 * 
 * Checks if user has an organizationId in localStorage
 * If not, redirects to /create-organization
 */
const OrganizationGuard = ({ children }: OrganizationGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasOrganization, setHasOrganization] = useState(false);

  useEffect(() => {
    const checkOrganization = () => {
      // Get organization info from localStorage
      const organizationId = localStorage.getItem("organizationId");
      const organizationName = localStorage.getItem("organizationName");

      // Check if user has an organization
      if (!organizationId || !organizationName) {
        // User doesn't have an organization
        setHasOrganization(false);
        setIsChecking(false);
        
        // Redirect to create-organization page
        // Only redirect if not already on allowed pages
        const allowedPaths = [
          "/create-organization",
          "/subscription/select",
          "/subscription/success",
          "/subscription/canceled",
          "/accept-invitation",
        ];
        
        if (!allowedPaths.some(path => location.pathname.startsWith(path))) {
          navigate("/create-organization", { replace: true });
        }
      } else {
        // User has an organization
        setHasOrganization(true);
        setIsChecking(false);
      }
    };

    checkOrganization();
  }, [navigate, location.pathname]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying organization...</p>
        </div>
      </div>
    );
  }

  // If no organization, don't render children (will redirect)
  if (!hasOrganization) {
    return null;
  }

  // User has organization, render the protected content
  return <>{children}</>;
};

export default OrganizationGuard;
