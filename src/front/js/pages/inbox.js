import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/inbox.css";

const Inbox = () => {
  const { store, actions } = useContext(Context);
  const [conversations, setConversations] = useState({});
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [messageText, setMessageText] = useState(""); // New state for message text

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
        const isSender = message.sender_id === store.user.id;
        const participantId = isSender ? message.recipient_id : message.sender_id;
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

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!selectedParticipant || !messageText.trim()) {
      console.error("No recipient or message text is empty.");
      return;
    }

    const senderId = store.user.id;
    const recipientId = selectedParticipant;

    console.log("Sending message to:", recipientId);

    const result = await actions.sendMessage(senderId, recipientId, messageText);
    console.log("sendMessage result:", result);

    if (result && result.data) {
      const newMessage = {
        id: result.data.id, // Ensure this matches backend response
        sender_id: senderId,
        recipient_id: recipientId,
        text: messageText,
        timestamp: result.data.timestamp, // Ensure timestamp exists in backend response
      };

      // Update the local state with the new message
      setConversations((prevConversations) => {
        const updatedConversations = { ...prevConversations };
        if (!updatedConversations[recipientId]) {
          updatedConversations[recipientId] = { name: "Unknown", messages: [] };
        }
        updatedConversations[recipientId].messages.push(newMessage);
        return updatedConversations;
      });

      setMessageText(""); // Clear input field after sending
    } else {
      console.error("Failed to send message.");
    }
  };

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
              onClick={() => {
                console.log("Setting selected participant:", participantId);
                setSelectedParticipant(participantId);
              }}
            >
              <h4>{conversations[participantId].name}</h4>
              <p>
                {
                  conversations[participantId].messages[
                    conversations[participantId].messages.length - 1
                  ].text
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
              Conversation with {conversations[selectedParticipant]?.name || "Unknown"}
            </h3>
            <div className="messages-list">
              {conversations[selectedParticipant]?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${
                    message.sender_id === store.user.id ? "sent" : "received"
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="message-timestamp">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <button onClick={handleSendMessage}>Send</button>
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
