// src/components/Layout.jsx
import Footer from '../components/User/Footer';
import NavBar from '../components/User/NavBar';
export function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}