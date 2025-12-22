// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token"); // or your auth state

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
