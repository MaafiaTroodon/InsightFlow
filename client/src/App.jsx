import { Navigate, Route, Routes, useParams } from 'react-router-dom';

function DashboardRedirect() {
  const { id } = useParams();
  return <Navigate to={`/app/dashboard/${id}`} replace />;
}
import { Suspense, lazy } from 'react';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Layout } from './components/Layout.jsx';

// Public pages
import { HomePage }     from './pages/HomePage.jsx';
import { LoginPage }    from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { UploadPage }   from './pages/UploadPage.jsx';
import { HistoryPage }  from './pages/HistoryPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';

// Enterprise app pages
import { ExecutiveDashboard } from './pages/ExecutiveDashboard.jsx';
import { ProjectsPage }        from './pages/ProjectsPage.jsx';
import { ProjectDetailPage }   from './pages/ProjectDetailPage.jsx';
import { AccountantPage }      from './pages/AccountantPage.jsx';
import { AnalyticsPage }       from './pages/AnalyticsPage.jsx';
import { NotificationsPage }   from './pages/NotificationsPage.jsx';
import QuickBooksPage           from './pages/QuickBooksPage.jsx';
import JobLogsPage              from './pages/JobLogsPage.jsx';
import PdfExtractPage           from './pages/PdfExtractPage.jsx';
import InvoiceGeneratorPage     from './pages/InvoiceGeneratorPage.jsx';
import { ConstructionPage }      from './pages/ConstructionPage.jsx';
import { ConstructionProjectDetailPage } from './pages/ConstructionProjectDetailPage.jsx';

function AppSkeleton() {
  return (
    <div className="flex items-center justify-center h-screen bg-canvas">
      <div className="space-y-3 text-center">
        <div className="h-10 w-10 rounded-xl bg-brand-500/15 animate-pulse mx-auto" />
        <div className="h-2 w-24 rounded-full bg-white/5 animate-pulse mx-auto" />
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public routes — use old Layout with Navbar */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Legacy data routes — redirect into the app */}
      <Route path="/upload"        element={<Navigate to="/app/upload"  replace />} />
      <Route path="/history"       element={<Navigate to="/app/history" replace />} />
      <Route path="/dashboard/:id" element={<DashboardRedirect />} />

      {/* Enterprise app — protected, use AppLayout (sidebar) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/app"
          element={<AppLayout><Navigate to="/app/executive" replace /></AppLayout>}
        />
        <Route
          path="/app/executive"
          element={<AppLayout><ExecutiveDashboard /></AppLayout>}
        />
        <Route
          path="/app/projects"
          element={<AppLayout><ProjectsPage /></AppLayout>}
        />
        <Route
          path="/app/projects/:id"
          element={<AppLayout><ProjectDetailPage /></AppLayout>}
        />
        <Route
          path="/app/accountant"
          element={<AppLayout><AccountantPage /></AppLayout>}
        />
        <Route
          path="/app/construction"
          element={<AppLayout><ConstructionPage /></AppLayout>}
        />
        <Route
          path="/app/construction/projects/:id"
          element={<AppLayout><ConstructionProjectDetailPage /></AppLayout>}
        />
        <Route
          path="/app/analytics"
          element={<AppLayout><AnalyticsPage /></AppLayout>}
        />
        <Route
          path="/app/notifications"
          element={<AppLayout><NotificationsPage /></AppLayout>}
        />
        <Route
          path="/app/quickbooks"
          element={<AppLayout><QuickBooksPage /></AppLayout>}
        />
        <Route
          path="/app/job-logs"
          element={<AppLayout><JobLogsPage /></AppLayout>}
        />
        <Route
          path="/app/pdf"
          element={<AppLayout><PdfExtractPage /></AppLayout>}
        />
        <Route
          path="/app/invoices"
          element={<AppLayout><InvoiceGeneratorPage /></AppLayout>}
        />
        <Route
          path="/app/upload"
          element={<AppLayout><UploadPage /></AppLayout>}
        />
        <Route
          path="/app/history"
          element={<AppLayout><HistoryPage /></AppLayout>}
        />
        <Route
          path="/app/dashboard/:id"
          element={<AppLayout><DashboardPage /></AppLayout>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
