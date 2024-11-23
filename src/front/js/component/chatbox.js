import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/chatbox.css";

const Chatbox = ({ userId }) => {
  const { store, actions } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  // Fetch chat messages when the component mounts or userId changes
  useEffect(() => {
    const fetchChatMessages = async () => {
      console.log("CALLED FUNCTION")
      const currentUserId = store.user.id; // Assumes the logged-in user is stored in state
      const fetchedMessages = await actions.getMessages(currentUserId);
      setMessages(fetchedMessages);
    };

    // if (userId) {
      fetchChatMessages();
    // }
  }, [userId, store.user.id, actions]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const currentUserId = store.user.id;

    if (messageText.trim() === "") return;
    console.log(currentUserId, userId, messageText)
    const response = await actions.sendMessage(currentUserId, store, messageText);

    if (response) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender_id: currentUserId, receiver_id: userId, message_text: messageText, timestamp: new Date().toISOString() },
      ]);
      setMessageText(""); // Clear input
    } else {
      alert("Failed to send message.");
    }
  };

  return (
    <div className="chatbox">
      <h3>Chat with User {userId}</h3>
      <div className="messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender_id === store.user.id ? "sent" : "received"}`}>
              <p>{msg.text}</p>
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbox;
