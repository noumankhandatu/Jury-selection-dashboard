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
import TeamManagementPage from "@/dashboard/team-management";
import BillingPage from "@/dashboard/billing";
import AcceptInvitationPage from "@/pages/accept-invitation";

const PrivateRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Dashboard Routes */}
        {["/", "/dashboard"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
        ))}
        
        {/* Invitation Route (accessible to authenticated users) */}
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        
        {/* Case Management Routes */}
        <Route
          path="/dashboard/create-case"
          element={
            <Layout>
              <CreateCasePage />
            </Layout>
          }
        />
        <Route
          path="/dashboard/search-case"
          element={
            <Layout>
              <SearchCasePage />
            </Layout>
          }
        />
        
        {/* Juror Routes */}
        <Route
          path="/dashboard/manage-jurors"
          element={
            <Layout>
              <ManageJurorsPage />
            </Layout>
          }
        />
        <Route
          path="/dashboard/juror-analysis"
          element={
            <Layout>
              <JurorAnalysisPage />
            </Layout>
          }
        />
        
        {/* Session Routes */}
        <Route
          path="/dashboard/live-session"
          element={
            <Layout>
              <LiveSessionPage />
            </Layout>
          }
        />
        <Route
          path="/dashboard/session-analysis"
          element={
            <Layout>
              <SessionAnalysisPage />
            </Layout>
          }
        />
        
        {/* Account Routes */}
        <Route
          path="/dashboard/account"
          element={
            <Layout>
              <AccountPage />
            </Layout>
          }
        />

        {/* SaaS Organization Routes */}
        <Route path="/create-organization" element={<CreateOrganizationPage />} />
        
        {/* SaaS Subscription Routes */}
        <Route path="/subscription/select" element={<SubscriptionSelectPage />} />
        <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
        <Route path="/subscription/canceled" element={<SubscriptionCanceledPage />} />
        
        {/* SaaS Team Routes (OWNER & ADMIN only) */}
        <Route
          path="/dashboard/team-management"
          element={
            <Layout>
              <TeamManagementPage />
            </Layout>
          }
        />
        
        {/* SaaS Billing Routes (OWNER only) */}
        <Route
          path="/dashboard/billing"
          element={
            <Layout>
              <BillingPage />
            </Layout>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default PrivateRoutes;
