import { Navigate } from "react-router-dom";
import { useAppContext } from "../../store/AppContext";
import { useEffect, useState } from "react";
import SplashScreen from "../SplashScreen/SplashScreen";

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading: globalLoading, logout } = useAppContext();
  const [localLoading, setLocalLoading] = useState(true);

  // Enforce a 2-second loading screen
  useEffect(() => {
    const delay = setTimeout(() => {
      setLocalLoading(false);
    }, 2000);

    return () => clearTimeout(delay);
  }, []);

  // API key validation for protected routes
  useEffect(() => {
    if (requireAuth && isAuthenticated) {
      const storedApiKey = localStorage.getItem("serverApiKey");
      const expectedApiKey = storedApiKey; // Replace with actual check if needed

      if (!storedApiKey || storedApiKey !== expectedApiKey) {
        console.warn("⚠️ Invalid or missing API key. Logging out...");
        logout();
        return;
      }
    }
  }, [requireAuth, isAuthenticated, logout]);

  // Combine local and global loading
  if (globalLoading || localLoading) {
    return <SplashScreen />;
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If route doesn't require authentication (login page) but user is authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
