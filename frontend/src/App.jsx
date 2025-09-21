import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AllContractsPage from "./pages/AllContractsPage";
import AppLayout from "./components/AppLayout";

// This component checks if a user is logged in.
// If yes, it shows the AppLayout with the page content inside (Outlet).
// If not, it redirects them to the login page.
const ProtectedRoutes = () => {
  const token = localStorage.getItem("token");
  return token ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/contracts" element={<AllContractsPage />} />
        {/* You can add more protected pages here later, like /contracts */}
      </Route>
    </Routes>
  );
}

export default App;
