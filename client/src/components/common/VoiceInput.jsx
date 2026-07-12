import React, { useState } from "react";

const VoiceInput = ({
  value,
  onChange,
  placeholder,
  name,
  type = "text",
  className = "",
  "aria-label": ariaLabel,
}) => {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice input.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange({ target: { name, value: transcript } });
    };

    recognition.onerror = (error) => {
      console.error("Voice input error:", error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="voice-input-container">
      <input
        aria-label={ariaLabel || placeholder}
        className={`form-control ${className}`.trim()}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      <button
        aria-label={isListening ? "Listening for voice input" : "Start voice input"}
        className={`voice-input-button ${isListening ? "listening" : ""}`}
        onClick={handleVoiceInput}
        type="button"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          height="18"
          viewBox="0 0 24 24"
          width="18"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v5c0 1.66 1.34 3 3 3Z" />
          <path d="M17.5 11c0 3.03-2.47 5.5-5.5 5.5S6.5 14.03 6.5 11H5c0 3.58 2.72 6.53 6.2 6.92V21h1.6v-3.08c3.48-.39 6.2-3.34 6.2-6.92h-1.5Z" />
        </svg>
      </button>
    </div>
  );
};

export default VoiceInput;
