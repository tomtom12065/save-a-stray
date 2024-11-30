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
        await actions.getMessages(recipientId); // Fetch all messages for the user
      }
    };
    fetchMessages();
  }, [actions, store.user]);

  // Organize messages into conversations with usernames
  useEffect(() => {
    if (store.messages && store.messages.length > 0) {
      const convos = store.messages.reduce((acc, message) => {
        // Determine the other participant's ID and username
        const isSender = message.senderId === store.user.id;
        const participantId = isSender ? message.recipientId : message.senderId;
        const participantName = isSender ? message.recipient : message.sender;

        // Initialize conversation array if it doesn't exist
        if (!acc[participantId]) {
          acc[participantId] = {
            name: participantName, // Store the username
            messages: [],
          };
        }

        // Add the message to the conversation
        acc[participantId].messages.push(message);
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
          Object.keys(conversations).map((participantId) => (
            <div
              key={participantId}
              className={`conversation-item ${
                selectedParticipant === participantId ? "active" : ""
              }`}
              onClick={() => setSelectedParticipant(participantId)}
            >
              <h4>{conversations[participantId].name}</h4> {/* Display username */}
              <p>
                {
                  conversations[participantId].messages[
                    conversations[participantId].messages.length - 1
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
            <h3>
              Conversation with {conversations[selectedParticipant].name}
            </h3>
            <div className="messages-list">
              {conversations[selectedParticipant].messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${
                    message.senderId === store.user.id ? "sent" : "received"
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
