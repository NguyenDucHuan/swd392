import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import AppRoutes from "./routes/Route";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
