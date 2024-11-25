import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/chatbox.css";

const Chatbox = ({ recipientId }) => {
  const { store, actions } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true); // Control visibility of the chatbox

  // Fetch messages when the chatbox is expanded and recipientId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!isCollapsed && recipientId) {
        try {
          const fetchedMessages = await actions.getMessages(recipientId);
          setMessages(fetchedMessages || []);
          await actions.markMessagesAsRead(store.user.id, recipientId); // Mark messages as read
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };
    fetchMessages();
  }, [isCollapsed, recipientId, actions, store.user.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await actions.sendMessage(store.user.id, recipientId, messageText);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderId: store.user.id,
          recipientId,
          text: messageText,
          timestamp: new Date().toISOString(),
          read: false, // New messages are unread for the recipient
        },
      ]);
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className={`chatbox-wrapper ${isCollapsed ? "collapsed" : ""}`}>
      <div className="chatbox-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <span>Chat</span>
        <button>{isCollapsed ? "▲" : "▼"}</button> {/* Toggle icon */}
      </div>
      {!isCollapsed && (
        <div className="chatbox">
          <div className="messages">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={msg.senderId === store.user.id ? "sent" : "received"}
                >
                  {msg.text}
                </div>
              ))
            ) : (
              <p>No messages yet.</p>
            )}
          </div>
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
