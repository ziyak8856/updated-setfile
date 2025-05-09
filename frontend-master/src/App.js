import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import CreateProject from "./components/CreateProject";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateNewSetfile from "./components/CreateNewSetfile";

const AuthRoute = ({ children }) => {
  const isAuth = localStorage.getItem("token") !== null;
  return isAuth ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect logged-in users away from the login page */}
        <Route path="/" element={<AuthRoute><Login /></AuthRoute>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/create-setfile" element={<CreateNewSetfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;