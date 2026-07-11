import React, { useContext, useMemo, useState, useEffect, useCallback } from "react";
import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/chatbot.css";

// A custom component for navigation
const NavigationComponent = ({ to, navigate }) => {
  useEffect(() => {
    if (navigate && to) {
      navigate(to);
    }
  }, [to, navigate]);

  return <div>Redirecting, please wait...</div>;
};

// A custom main menu component
const MainMenu = (props) => {
  const { triggerNextStep } = props;

  const handleClick = (trigger) => {
    triggerNextStep({ trigger });
  };

  return (
    <div>
      <p>How can I assist you today?</p>
      <button onClick={() => handleClick("faq")}>FAQ</button>
      <button onClick={() => handleClick("navigate")}>Navigate to a section</button>
      <button onClick={() => handleClick("support")}>Contact Support</button>
    </div>
  );
};

const ChatbotWidget = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  const theme = {
    background: "#f5f8fb",
    fontFamily: "Arial, Helvetica, sans-serif",
    headerBgColor: "#0d6efd",
    headerFontColor: "#fff",
    headerFontSize: "16px",
    botBubbleColor: "#0d6efd",
    botFontColor: "#fff",
    userBubbleColor: "#fff",
    userFontColor: "#4a4a4a",
  };

  const handleNavigation = useCallback(
    (path) => {
      toggleChat();
      navigate(path);
    },
    [navigate, toggleChat]
  );

  const role = user?.role || "Guest";

  const steps = useMemo(() => {
    const commonSteps = [
      {
        id: "greeting",
        message: `Hi ${user?.name || "there"}! Welcome to HealthMate.`,
        trigger: "main-menu",
      },
      {
        id: "main-menu",
        replace: true,
        component: <MainMenu />,
        asMessage: true,
        waitAction: true,
      },
      {
        id: "support",
        message: "You can contact support at support@healthmate.com or call +1-234-567-890.",
        trigger: "main-menu",
      },
      {
        id: "navigate",
        message: "Where would you like to go?",
        trigger:
          role === "User"
            ? "user-navigate-options"
            : role === "Doctor"
            ? "doctor-navigate-options"
            : role === "Admin"
            ? "admin-navigate-options"
            : "guest-no-navigation",
      },
      {
        id: "guest-no-navigation",
        message: "Navigation is not available for guests. Please sign up or log in.",
        trigger: "main-menu",
      },
    ];

    const roleSpecificSteps = {
      User: [
        {
          id: "faq",
          message: "What do you need help with?",
          trigger: "user-faq-options",
        },
        {
          id: "user-faq-options",
          options: [
            { value: "medication", label: "How to track medication?", trigger: "medication" },
            { value: "alerts", label: "How to manage alerts?", trigger: "alerts" },
            { value: "book", label: "How to book an appointment?", trigger: "book" },
          ],
        },
        {
          id: "medication",
          message: "You can track medication under the 'Medication' section of your dashboard.",
          trigger: "main-menu",
        },
        {
          id: "alerts",
          message: "Manage alerts in the 'Health Habits' section of your dashboard.",
          trigger: "main-menu",
        },
        {
          id: "book",
          message: "To book an appointment, go to the 'Doctors List' page.",
          trigger: "main-menu",
        },
        {
          id: "user-navigate-options",
          options: [
            { value: "dashboard", label: "Dashboard", trigger: "navigate-dashboard" },
            { value: "profile", label: "Profile", trigger: "navigate-profile" },
            { value: "doctors", label: "Doctors List", trigger: "navigate-doctors" },
          ],
        },
        {
          id: "navigate-dashboard",
          message: "Redirecting to Dashboard...",
          trigger: "perform-navigation-dashboard",
        },
        {
          id: "perform-navigation-dashboard",
          component: <NavigationComponent navigate={handleNavigation} to="/UserPage" />,
          asMessage: true,
          end: true,
        },
        {
          id: "navigate-profile",
          message: "Redirecting to Profile...",
          trigger: "perform-navigation-profile",
        },
        {
          id: "perform-navigation-profile",
          component: <NavigationComponent navigate={handleNavigation} to="/Profile" />,
          asMessage: true,
          end: true,
        },
        {
          id: "navigate-doctors",
          message: "Redirecting to Doctors List...",
          trigger: "perform-navigation-doctors",
        },
        {
          id: "perform-navigation-doctors",
          component: <NavigationComponent navigate={handleNavigation} to="/doctorslist" />,
          asMessage: true,
          end: true,
        },
      ],
      Doctor: [
        {
          id: "faq",
          message: "What do you need help with?",
          trigger: "doctor-faq-options",
        },
        {
          id: "doctor-faq-options",
          options: [
            { value: "patients", label: "How to manage patients?", trigger: "patients" },
            { value: "slots", label: "How to create appointment slots?", trigger: "slots" },
            { value: "reports", label: "How to access reports?", trigger: "reports" },
          ],
        },
        {
          id: "patients",
          message: "Manage your patients in the 'Patients List' section.",
          trigger: "main-menu",
        },
        {
          id: "slots",
          message: "To create slots, go to the 'Create Appointment' section.",
          trigger: "main-menu",
        },
        {
          id: "reports",
          message: "Access reports in the 'Reports & Prescriptions' section.",
          trigger: "main-menu",
        },
        {
          id: "doctor-navigate-options",
          options: [
            { value: "dashboard", label: "Dashboard", trigger: "navigate-doctor-dashboard" },
            { value: "appointments", label: "Appointments", trigger: "navigate-doctor-appointments" },
            { value: "patients", label: "Patients List", trigger: "navigate-doctor-patients" },
          ],
        },
        {
          id: "navigate-doctor-dashboard",
          message: "Redirecting to Dashboard...",
          trigger: "perform-navigation-doctor-dashboard",
        },
        {
          id: "perform-navigation-doctor-dashboard",
          component: <NavigationComponent navigate={handleNavigation} to="/DoctorPage" />,
          asMessage: true,
          end: true,
        },
        {
          id: "navigate-doctor-appointments",
          message: "Redirecting to Appointments...",
          trigger: "perform-navigation-doctor-appointments",
        },
        {
          id: "perform-navigation-doctor-appointments",
          component: <NavigationComponent navigate={handleNavigation} to="/AcceptedAppointments" />,
          asMessage: true,
          end: true,
        },
        {
          id: "navigate-doctor-patients",
          message: "Redirecting to Patients List...",
          trigger: "perform-navigation-doctor-patients",
        },
        {
          id: "perform-navigation-doctor-patients",
          component: <NavigationComponent navigate={handleNavigation} to="/Patients" />,
          asMessage: true,
          end: true,
        },
      ],
      Admin: [
        {
          id: "faq",
          message: "What do you need help with?",
          trigger: "admin-faq-options",
        },
        {
          id: "admin-faq-options",
          options: [
            { value: "manage", label: "How to manage users?", trigger: "manage" },
            { value: "appointments", label: "How to view appointments?", trigger: "appointments" },
            { value: "reports", label: "Where to find reports?", trigger: "admin-reports" },
          ],
        },
        {
          id: "manage",
          message: "Manage users in the 'Manage Users' section of the Admin Panel.",
          trigger: "main-menu",
        },
        {
          id: "appointments",
          message: "View all appointments in the 'Appointments' section of the Admin Panel.",
          trigger: "main-menu",
        },
        {
          id: "admin-reports",
          message: "Access reports in the 'Reports & Prescriptions' section.",
          trigger: "main-menu",
        },
        {
          id: "admin-navigate-options",
          options: [
            { value: "dashboard", label: "Dashboard", trigger: "navigate-admin-dashboard" },
            { value: "users", label: "Manage Users", trigger: "navigate-admin-users" },
            { value: "appointments", label: "View Appointments", trigger: "navigate-admin-appointments" },
          ],
        },
        {
          id: "navigate-admin-dashboard",
          message: "Redirecting to Dashboard...",
          trigger: "perform-navigation-admin-dashboard",
        },
        {
          id: "perform-navigation-admin-dashboard",
          component: <NavigationComponent navigate={handleNavigation} to="/AdminPage" />,
          asMessage: true,
          end: true,
        },
        {
          id: "navigate-admin-users",
          message: "Redirecting to Manage Users...",
          trigger: "perform-navigation-admin-users",
        },
        {
          id: "perform-navigation-admin-users",
          component: <NavigationComponent navigate={handleNavigation} to="/Admin/ManageUsers" />,
          asMessage: true,
          end: true,
        },
        {
          id: "navigate-admin-appointments",
          message: "Redirecting to Appointments...",
          trigger: "perform-navigation-admin-appointments",
        },
        {
          id: "perform-navigation-admin-appointments",
          component: <NavigationComponent navigate={handleNavigation} to="/admin/appointments" />,
          asMessage: true,
          end: true,
        },
      ],
      Guest: [
        {
          id: "faq",
          message: "What do you need help with?",
          trigger: "guest-faq-options",
        },
        {
          id: "guest-faq-options",
          options: [
            { value: "about", label: "What is HealthMate?", trigger: "about" },
            { value: "signup", label: "How to sign up?", trigger: "signup" },
          ],
        },
        {
          id: "about",
          message: "HealthMate is your personal health management assistant.",
          trigger: "main-menu",
        },
        {
          id: "signup",
          message: "You can sign up by visiting the signup page.",
          trigger: "main-menu",
        },
      ],
    };

    return [...commonSteps, ...(roleSpecificSteps[role] || [])];
  }, [user, role, handleNavigation]);

return (
    <div className="chatbot-widget">
      <button className="chatbot-toggle-btn" onClick={toggleChat}>
        {isOpen ? "Close Chat" : "Chat with us"}
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <ThemeProvider theme={theme}>
            <ChatBot steps={steps} floating={false} />
          </ThemeProvider>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
