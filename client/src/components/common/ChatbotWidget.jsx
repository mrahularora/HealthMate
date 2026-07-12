import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { fetchDoctorsFromSchema } from "../../services/doctorService";
import "../../css/chatbot.css";

const CHAT_STORAGE_KEY = "healthmate-chatbot-messages";
const MAX_DOCTOR_SUGGESTIONS = 3;

const roleFaqs = {
  User: [
    {
      label: "Book appointment",
      response:
        "Open See a Doctor, choose a doctor card, then select an available appointment slot.",
      options: [{ label: "See doctors", action: "go", path: "/doctorslist" }],
    },
    {
      label: "My appointments",
      response:
        "Your appointment page shows requested, confirmed, completed, and cancelled visits in one place.",
      options: [
        { label: "Open appointments", action: "go", path: "/UserAppointments" },
      ],
    },
    {
      label: "Update profile",
      response:
        "Use Profile to keep your name, gender, phone number, address, and health details current.",
      options: [{ label: "Open profile", action: "go", path: "/Profile" }],
    },
  ],
  Doctor: [
    {
      label: "Create slots",
      response:
        "Create Appointment lets you publish appointment dates and available time slots for patients.",
      options: [
        { label: "Create slots", action: "go", path: "/CreateAppointment" },
      ],
    },
    {
      label: "Review requests",
      response:
        "Requested Appointments is where you accept or reject patient booking requests.",
      options: [
        {
          label: "Open requests",
          action: "go",
          path: "/RequestedAppointments",
        },
      ],
    },
    {
      label: "Complete visits",
      response:
        "Open an accepted appointment to update status, add prescription notes, and generate reports.",
      options: [
        {
          label: "View appointments",
          action: "go",
          path: "/AcceptedAppointments",
        },
      ],
    },
  ],
  Admin: [
    {
      label: "Manage users",
      response:
        "Manage Users lets you search accounts, review roles, update roles, and remove users.",
      options: [
        { label: "Manage users", action: "go", path: "/Admin/ManageUsers" },
      ],
    },
    {
      label: "Audit appointments",
      response:
        "Admin appointments includes all doctor slots, patient bookings, statuses, and appointment detail review.",
      options: [
        { label: "View appointments", action: "go", path: "/admin/appointments" },
      ],
    },
    {
      label: "Contact inbox",
      response:
        "Contact Details gives you a searchable inbox of submitted patient and visitor inquiries.",
      options: [{ label: "Open inbox", action: "go", path: "/admin/Contact" }],
    },
  ],
  Guest: [
    {
      label: "What is HealthMate?",
      response:
        "HealthMate helps patients book care, doctors manage visits, and admins monitor users, appointments, and contact requests.",
    },
    {
      label: "How to start",
      response:
        "Create an account, choose the right role, then sign in to open your dashboard.",
      options: [
        { label: "Sign up", action: "go", path: "/signup" },
        { label: "Log in", action: "go", path: "/login" },
      ],
    },
  ],
};

const roleNavigation = {
  User: [
    { label: "Dashboard", path: "/UserPage" },
    { label: "Profile", path: "/Profile" },
    { label: "See a Doctor", path: "/doctorslist" },
    { label: "Appointments", path: "/UserAppointments" },
  ],
  Doctor: [
    { label: "Dashboard", path: "/DoctorPage" },
    { label: "Create slots", path: "/CreateAppointment" },
    { label: "Requests", path: "/RequestedAppointments" },
    { label: "Patients", path: "/Patients" },
  ],
  Admin: [
    { label: "Dashboard", path: "/AdminPage" },
    { label: "Manage Users", path: "/Admin/ManageUsers" },
    { label: "Appointments", path: "/admin/appointments" },
    { label: "Contact Inbox", path: "/admin/Contact" },
  ],
};

const pageTips = [
  {
    match: /^\/$/,
    title: "Homepage help",
    response:
      "You can browse featured doctors here. Use each doctor's Book Appointment button to start scheduling.",
  },
  {
    match: /^\/doctorslist/i,
    title: "Doctor search help",
    response:
      "Use the search and specialty filters to narrow doctors, then choose Book Appointment on the right doctor.",
  },
  {
    match: /^\/book-appointment/i,
    title: "Booking help",
    response:
      "Pick a date, select a slot, review your information, and send the booking request.",
  },
  {
    match: /^\/UserAppointments/i,
    title: "Appointments help",
    response:
      "Requested and confirmed appointments can be tracked here. Some upcoming appointments can also be cancelled.",
  },
  {
    match: /^\/Profile/i,
    title: "Profile help",
    response:
      "Keep your profile updated so appointments and medical records have accurate contact details.",
  },
  {
    match: /^\/admin\/appointments/i,
    title: "Admin appointments help",
    response:
      "Search or filter appointments, then select a slot to inspect patient and visit details.",
  },
  {
    match: /^\/admin\/contact/i,
    title: "Contact inbox help",
    response:
      "Select a contact message from the inbox list to read the full inquiry in the detail panel.",
  },
  {
    match: /^\/Admin\/ManageUsers/i,
    title: "Manage users help",
    response:
      "Search and filter users, then use role or delete actions carefully from each user row.",
  },
];

const quickPrompts = [
  "Book appointment",
  "Find cardiologist",
  "My appointments",
  "Emergency help",
];

const normalizeText = (text) => text.trim().toLowerCase();

const getUserDisplayName = (user) => {
  if (!user) return "there";
  return (
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "there"
  );
};

const getPageTip = (pathname) =>
  pageTips.find((tip) => tip.match.test(pathname)) || {
    title: "Page help",
    response:
      "Tell me what you want to do, or use the quick actions below to move around HealthMate.",
  };

const ChatbotWidget = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = sessionStorage.getItem(CHAT_STORAGE_KEY);
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      return [];
    }
  });
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorLoadError, setDoctorLoadError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messageId = useRef(Date.now());
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || "Guest";
  const displayName = getUserDisplayName(user);
  const pageTip = useMemo(() => getPageTip(location.pathname), [location.pathname]);

  const mainOptions = useMemo(
    () => [
      { label: "Page help", action: "page-help" },
      { label: "FAQ", action: "faq" },
      { label: "Navigate", action: "navigate" },
      { label: "Find doctor", action: "doctor-search" },
      { label: "Emergency help", action: "emergency" },
    ],
    []
  );

  const createMessage = useCallback((sender, text, options = [], meta = {}) => {
    messageId.current += 1;

    return {
      id: `chat-message-${messageId.current}`,
      sender,
      text,
      options,
      createdAt: new Date().toISOString(),
      ...meta,
    };
  }, []);

  const createMainMenu = useCallback(
    () =>
      createMessage(
        "bot",
        "Choose a shortcut or type a question. I can help with booking, appointments, profiles, doctors, and admin pages.",
        mainOptions
      ),
    [createMessage, mainOptions]
  );

  const appendMessages = useCallback((newMessages) => {
    setMessages((currentMessages) => [...currentMessages, ...newMessages]);
    if (!isOpen) {
      const botMessages = newMessages.filter((message) => message.sender === "bot");
      setUnreadCount((count) => count + botMessages.length);
    }
  }, [isOpen]);

  const resetChat = useCallback(() => {
    setMessages([
      createMessage(
        "bot",
        `Hi ${displayName}! I am your HealthMate assistant.`
      ),
      createMessage("bot", pageTip.response, [
        { label: "Show options", action: "menu" },
        { label: pageTip.title, action: "page-help" },
      ]),
    ]);
    setUnreadCount(0);
  }, [createMessage, displayName, pageTip.response, pageTip.title]);

  useEffect(() => {
    if (messages.length === 0) {
      resetChat();
    }
  }, [messages.length, resetChat]);

  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    fetchDoctorsFromSchema()
      .then((doctorData) => {
        if (isMounted) {
          setDoctors(Array.isArray(doctorData) ? doctorData : []);
          setDoctorLoadError("");
        }
      })
      .catch(() => {
        if (isMounted) {
          setDoctorLoadError("Doctor search is unavailable right now.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const getDoctorOptions = useCallback(
    (query) => {
      const normalizedQuery = normalizeText(query)
        .replace("find", "")
        .replace("doctor", "")
        .replace("doctors", "")
        .replace("specialist", "")
        .trim();

      const matches = doctors.filter((doctor) => {
        const searchable = [
          doctor.name,
          doctor.specialty,
          doctor.specialization,
          doctor.description,
          doctor.experience,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return normalizedQuery
          ? searchable.includes(normalizedQuery)
          : true;
      });

      return matches.slice(0, MAX_DOCTOR_SUGGESTIONS).map((doctor) => ({
        label: doctor.name || "Doctor",
        action: "go",
        path: `/book-appointment/${doctor.doctorId || doctor._id}`,
        helperText: doctor.specialty || doctor.specialization || "Doctor",
      }));
    },
    [doctors]
  );

  const buildTextResponse = useCallback(
    (rawText) => {
      const text = normalizeText(rawText);

      if (!text) {
        return createMessage("bot", "Type a question or choose one of the quick prompts.");
      }

      if (text.includes("emergency") || text.includes("urgent") || text.includes("911")) {
        return createMessage(
          "bot",
          "If this is a medical emergency, call your local emergency number now. HealthMate can help with scheduling and records, but it is not emergency care.",
          [
            { label: "Book appointment", action: "go", path: "/doctorslist" },
            { label: "Contact page", action: "go", path: "/contact" },
          ]
        );
      }

      if (text.includes("book") || text.includes("appointment") || text.includes("slot")) {
        return createMessage(
          "bot",
          role === "Doctor"
            ? "Doctors can create slots or review requests from the doctor dashboard."
            : "Patients can book by choosing a doctor, selecting a date, and sending a request.",
          role === "Doctor"
            ? [
                { label: "Create slots", action: "go", path: "/CreateAppointment" },
                {
                  label: "Review requests",
                  action: "go",
                  path: "/RequestedAppointments",
                },
              ]
            : [
                { label: "See doctors", action: "go", path: "/doctorslist" },
                {
                  label: "My appointments",
                  action: "go",
                  path: "/UserAppointments",
                },
              ]
        );
      }

      if (text.includes("profile") || text.includes("account")) {
        return createMessage(
          "bot",
          "Your profile stores the core account and health information used across HealthMate.",
          [{ label: "Open profile", action: "go", path: "/Profile" }]
        );
      }

      if (text.includes("admin") || text.includes("user") || text.includes("contact")) {
        return createMessage(
          "bot",
          role === "Admin"
            ? "Admin tools are available for user management, appointment auditing, and contact messages."
            : "Admin tools are only available to admin accounts.",
          role === "Admin" ? roleNavigation.Admin.map((item) => ({ ...item, action: "go" })) : []
        );
      }

      if (text.includes("doctor") || text.includes("cardio") || text.includes("skin") || text.includes("pedia")) {
        const doctorOptions = getDoctorOptions(text);

        if (doctorOptions.length > 0) {
          return createMessage(
            "bot",
            "I found these matching doctors. Choose one to start booking.",
            [
              ...doctorOptions,
              { label: "See all doctors", action: "go", path: "/doctorslist" },
            ]
          );
        }

        return createMessage(
          "bot",
          doctorLoadError || "I could not find a matching doctor yet. You can browse the full doctor list instead.",
          [{ label: "See all doctors", action: "go", path: "/doctorslist" }]
        );
      }

      if (text.includes("where") || text.includes("page") || text.includes("navigate") || text.includes("go to")) {
        const navigationOptions = roleNavigation[role];
        return createMessage(
          "bot",
          navigationOptions
            ? "Here are the pages available for your role."
            : "Log in first and I can show shortcuts for your dashboard.",
          navigationOptions
            ? navigationOptions.map((item) => ({ ...item, action: "go" }))
            : [
                { label: "Log in", action: "go", path: "/login" },
                { label: "Sign up", action: "go", path: "/signup" },
              ]
        );
      }

      return createMessage(
        "bot",
        "I can help with appointments, doctors, profile updates, navigation, and admin workflows. Try a quick prompt below.",
        quickPrompts.map((prompt) => ({
          label: prompt,
          action: "prompt",
          prompt,
        }))
      );
    },
    [createMessage, doctorLoadError, getDoctorOptions, role]
  );

  const handleOption = useCallback(
    (option) => {
      const selectedMessage = createMessage("user", option.label);

      if (option.action === "menu") {
        appendMessages([selectedMessage, createMainMenu()]);
        return;
      }

      if (option.action === "prompt") {
        const botResponse = buildTextResponse(option.prompt || option.label);
        appendMessages([selectedMessage, botResponse]);
        return;
      }

      if (option.action === "page-help") {
        appendMessages([
          selectedMessage,
          createMessage("bot", pageTip.response, [
            { label: "Show options", action: "menu" },
          ]),
        ]);
        return;
      }

      if (option.action === "doctor-search") {
        const doctorOptions = getDoctorOptions("");
        appendMessages([
          selectedMessage,
          createMessage(
            "bot",
            doctorOptions.length
              ? "Here are a few doctors you can book with right now."
              : doctorLoadError || "Doctor suggestions are not available right now.",
            doctorOptions.length
              ? [
                  ...doctorOptions,
                  { label: "See all doctors", action: "go", path: "/doctorslist" },
                ]
              : [{ label: "See all doctors", action: "go", path: "/doctorslist" }]
          ),
        ]);
        return;
      }

      if (option.action === "faq") {
        const faqOptions = (roleFaqs[role] || roleFaqs.Guest).map((faq) => ({
          label: faq.label,
          action: "faq-answer",
          response: faq.response,
          options: faq.options,
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
          createMessage("bot", option.response, option.options || []),
          createMainMenu(),
        ]);
        return;
      }

      if (option.action === "navigate") {
        const navigationOptions = roleNavigation[role];

        appendMessages([
          selectedMessage,
          createMessage(
            "bot",
            navigationOptions
              ? "Where would you like to go?"
              : "Navigation shortcuts unlock after you log in.",
            navigationOptions
              ? navigationOptions.map((item) => ({
                  label: item.label,
                  action: "go",
                  path: item.path,
                }))
              : [
                  { label: "Log in", action: "go", path: "/login" },
                  { label: "Sign up", action: "go", path: "/signup" },
                ]
          ),
        ]);
        return;
      }

      if (option.action === "go") {
        appendMessages([
          selectedMessage,
          createMessage("bot", `Opening ${option.label}...`),
        ]);

        window.setTimeout(() => {
          setIsOpen(false);
          navigate(option.path);
        }, 250);
        return;
      }

      if (option.action === "emergency") {
        appendMessages([
          selectedMessage,
          buildTextResponse("emergency"),
          createMainMenu(),
        ]);
      }
    },
    [
      appendMessages,
      buildTextResponse,
      createMainMenu,
      createMessage,
      doctorLoadError,
      getDoctorOptions,
      navigate,
      pageTip.response,
      role,
    ]
  );

  const submitMessage = useCallback(
    (event) => {
      event.preventDefault();
      const messageText = draft.trim();

      if (!messageText) return;

      const userMessage = createMessage("user", messageText);
      setDraft("");
      setIsTyping(true);
      appendMessages([userMessage]);

      window.setTimeout(() => {
        setIsTyping(false);
        appendMessages([buildTextResponse(messageText)]);
      }, 350);
    },
    [appendMessages, buildTextResponse, createMessage, draft]
  );

  const toggleChat = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <div className={`chatbot-widget ${isOpen ? "chatbot-widget-open" : ""}`}>
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close HealthMate assistant" : "Open HealthMate assistant"}
        className="chatbot-toggle-btn"
        onClick={toggleChat}
        type="button"
      >
        <span className="chatbot-toggle-icon">{isOpen ? "x" : "?"}</span>
        <span>{isOpen ? "Close" : "Ask HealthMate"}</span>
        {!isOpen && unreadCount > 0 && (
          <span className="chatbot-unread-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <section className="chatbot-container" aria-label="HealthMate chat assistant">
          <div className="chatbot-header">
            <div>
              <span className="chatbot-kicker">{role} assistant</span>
              <h2>HealthMate Help</h2>
            </div>
            <button
              className="chatbot-reset-btn"
              onClick={resetChat}
              type="button"
            >
              Reset
            </button>
          </div>

          <div className="chatbot-context-strip">
            <span>{pageTip.title}</span>
            <button onClick={() => handleOption({ label: "Help here", action: "page-help" })} type="button">
              Help here
            </button>
          </div>

          <div className="chatbot-messages" role="log" aria-live="polite">
            {messages.map((message) => (
              <div
                className={`chatbot-message chatbot-message-${message.sender}`}
                key={message.id}
              >
                <p>{message.text}</p>
                {message.options?.length > 0 && (
                  <div className="chatbot-options">
                    {message.options.map((option) => (
                      <button
                        key={`${message.id}-${option.label}`}
                        onClick={() => handleOption(option)}
                        type="button"
                      >
                        <span>{option.label}</span>
                        {option.helperText && <small>{option.helperText}</small>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-message chatbot-message-bot chatbot-typing">
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-prompt-row" aria-label="Suggested prompts">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleOption({ label: prompt, action: "prompt", prompt })}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="chatbot-input-row" onSubmit={submitMessage}>
            <label className="visually-hidden" htmlFor="healthmate-chat-input">
              Ask HealthMate
            </label>
            <input
              id="healthmate-chat-input"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about booking, doctors, profile..."
              value={draft}
            />
            <button disabled={!draft.trim()} type="submit">
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default ChatbotWidget;
