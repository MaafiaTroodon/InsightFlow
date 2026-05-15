import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

export function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <Topbar collapsed={collapsed} />
      <main className={`app-main ${collapsed ? 'sidebar-collapsed' : ''} relative`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[calc(100vh-60px)]"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
