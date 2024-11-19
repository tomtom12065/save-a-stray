import React, { useState, useEffect } from "react";
import "../../styles/chatBox.css";

const ChatBox = ({ recipient }) => {
  const [messages, setMessages] = useState([]); // Messages state
  const [inputMessage, setInputMessage] = useState(""); // Input field state
  const [isOpen, setIsOpen] = useState(false); // Toggle chatbox visibility

  // Mock function to fetch existing messages (replace with real backend call)
  useEffect(() => {
    // Simulate fetching chat history
    const fetchMessages = async () => {
      // You would replace this mock data with a backend API call
      const mockMessages = [
        { sender: "me", text: "Hello!" },
        { sender: recipient, text: "Hi, how can I help you?" },
      ];
      setMessages(mockMessages);
    };
    fetchMessages();
  }, [recipient]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      const newMessage = { sender: "me", text: inputMessage };
      setMessages([...messages, newMessage]);
      setInputMessage(""); // Clear input field

      // TODO: Send the message to the backend
      console.log("Message sent to backend:", newMessage);
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
