import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/Route";
import 'font-awesome/css/font-awesome.min.css';


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