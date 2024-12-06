import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useLocation } from "react-router-dom";
import "../../styles/inbox.css";
import ApplicationCard from "../component/applicationCard";

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
    <div className="container-fluid">
      <div className="row">
        <div className="col-4">
          <div className="tab-navigation">
            <button
              className={`btn btn-light ${activeTab === "conversations" ? "active" : ""}`}
              onClick={() => setActiveTab("conversations")}
            >
              Conversations
            </button>
            <button
              className={`btn btn-light ${activeTab === "applications" ? "active" : ""}`}
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
                  className={`list-group-item list-group-item-action ${participantId === selectedParticipant ? "active" : ""}`}
                  onClick={() => handleSelectConversation(participantId)}
                >
                  Conversation with {conversations[participantId]?.username || `User ${participantId}`}
                </div>
              ))}
            </div>
          ) : (
            <div className="application-list">
              <h3>Applications</h3>
              {Object.keys(catApplications).map((catId) => (
                <div
                  key={catId}
                  className={`list-group-item list-group-item-action ${catId === selectedCat ? "active" : ""}`}
                  onClick={() => handleSelectApplication(catId)}
                >
                  Applications for {catApplications[catId]?.cat?.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-8">
          {activeTab === "conversations" ? (
            selectedParticipant ? (
              <>
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Conversation with {selectedParticipantUsername}</h2>
                  </div>
                  <div className="card-body">
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
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message here"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                      />
                      <button className="btn btn-primary" onClick={handleSendMessage}>
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title">Select a conversation to start chatting</h2>
                </div>
              </div>
            )
          ) : selectedCat ? (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Applications for {catApplications[selectedCat]?.cat?.name}</h2>
              </div>
              <div className="card-body">
                <div className="row">
                  {catApplications[selectedCat]?.applications?.map((application) => (
                    <div className="col-12 col-md-6 col-lg-4 mb-4" key={application.id}>
                      <ApplicationCard
                        application={application}
                        catName={catApplications[selectedCat]?.cat?.name || "Unknown Cat"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Select a cat to view applications</h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
