import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { ArchitecturePage } from './pages/ArchitecturePage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { HistoryPage } from './pages/HistoryPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { UploadPage } from './pages/UploadPage.jsx';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard/:id" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
