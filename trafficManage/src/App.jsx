import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import HomePage from "./HomePage";
import Dashboard from "./Dashboard";
import Monitoring from "./Monitoring";
import Login from "./Login";
import Signup from "./Signup";
import ProtectedRoute from "./middleware/ProtectedRoute";

export default function App() {
  const location = useLocation();

  return (
    <div className="app">
      {/* Show video ONLY on /monitoring */}
      {location.pathname === "/monitoring" && (
        <div className="block">
          <video
            id="monitor-player"
            controls
            autoPlay
            muted
            loop
            className="w-[640px] h-[360px] object-cover"
            src={`${import.meta.env.VITE_API_URL}/video`} 
          />
        </div>
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/monitoring"
          element={
            <ProtectedRoute>
              <Monitoring />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
