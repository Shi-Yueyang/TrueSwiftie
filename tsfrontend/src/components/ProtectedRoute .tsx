import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContex";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  if (!userId) {
  // If the user is not authenticated, redirect to the login page
  return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the children components
  return <>{children}</>;
};

export default ProtectedRoute;