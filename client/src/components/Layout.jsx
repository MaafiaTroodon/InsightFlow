import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';

export function Layout({ children }) {
  return (
    <div className="min-h-screen overflow-x-hidden text-slate-100 bg-canvas">
      <Navbar />
      <main className="bg-grid pb-16 pt-8">{children || <Outlet />}</main>
    </div>
  );
}
