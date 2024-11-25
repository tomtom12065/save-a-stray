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
      const recipientId = store.user?.id; // Ensure the user ID exists
      if (recipientId) {
        await actions.getMessages(recipientId); // Pass the recipient ID
      }
    };
    fetchMessages();
  }, [actions, store.user]);

  // Organize messages into conversations
  useEffect(() => {
    if (store.messages && store.messages.length > 0) {
      const convos = store.messages.reduce((acc, message) => {
        // Determine participant name
        const participant =
          message.sender === store.user.name ? message.recipient : message.sender;

        // Initialize conversation array if it doesn't exist
        if (!acc[participant]) {
          acc[participant] = [];
        }

        // Add the message to the conversation
        acc[participant].push(message);
        return acc;
      }, {});

      setConversations(convos); // Update state with organized conversations
    }
  }, [store.messages, store.user]);

  return (
    <div className="inbox-container">
      {/* Sidebar for listing conversations */}
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
                  conversations[participant][
                    conversations[participant].length - 1
                  ].text // Display the last message's content
                }
              </p>
            </div>
          ))
        ) : (
          <p>No conversations found.</p>
        )}
      </div>

      {/* Main content area for selected conversation */}
      <div className="inbox-content">
        {selectedParticipant ? (
          <div className="conversation-details">
            <h3>Conversation with {selectedParticipant}</h3>
            <div className="messages-list">
              {conversations[selectedParticipant].map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${
                    message.sender === store.user.name ? "sent" : "received"
                  }`}
                >
                  <p>{message.text}</p>
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
