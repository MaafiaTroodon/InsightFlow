import { Navbar } from './Navbar.jsx';

export function Layout({ children }) {
  return (
    <div className="min-h-screen overflow-x-hidden text-slate-100">
      <Navbar />
      <main className="grid-pattern pb-16 pt-8">{children}</main>
    </div>
  );
}
