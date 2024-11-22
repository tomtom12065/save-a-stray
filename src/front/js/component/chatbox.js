import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/chatbox.css";

const ChatBox = ({ recipientId }) => {
  const { store, actions } = useContext(Context);
  const senderId = store.user ? store.user.id : null; // Logged-in user's ID from store
  const [messages, setMessages] = useState([]); // Chat messages state
  const [inputMessage, setInputMessage] = useState(""); // Input message state
  const [isOpen, setIsOpen] = useState(false); // Chatbox visibility toggle

  // Fetch messages on component mount or when sender/recipient changes
  useEffect(() => {
    if (senderId && recipientId) {
      const fetchMessages = async () => {
        const response = await actions.getChatMessages(senderId, recipientId);
        if (response.success) {
          setMessages(response.messages);
        } else {
          console.error(response.message);
        }
      };
      fetchMessages();
    }
  }, [senderId, recipientId, actions]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "") {
      const newMessage = { senderId, recipientId, text: inputMessage };
      setMessages([...messages, newMessage]); // Optimistic UI update
      setInputMessage("");

      const response = await actions.sendChatMessage(senderId, recipientId, inputMessage);
      if (!response.success) {
        console.error(response.message);
      }
    }
  };

  // Toggle chatbox visibility
  const toggleChatBox = () => setIsOpen(!isOpen);

  return (
    <div className={`chatbox-container ${isOpen ? "open" : "closed"}`}>
      <div className="chatbox-header" onClick={toggleChatBox}>
        <span>Chat</span>
        <button className="chatbox-toggle">{isOpen ? "▼" : "▲"}</button>
      </div>
      {isOpen && (
        <div className="chatbox-body">
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbox-message ${msg.sender_id === senderId ? "sent" : "received"}`}
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
