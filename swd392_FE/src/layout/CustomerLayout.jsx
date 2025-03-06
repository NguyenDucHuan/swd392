// src/components/Layout.jsx
import NavBar from '../components/User/NavBar';

export function CustomerLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <NavBar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}