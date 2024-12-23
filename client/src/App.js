import React, { useState } from "react"; // Add this import to use useState
import { Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DoctorPage from "./pages/DoctorPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import Profile from "./pages/Profile";
import SignupPage from "./pages/SignupPage";
import CreateAppointments from "./pages/CreateAppointment";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProtectedRoute from "./context/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
import RedirectIfAuthenticated from "./context/RedirectIfAuthenticated";
import DoctorList from "./components/user/UserDoctorsList";
import AppointmentDetails from "./components/doctor/AppointmentDetails";
import Patients from "./components/doctor/Patients";
import AppointmentRequest from "./components/doctor/RequestedAppointments";
import AcceptedAppointments from "./components/doctor/AllAppointments";
import BookAppointment from "./components/user/BookAppointment";
import UserAppointments from "./components/user/UserAppointments";
import NotFoundPage from "./pages/NotFoundPage";
import FontSizeControl from "./components/common/FontSizeControl"; // Import FontSizeControl
import ManageUsers from "./components/admin/ManageUsers";
import ContactDetailsPage from "./components/admin/ContactDetails";
import AllAppointmentsPage from "./components/admin/AllAppointments";
import ChatbotWidget from "./components/common/ChatbotWidget";

function App() {
  const navigate = useNavigate();

  const [fontSize, setFontSize] = useState(16); // Default font size

  // Dynamically apply font size to the entire page
  const pageStyle = {
    fontSize: `${fontSize}px`,
  };

  return (
    <div className="App d-flex flex-column min-vh-100" style={pageStyle}>
      <Header />
      <div className="flex-grow-1">
        {/* Font size control component */}
        <FontSizeControl setFontSize={setFontSize} />

        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Redirect if authenticated */}
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <LoginPage navigate={navigate} />
              </RedirectIfAuthenticated>
            }
          />
          
          <Route
            path="/signup"
            element={
              <RedirectIfAuthenticated>
                <SignupPage />
              </RedirectIfAuthenticated>
            }
          />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected Routes */}
          <Route
            path="/AdminPage"
            element={
              <ProtectedRoute component={AdminPage} allowedRoles={["Admin"]} />
            }
          />
          <Route
            path="/DoctorPage"
            element={
              <ProtectedRoute
                component={DoctorPage}
                allowedRoles={["Doctor", "Admin"]}
              />
            }
          />
          <Route
            path="/Profile"
            element={
              <ProtectedRoute
                component={Profile}
                allowedRoles={["Doctor", "Admin", "User"]}
              />
            }
          />
          <Route
            path="/UserPage"
            element={
              <ProtectedRoute
                component={UserPage}
                allowedRoles={["User", "Admin"]}
              />
            }
          />
          <Route
            path="/doctorslist"
            element={
              <ProtectedRoute
                component={DoctorList}
                allowedRoles={["User", "Admin"]}
              />
            }
          />
          <Route
            path="/Patients"
            element={
              <ProtectedRoute
                component={Patients}
                allowedRoles={["Doctor", "Admin"]}
              />
            }
          />

          <Route
            path="/book-appointment/:doctorId"
            element={
              <ProtectedRoute
                component={BookAppointment}
                allowedRoles={["User", "Admin"]}
              />
            }
          />

          <Route
            path="/CreateAppointment"
            element={
              <ProtectedRoute
                component={CreateAppointments}
                allowedRoles={["Doctor", "Admin"]}
              />
            }
          />

          <Route
            path="/UserAppointments"
            element={
              <ProtectedRoute
                component={UserAppointments}
                allowedRoles={["User", "Admin"]}
              />
            }
          />

          <Route
            path="/Admin/ManageUsers"
            element={
              <ProtectedRoute
                component={ManageUsers}
                allowedRoles={["Admin"]}
              />
            }
          />

          <Route
            path="/RequestedAppointments"
            element={
              <ProtectedRoute
                component={AppointmentRequest}
                allowedRoles={["Doctor", "Admin"]}
              />
            }
          />

          <Route
            path="/AcceptedAppointments"
            element={
              <ProtectedRoute
                component={AcceptedAppointments}
                allowedRoles={["Doctor", "Admin"]}
              />
            }
          />

          <Route
            path="/appointment-details/:appointmentId/:slotId"
            element={
              <ProtectedRoute
                component={AppointmentDetails}
                allowedRoles={["Doctor", "Admin"]}
              />
            }
          />

          <Route
            path="/admin/Contact"
            element={
              <ProtectedRoute
                component={ContactDetailsPage}
                allowedRoles={["Admin"]}
              />
            }
          />

          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute
                component={AllAppointmentsPage}
                allowedRoles={["Admin"]}
              />
            }
          />

          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <ChatbotWidget />
      <Footer />
    </div>
  );
}

export default App;
