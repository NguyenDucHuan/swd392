// src/components/Layout.jsx
import NavBar from "../components/Manager/ManagerNavbar";
import Sidebar from "../components/Manager/ManegerSidebar";

export function ManagerLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <NavBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
