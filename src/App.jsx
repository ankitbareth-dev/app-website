import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/Auth/Auth";
import Dashboard from "./components/Dashboard/Dashboard";
import CheckIn from "./components/Attendance/Attendance";
import Profile from "./components/Profile/Profile";
import AttendanceHistory from "./components/AttendanceHistory/AttendanceHistory";
import Expenses from "./components/Expenses/Expenses";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ManualAttendance from "./components/ManualAttendance/ManualAttendance";

import Navbar from "./components/Navbar/Navbar";
import Incident from "./components/Incidents/Incident";
import TicketTable from "./components/Tickets/TicketTable";
import About from "./components/About/About";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route - only accessible when not authenticated */}
        <Route
          path="/"
          element={
            <ProtectedRoute requireAuth={false}>
              <Auth />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - only accessible when authenticated */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute requireAuth={true}>
              <CheckIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manual-attendance"
          element={
            <ProtectedRoute requireAuth={true}>
              <ManualAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth={true}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute requireAuth={true}>
              <Navbar />
              <TicketTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute requireAuth={true}>
              <Navbar />
              <Incident />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance-history"
          element={
            <ProtectedRoute requireAuth={true}>
              <AttendanceHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute requireAuth={true}>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute requireAuth={true}>
              <Navbar />
              <About />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
