import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../css/chatbot.css";

const roleFaqs = {
  User: [
    {
      label: "Track medication",
      response: "You can track medication under the Medication section of your dashboard.",
    },
    {
      label: "Manage alerts",
      response: "Manage alerts in the Health Habits section of your dashboard.",
    },
    {
      label: "Book appointment",
      response: "To book an appointment, open Doctors List and choose an available time slot.",
    },
  ],
  Doctor: [
    {
      label: "Manage patients",
      response: "Manage your patients in the Patients List section.",
    },
    {
      label: "Create slots",
      response: "To create slots, open Create Appointment from your doctor dashboard.",
    },
    {
      label: "Access reports",
      response: "Reports and prescriptions are available from the Reports section.",
    },
  ],
  Admin: [
    {
      label: "Manage users",
      response: "Manage users from the Manage Users section of the admin panel.",
    },
    {
      label: "View appointments",
      response: "Open View Appointments in the admin panel to review appointment records.",
    },
    {
      label: "Find reports",
      response: "Reports are available through appointment details and prescriptions.",
    },
  ],
  Guest: [
    {
      label: "What is HealthMate?",
      response: "HealthMate helps patients and doctors manage appointments, profiles, and health communication.",
    },
    {
      label: "How to sign up",
      response: "Open the signup page, fill in your details, and choose the correct account role.",
    },
  ],
};

const roleNavigation = {
  User: [
    { label: "Dashboard", path: "/UserPage" },
    { label: "Profile", path: "/Profile" },
    { label: "Doctors List", path: "/doctorslist" },
  ],
  Doctor: [
    { label: "Dashboard", path: "/DoctorPage" },
    { label: "Appointments", path: "/AcceptedAppointments" },
    { label: "Patients List", path: "/Patients" },
  ],
  Admin: [
    { label: "Dashboard", path: "/AdminPage" },
    { label: "Manage Users", path: "/Admin/ManageUsers" },
    { label: "View Appointments", path: "/admin/appointments" },
  ],
};

const ChatbotWidget = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const messageId = useRef(0);
  const navigate = useNavigate();

  const role = user?.role || "Guest";

  const mainOptions = useMemo(
    () => [
      { label: "FAQ", action: "faq" },
      { label: "Navigate", action: "navigate" },
      { label: "Contact Support", action: "support" },
    ],
    []
  );

  const createMessage = useCallback((sender, text, options = []) => {
    messageId.current += 1;

    return {
      id: `chat-message-${messageId.current}`,
      sender,
      text,
      options,
    };
  }, []);

  const createMainMenu = useCallback(
    () => createMessage("bot", "How can I assist you today?", mainOptions),
    [createMessage, mainOptions]
  );

  useEffect(() => {
    setMessages([
      createMessage("bot", `Hi ${user?.name || "there"}! Welcome to HealthMate.`),
      createMainMenu(),
    ]);
  }, [createMainMenu, createMessage, user?.name]);

  const appendMessages = useCallback((newMessages) => {
    setMessages((currentMessages) => [...currentMessages, ...newMessages]);
  }, []);

  const handleOption = useCallback(
    (option) => {
      const selectedMessage = createMessage("user", option.label);

      if (option.action === "faq") {
        const faqOptions = (roleFaqs[role] || roleFaqs.Guest).map((faq) => ({
          label: faq.label,
          action: "faq-answer",
          response: faq.response,
        }));

        appendMessages([
          selectedMessage,
          createMessage("bot", "What do you need help with?", faqOptions),
        ]);
        return;
      }

      if (option.action === "faq-answer") {
        appendMessages([
          selectedMessage,
          createMessage("bot", option.response),
          createMainMenu(),
        ]);
        return;
      }

      if (option.action === "navigate") {
        const navigationOptions = roleNavigation[role];

        if (!navigationOptions) {
          appendMessages([
            selectedMessage,
            createMessage("bot", "Navigation is available after you sign up or log in."),
            createMainMenu(),
          ]);
          return;
        }

        appendMessages([
          selectedMessage,
          createMessage(
            "bot",
            "Where would you like to go?",
            navigationOptions.map((item) => ({
              label: item.label,
              action: "go",
              path: item.path,
            }))
          ),
        ]);
        return;
      }

      if (option.action === "go") {
        appendMessages([
          selectedMessage,
          createMessage("bot", `Redirecting to ${option.label}...`),
        ]);

        window.setTimeout(() => {
          setIsOpen(false);
          navigate(option.path);
        }, 300);
        return;
      }

      if (option.action === "support") {
        appendMessages([
          selectedMessage,
          createMessage("bot", "You can contact support at support@healthmate.com or call +1-234-567-890."),
          createMainMenu(),
        ]);
      }
    },
    [appendMessages, createMainMenu, createMessage, navigate, role]
  );

  const toggleChat = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <div className="chatbot-widget">
      <button className="chatbot-toggle-btn" onClick={toggleChat} type="button">
        {isOpen ? "Close Chat" : "Chat with us"}
      </button>

      {isOpen && (
        <section className="chatbot-container" aria-label="HealthMate chat assistant">
          <div className="chatbot-header">HealthMate Assistant</div>
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div className={`chatbot-message chatbot-message-${message.sender}`} key={message.id}>
                <p>{message.text}</p>
                {message.options.length > 0 && (
                  <div className="chatbot-options">
                    {message.options.map((option) => (
                      <button
                        key={`${message.id}-${option.label}`}
                        onClick={() => handleOption(option)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ChatbotWidget;
