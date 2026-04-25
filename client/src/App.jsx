import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ArchitecturePage } from './pages/ArchitecturePage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { HistoryPage } from './pages/HistoryPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { UploadPage } from './pages/UploadPage.jsx';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard/:id" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
