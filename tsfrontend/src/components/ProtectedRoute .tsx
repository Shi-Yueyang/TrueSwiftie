import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContex";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useContext(AuthContext);

  if (!userId) {
    // If the user is not authenticated, redirect to the home page
    return <Navigate to="/" />;
  }

  // If the user is authenticated, render the children components
  return <>{children}</>;
};

export default ProtectedRoute;