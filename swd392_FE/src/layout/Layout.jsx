// src/components/Layout.jsx
import NavBar from '../components/NavBar'
import Sidebar from '../components/Sidebar'

export function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <NavBar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}