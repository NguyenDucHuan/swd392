import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/Route";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;