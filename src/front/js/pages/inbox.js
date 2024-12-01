import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useLocation } from "react-router-dom";
import "../../styles/inbox.css";

const Inbox = () => {
  const { store, actions } = useContext(Context);
  const location = useLocation();
  const [conversations, setConversations] = useState({});
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedParticipantUsername, setSelectedParticipantUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  // Read recipientId from location state for pre-selected conversation
  const recipientIdFromProps = location.state?.recipientId || null;

  // Fetch all messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      await actions.getMessages(); // Fetch all messages for the logged-in user
    };
    fetchMessages();
  }, [actions]);

  // Organize messages into conversations by participant
  useEffect(() => {
    if (store.messages && store.messages.length > 0) {
      const convos = store.messages.reduce((acc, message) => {
        const otherUserId = message.sender_id === store.user.id ? message.recipient_id : message.sender_id;
        const otherUsername =
          message.sender_id === store.user.id ? message.recipient : message.sender;

        if (!acc[otherUserId]) acc[otherUserId] = { username: otherUsername, messages: [] };
        acc[otherUserId].messages.push(message);
        return acc;
      }, {});
      setConversations(convos);

      // Automatically open the conversation for recipientIdFromProps
      if (recipientIdFromProps && convos[recipientIdFromProps]) {
        setSelectedParticipant(recipientIdFromProps);
        setSelectedParticipantUsername(convos[recipientIdFromProps].username || "Unknown User");
        setMessages(convos[recipientIdFromProps].messages);
      }
    }
  }, [store.messages, store.user, recipientIdFromProps]);

  // Handle selecting a conversation
  const handleSelectConversation = async (participantId) => {
    setSelectedParticipant(participantId);
    setSelectedParticipantUsername(conversations[participantId]?.username || "Unknown User");

    // Fetch specific conversation
    const specificMessages = await actions.getConversationWithOwner(participantId);
    setMessages(specificMessages || []);
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (messageText.trim() && selectedParticipant) {
      const result = await actions.sendMessage(selectedParticipant, messageText);
      if (result) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender_id: store.user.id,
            recipient_id: selectedParticipant,
            text: messageText,
            timestamp: new Date().toISOString(),
            read: false, // New messages are unread for the recipient
          },
        ]);
      }
      setMessageText("");
    }
  };

  return (
    <div className="inbox">
      <div className="conversation-list">
        <h3>Conversations</h3>
        {Object.keys(conversations).map((participantId) => (
          <div
            key={participantId}
            className={`conversation-item ${participantId === selectedParticipant ? "active" : ""}`}
            onClick={() => handleSelectConversation(participantId)}
          >
            Conversation with {conversations[participantId]?.username || `User ${participantId}`}
          </div>
        ))}
      </div>
      <div className="message-box">
        {selectedParticipant && (
          <div className="message-header">
            <h2>Conversation with {selectedParticipantUsername}</h2>
          </div>
        )}
        <div className="messages">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.sender_id === store.user.id ? "sent" : "received"}`}>
                {message.text}
              </div>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
        </div>
        {selectedParticipant && (
          <div className="message-input">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message here"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
