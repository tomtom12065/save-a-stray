import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useLocation } from "react-router-dom";
import "../../styles/inbox.css";



// hAVE A BUTTON
// i should add an application status to this 


const Inbox = () => {
  const { store, actions } = useContext(Context);
  const location = useLocation(); // Access state passed via navigate
  const [conversations, setConversations] = useState({}); // Store all conversations
  const [selectedParticipant, setSelectedParticipant] = useState(null); // Currently selected participant
  const [selectedParticipantUsername, setSelectedParticipantUsername] = useState(""); // Username of selected participant
  const [messageText, setMessageText] = useState(""); // Message input text
  const [activeTab, setActiveTab] = useState("conversations");
  const [catApplications,setCatApplications]=  useState({

  })
  const [selectedCat,setSelectedCat]=  useState(null)
  // Pre-selected recipient from `CatTemplate`
  const recipientIdFromProps = location.state?.recipientId || null;
  const recipientNameFromProps = location.state?.recipientName || null;

  // Log initial props and state
  console.log("Recipient ID from props:", recipientIdFromProps);
  console.log("Recipient Name from props:", recipientNameFromProps);

  // Fetch all messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      console.log("Fetching all messages...");
      await actions.getMessages(); // Fetch all messages for the logged-in user
    };
    fetchMessages();
  }, [actions]);

  // Organize messages into conversations by participant
  useEffect(() => {
    console.log("Processing messages from store.messages...");
    if (store.messages && store.messages.length > 0) {
      const convos = store.messages.reduce((acc, message) => {
        const otherUserId =
          message.sender_id === store.user.id ? message.recipient_id : message.sender_id;
        const otherUsername =
          message.sender_id === store.user.id ? message.recipient : message.sender;

        if (!acc[otherUserId]) acc[otherUserId] = { username: otherUsername, messages: [] };
        acc[otherUserId].messages.push(message);
        return acc;
      }, {});
      console.log("Conversations derived from messages:", convos);
      setConversations(convos);
      

      // Pre-select the recipient conversation if passed via props
      if (recipientIdFromProps) {
        console.log("Pre-selecting recipient conversation:", recipientIdFromProps);
        setSelectedParticipant(recipientIdFromProps);
        setSelectedParticipantUsername(recipientNameFromProps || "Unknown User");
        actions.setChatRecipient(recipientIdFromProps, recipientNameFromProps || "Unknown User"); // Set global chat context
      }
    }
  }, [store.messages, store.user, recipientIdFromProps, recipientNameFromProps, actions]);

 
 
 
 
 useEffect
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
  // Handle selecting a conversation
  const handleSelectConversation = async (participantId) => {
    console.log("Selected participant ID:", participantId);
    setSelectedParticipant(participantId);
    setSelectedParticipantUsername(conversations[participantId]?.username || "Unknown User");

    // Mark messages as read
    await actions.markMessagesAsRead(store.user.id, participantId);

    // Update global chat context
    actions.setChatRecipient(participantId, conversations[participantId]?.username || "Unknown User");
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (messageText.trim() && selectedParticipant) {
      console.log("Sending message to:", selectedParticipant);
      const result = await actions.sendMessage(selectedParticipant, messageText); // Send the message
      if (result) {
        const newMessage = result.data;
        console.log("New message sent:", newMessage);

        // Update conversations with the new message
        setConversations((prevConversations) => {
          const updatedConversations = { ...prevConversations };
          if (!updatedConversations[selectedParticipant]) {
            updatedConversations[selectedParticipant] = { username: selectedParticipantUsername, messages: [] };
          }
          updatedConversations[selectedParticipant].messages.push(newMessage);
          return updatedConversations;
        });

        setMessageText(""); // Clear input
      }
    }
  };

  return (
    <div className="inbox">
      {console.log("Rendering sidebar")}
      <div className="sidebar">
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "conversations" ? "active" : ""
              }`}
            onClick={() => setActiveTab("conversations")}
          >conversations</button>

          <button
            className={`tab-button ${activeTab === "applications" ? "active" : ""
              }`}
            onClick={() => setActiveTab("applications")}
          >applications</button>
        </div>

        {
          activeTab === "conversations" ? (
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
          ) : (
            <div className="applications-list">
              <h3>applications</h3>
              <div className = "applications-placeholder">applications feature sonn tm</div>
            </div>
          )}
      </div>

      <div className="message-box">
        {selectedParticipant && activeTab === "conversations"? (
          <>
            <div className="message-header">
              <h2>Conversation with {selectedParticipantUsername}</h2>
            </div>
            <div className="messages">
              {conversations[selectedParticipant]?.messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.sender_id === store.user.id ? "sent" : "received"}`}
                >
                  {message.text}
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="message-placeholder">
            <h2>
              {
                activeTab === "conversations"
                ? "Select a conversation to start chatting"
                : "applications feature coming soon tm"
              }
              </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
