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
      console.log("Fetching chat messages...");
      const fetchedMessages = await actions.getMessages(store.user.id); // Fetch messages for the specific user
      setMessages(fetchedMessages || []);
    };

    fetchChatMessages();
  }, [userId, actions]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!userId || messageText.trim() === "") {
      console.error("Missing required data for sending a message.");
      return;
    }

    console.log("Sending message:", {
      sender_id: store.user.id,
      recipient_id: store.Messages,
      text: messageText,
    });

    // Call sendMessage action
    const response = await actions.sendMessage( store.user.id,store.cat.owner.id, messageText);

    if (response) {
      // Add the sent message to the local state
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender_id: store.user.id,
          recipient_id: store.user.id,
          text: messageText,
          timestamp: new Date().toISOString(),
        },
      ]);
      setMessageText(""); // Clear the input field
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
            <div
              key={index}
              className={`message ${msg.sender_id === store.user.id ? "sent" : "received"}`}
            >
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
