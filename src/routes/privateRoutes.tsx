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

const PrivateRoutes = () => {
  return (
    <Router>
      <Routes>
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
        <Route
          path="/dashboard/create-case"
          element={
            <Layout>
              <CreateCasePage />
            </Layout>
          }
        />
        <Route
          path="/dashboard/account"
          element={
            <Layout>
              <AccountPage />
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
        <Route
          path="/dashboard/session-analysis"
          element={
            <Layout>
              <SessionAnalysisPage />
            </Layout>
          }
        />

       
        <Route
          path="/dashboard/live-session"
          element={
            <Layout>
              <LiveSessionPage />
            </Layout>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default PrivateRoutes;
