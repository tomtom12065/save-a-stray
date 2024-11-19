import React, { useState, useEffect } from "react";
import "../../styles/chatBox.css";

const ChatBox = ({ recipient }) => {
  const [messages, setMessages] = useState([]); // Messages state
  const [inputMessage, setInputMessage] = useState(""); // Input field state
  const [isOpen, setIsOpen] = useState(false); // Toggle chatbox visibility

  // Mock function to fetch existing messages (replace with real backend call)
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await actions.getMessages(recipient.id);
      if (response.success) {
        setMessages(response.messages);
      } else {
        console.error("Failed to fetch messages:", response.message);
      }
    };
  
    fetchMessages();
  }, [recipient]);
  

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "") {
      const response = await actions.sendMessage(recipient.id, inputMessage);
      if (response.success) {
        setMessages([...messages, response.message]);
        setInputMessage(""); // Clear input field
      } else {
        alert("Failed to send message: " + response.message);
      }
    }
  };
  

  // Toggle chatbox visibility
  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`chatbox-container ${isOpen ? "open" : "closed"}`}>
      <div className="chatbox-header" onClick={toggleChatBox}>
        <span>Chat with {recipient}</span>
        <button className="chatbox-toggle">
          {isOpen ? "▼" : "▲"}
        </button>
      </div>
      {isOpen && (
        <div className="chatbox-body">
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbox-message ${
                  msg.sender === "me" ? "sent" : "received"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
