import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/inbox.css";

const Inbox = () => {
  const { store, actions } = useContext(Context);
  const [conversations, setConversations] = useState({});
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      await actions.getMessages();
    };
    fetchMessages();
  }, [actions]);

  // Organize messages into conversations
  useEffect(() => {
    if (store.messages && store.messages.length > 0) {
      const convos = store.messages.reduce((acc, message) => {
        const participant =
          message.sender === store.currentUser ? message.recipient : message.sender;
        if (!acc[participant]) {
          acc[participant] = [];
        }
        acc[participant].push(message);
        return acc;
      }, {});
      setConversations(convos);
    }
  }, [store.messages, store.currentUser]);

  return (
    <div className="inbox-container">
      <div className="inbox-sidebar">
        <h2>Inbox</h2>
        {Object.keys(conversations).length > 0 ? (
          Object.keys(conversations).map((participant) => (
            <div
              key={participant}
              className={`conversation-item ${
                selectedParticipant === participant ? "active" : ""
              }`}
              onClick={() => setSelectedParticipant(participant)}
            >
              <h4>{participant}</h4>
              <p>
                {
                  conversations[participant][conversations[participant].length - 1]
                    .content
                }
              </p>
            </div>
          ))
        ) : (
          <p>No conversations found.</p>
        )}
      </div>

      <div className="inbox-content">
        {selectedParticipant ? (
          <div className="conversation-details">
            <h3>Conversation with {selectedParticipant}</h3>
            <div className="messages-list">
              {conversations[selectedParticipant].map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${
                    message.sender === store.currentUser ? "sent" : "received"
                  }`}
                >
                  <p>{message.content}</p>
                  <span className="message-timestamp">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Select a conversation to view details.</p>
        )}
      </div>
    </div>
  );
};

export default Inbox;
