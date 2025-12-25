import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/dashboard";
import AccountPage from "@/dashboard/account";
import Layout from "@/dashboard/layout";
import CreateCasePage from "@/dashboard/create-case";
import SearchCasePage from "@/dashboard/search-case";
import ManageJurorsPage from "@/dashboard/manage-jurors";
import LiveSessionPage from "@/dashboard/live-session";
import JurorAnalysisPage from "@/dashboard/juror-analysis";
import NotFoundPage from "@/pages/not-found";
import SessionAnalysisPage from "@/dashboard/session-analysis";
// SaaS Pages
import CreateOrganizationPage from "@/pages/create-organization";
import SubscriptionSelectPage from "@/pages/subscription/select";
import SubscriptionSuccessPage from "@/pages/subscription/success";
import SubscriptionCanceledPage from "@/pages/subscription/canceled";
import TokenPurchaseSuccessPage from "@/pages/tokens/purchase-success";
import TeamManagementPage from "@/dashboard/team-management";
import BillingPage from "@/dashboard/billing";
import AcceptInvitationPage from "@/pages/accept-invitation";
// Route Guards
import OrganizationGuard from "@/components/guards/OrganizationGuard";

const PrivateRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Dashboard Routes - Protected by OrganizationGuard */}
        {["/", "/dashboard"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <OrganizationGuard>
                <Layout>
                  <Dashboard />
                </Layout>
              </OrganizationGuard>
            }
          />
        ))}

        {/* Invitation Route (accessible to authenticated users) */}
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

        {/* Case Management Routes - Protected by OrganizationGuard */}
        <Route
          path="/dashboard/create-case"
          element={
            <OrganizationGuard>
              <Layout>
                <CreateCasePage />
              </Layout>
            </OrganizationGuard>
          }
        />
        <Route
          path="/dashboard/search-case"
          element={
            <OrganizationGuard>
              <Layout>
                <SearchCasePage />
              </Layout>
            </OrganizationGuard>
          }
        />

        {/* Juror Routes - Protected by OrganizationGuard */}
        <Route
          path="/dashboard/manage-jurors"
          element={
            <OrganizationGuard>
              <Layout>
                <ManageJurorsPage />
              </Layout>
            </OrganizationGuard>
          }
        />
        <Route
          path="/dashboard/juror-analysis"
          element={
            <OrganizationGuard>
              <Layout>
                <JurorAnalysisPage />
              </Layout>
            </OrganizationGuard>
          }
        />

        {/* Session Routes - Protected by OrganizationGuard */}
        <Route
          path="/dashboard/live-session"
          element={
            <OrganizationGuard>
              <Layout>
                <LiveSessionPage />
              </Layout>
            </OrganizationGuard>
          }
        />
        <Route
          path="/dashboard/session-analysis"
          element={
            <OrganizationGuard>
              <Layout>
                <SessionAnalysisPage />
              </Layout>
            </OrganizationGuard>
          }
        />

        {/* Account Routes - Protected by OrganizationGuard */}
        <Route
          path="/dashboard/account"
          element={
            <OrganizationGuard>
              <Layout>
                <AccountPage />
              </Layout>
            </OrganizationGuard>
          }
        />

        {/* SaaS Organization Routes */}
        <Route
          path="/create-organization"
          element={<CreateOrganizationPage />}
        />

        {/* SaaS Subscription Routes */}
        <Route
          path="/subscription/select"
          element={<SubscriptionSelectPage />}
        />
        <Route
          path="/subscription/success"
          element={<SubscriptionSuccessPage />}
        />
        <Route
          path="/subscription/canceled"
          element={<SubscriptionCanceledPage />}
        />

        {/* Token Purchase Success Route */}
        <Route
          path="/tokens/purchase-success"
          element={<TokenPurchaseSuccessPage />}
        />

        {/* SaaS Team Routes - Protected by OrganizationGuard (OWNER & ADMIN only) */}
        <Route
          path="/dashboard/team-management"
          element={
            <OrganizationGuard>
              <Layout>
                <TeamManagementPage />
              </Layout>
            </OrganizationGuard>
          }
        />

        {/* SaaS Billing Routes - Protected by OrganizationGuard (OWNER only) */}
        <Route
          path="/dashboard/billing"
          element={
            <OrganizationGuard>
              <Layout>
                <BillingPage />
              </Layout>
            </OrganizationGuard>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default PrivateRoutes;
