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
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const [catApplications, setCatApplications] = useState({});
  const [selectedCat, setSelectedCat] = useState(null);

  const recipientIdFromProps = location.state?.recipientId || null;
  const recipientNameFromProps = location.state?.recipientName || null;

  useEffect(() => {
    const fetchMessages = async () => {
      await actions.getMessages();
    };
    fetchMessages();
  }, [actions]);

  useEffect(() => {
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
      setConversations(convos);

      if (recipientIdFromProps) {
        setSelectedParticipant(recipientIdFromProps);
        setSelectedParticipantUsername(recipientNameFromProps || "Unknown User");
        actions.setChatRecipient(recipientIdFromProps, recipientNameFromProps || "Unknown User");
      }
    }
  }, [store.messages, store.user, recipientIdFromProps, recipientNameFromProps, actions]);

  useEffect(() => {
    const fetchApplications = async () => {
      const data = await actions.getCatApplications();
      if (data) setCatApplications(data);
    };
    fetchApplications();
  }, [actions]);

  const handleSelectConversation = async (participantId) => {
    setSelectedParticipant(participantId);
    setSelectedParticipantUsername(conversations[participantId]?.username || "Unknown User");
    await actions.markMessagesAsRead(store.user.id, participantId);
    actions.setChatRecipient(participantId, conversations[participantId]?.username || "Unknown User");
  };

  const handleSelectApplication = (catId) => {
    setSelectedCat(catId);
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedParticipant) {
      const result = await actions.sendMessage(selectedParticipant, messageText);
      if (result) {
        const newMessage = result.data;
        setConversations((prevConversations) => {
          const updatedConversations = { ...prevConversations };
          if (!updatedConversations[selectedParticipant]) {
            updatedConversations[selectedParticipant] = { username: selectedParticipantUsername, messages: [] };
          }
          updatedConversations[selectedParticipant].messages.push(newMessage);
          return updatedConversations;
        });
        setMessageText("");
      }
    }
  };

  return (
    <div className="inbox">
      <div className="sidebar">
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "conversations" ? "active" : ""}`}
            onClick={() => setActiveTab("conversations")}
          >
            Conversations
          </button>
          <button
            className={`tab-button ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            Applications
          </button>
        </div>

        {activeTab === "conversations" ? (
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
            <h3>Applications</h3>
            {Object.keys(catApplications).map((catId) => (
              <div
                key={catId}
                className={`application-item ${catId === selectedCat ? "active" : ""}`}
                onClick={() => handleSelectApplication(catId)}
              >
                Applications for {catApplications[catId].cat.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="message-box">
        {activeTab === "conversations" ? (
          selectedParticipant ? (
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
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="message-placeholder">
              <h2>Select a conversation to start chatting</h2>
            </div>
          )
        ) : selectedCat ? (
          <div className="applications-details">
            <h2>Applications for {catApplications[selectedCat].cat.name}</h2>
            {catApplications[selectedCat].applications.map((app) => (
              <div key={app.id} className="application-detail">
                <p>
                  <strong>Name:</strong> {app.applicant_name}
                </p>
                <p>
                  <strong>Contact:</strong> {app.contact_info}
                </p>
                <p>
                  <strong>Reason:</strong> {app.reason}
                </p>
                <p>
                  <strong>Status:</strong> {app.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="message-placeholder">
            <h2>Select a cat to view applications</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
