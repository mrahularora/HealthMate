import React, { useState } from "react";

const VoiceInput = ({ value, onChange, placeholder, name }) => {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
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
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-control"
      />
      <button
        type="button"
        className={`voice-input-button ${isListening ? "listening" : ""}`}
        onClick={handleVoiceInput}
      >
        🎤
      </button>
    </div>
  );
};

export default VoiceInput;
