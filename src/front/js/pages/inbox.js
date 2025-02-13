import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useLocation } from "react-router-dom";
import "../../styles/inbox.css";
import ApplicationCard from "../component/applicationCard";
import useWindowDimensions from "../hooks/windowDimensions";

function Inbox() {
  const { store, actions } = useContext(Context);
  const location = useLocation();
  const { width } = useWindowDimensions();

  // Local state variables
  const [conversations, setConversations] = useState({});
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedParticipantUsername, setSelectedParticipantUsername] = useState("");
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const [catApplications, setCatApplications] = useState({});
  const [selectedCat, setSelectedCat] = useState(null);
  const [sentApplications, setSentApplications] = useState([]);
  const [selectedSentApplication, setSelectedSentApplication] = useState(null);

  const recipientIdFromProps = location.state?.recipientId || null;
  const recipientNameFromProps = location.state?.recipientName || null;

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      await actions.getMessages();
    };
    fetchMessages();
  }, [actions]);

  // Build conversations from messages
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

  // Fetch cat applications on mount
  useEffect(() => {
    const fetchApplications = async () => {
      const data = await actions.getCatApplications();
      if (data) setCatApplications(data);
    };
    fetchApplications();
  }, [actions]);

  // Fetch sent applications when that tab is active
  useEffect(() => {
    if (activeTab === "sentApplications") {
      const loadSentApplications = async () => {
        const data = await actions.fetchSentApplications();
        if (data) {
          setSentApplications(data);
        }
      };
      loadSentApplications();
    }
  }, [activeTab, actions]);

  const handleSelectConversation = async (participantId) => {
    setSelectedParticipant(participantId);
    setSelectedParticipantUsername(conversations[participantId]?.username || "Unknown User");
    await actions.markMessagesAsRead(store.user.id, participantId);
    actions.setChatRecipient(
      participantId,
      conversations[participantId]?.username || "Unknown User"
    );
  };

  const handleSelectApplication = (catId) => {
    setSelectedCat(catId);
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedParticipant) {
      const result = await actions.sendMessage(selectedParticipant, messageText);
      if (result) {
        const newMessage = result.data;
        setConversations((prev) => {
          const updated = { ...prev };
          if (!updated[selectedParticipant]) {
            updated[selectedParticipant] = {
              username: selectedParticipantUsername,
              messages: [],
            };
          }
          updated[selectedParticipant].messages.push(newMessage);
          return updated;
        });
        setMessageText("");
      }
    }
  };

  // --- DESKTOP LAYOUT (width > 400) ---
  if (width > 400) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-4">
            <div className="d-flex justify-content-center tab-navigation">
              <button
                className={`border rounded m-2 btn btn-light ${activeTab === "conversations" ? "active" : ""}`}
                onClick={() => setActiveTab("conversations")}
              >
                Conversations
              </button>
              <button
                className={`border rounded m-2 btn btn-light ${activeTab === "applications" ? "active" : ""}`}
                onClick={() => setActiveTab("applications")}
              >
                Applications
              </button>
              <button
                className={`border rounded m-2 btn btn-light ${activeTab === "sentApplications" ? "active" : ""}`}
                onClick={() => setActiveTab("sentApplications")}
              >
                Sent Applications
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
            ) : activeTab === "applications" ? (
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
            ) : (
              <div className="application-list">
                <h3>Sent Applications</h3>
                {sentApplications.length > 0 ? (
                  sentApplications.map((application) => (
                    <div
                      key={application.id}
                      className={`list-group-item list-group-item-action ${application.id === selectedSentApplication?.id ? "active" : ""}`}
                      onClick={() => setSelectedSentApplication(application)}
                    >
                      <h5>Application for {application.cat_name}</h5>
                      <p>
                        Status:{" "}
                        <span
                          className={`badge bg-${
                            application.status === "pending" ? "warning" : application.status === "approved" ? "success" : "danger"
                          }`}
                        >
                          {application.status}
                        </span>
                      </p>
                      <p>Submitted: {new Date(application.created_at).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No applications sent</p>
                )}
              </div>
            )}
          </div>

          <div className="col-8">
            {activeTab === "conversations" ? (
              selectedParticipant ? (
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
              ) : (
                <div className="card my-2">
                  <div className="card-body">
                    <h2 className="card-title">Select a conversation to start chatting</h2>
                  </div>
                </div>
              )
            ) : activeTab === "applications" && selectedCat ? (
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
            ) : activeTab === "sentApplications" ? (
              selectedSentApplication ? (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Application for {selectedSentApplication.cat_name}</h2>
                  </div>
                  <div className="card-body">
                    <div className="application-details">
                      <div className="mb-3">
                        <h5>Status:</h5>
                        <span
                          className={`badge bg-${
                            selectedSentApplication.status === "pending"
                              ? "warning"
                              : selectedSentApplication.status === "approved"
                              ? "success"
                              : "danger"
                          }`}
                        >
                          {selectedSentApplication.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <h5>Submitted On:</h5>
                        <p>{new Date(selectedSentApplication.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="mb-3">
                        <h5>Applicant Name:</h5>
                        <p>{selectedSentApplication.applicant_name}</p>
                      </div>
                      <div className="mb-3">
                        <h5>Contact Information:</h5>
                        <p>{selectedSentApplication.contact_info}</p>
                      </div>
                      <div className="mb-3">
                        <h5>Application Reason:</h5>
                        <p>{selectedSentApplication.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card my-2">
                  <div className="card-body">
                    <h2 className="card-title">Select an application to view details</h2>
                  </div>
                </div>
              )
            ) : (
              <div className="card my-2">
                <div className="card-body">
                  <h2 className="card-title">Select a cat to view applications</h2>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MOBILE LAYOUT (width <= 400) ---
  return (
    <div className="mobile-container">
      <div className="mobile-content">
        {activeTab === "conversations" ? (
          selectedParticipant ? (
            <div className="mobile-detail">
              <button className="btn btn-link" onClick={() => setSelectedParticipant(null)}>
                Back
              </button>
              <h2>Conversation with {selectedParticipantUsername}</h2>
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
          ) : (
            <div className="mobile-list">
              <h3>Conversations</h3>
              {Object.keys(conversations).map((participantId) => (
                <div
                  key={participantId}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSelectConversation(participantId)}
                >
                  Conversation with {conversations[participantId]?.username || `User ${participantId}`}
                </div>
              ))}
            </div>
          )
        ) : activeTab === "applications" ? (
          selectedCat ? (
            <div className="mobile-detail">
              <button className="btn btn-link" onClick={() => setSelectedCat(null)}>
                Back
              </button>
              <h2>Applications for {catApplications[selectedCat]?.cat?.name}</h2>
              <div className="row">
                {catApplications[selectedCat]?.applications?.map((application) => (
                  <div className="col-12 mb-4" key={application.id}>
                    <ApplicationCard
                      application={application}
                      catName={catApplications[selectedCat]?.cat?.name || "Unknown Cat"}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mobile-list">
              <h3>Applications</h3>
              {Object.keys(catApplications).map((catId) => (
                <div
                  key={catId}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSelectApplication(catId)}
                >
                  Applications for {catApplications[catId]?.cat?.name}
                </div>
              ))}
            </div>
          )
        ) : activeTab === "sentApplications" ? (
          selectedSentApplication ? (
            <div className="mobile-detail">
              <button className="btn btn-link" onClick={() => setSelectedSentApplication(null)}>
                Back
              </button>
              <h2>Application for {selectedSentApplication.cat_name}</h2>
              <div className="application-details">
                <div className="mb-3">
                  <h5>Status:</h5>
                  <span
                    className={`badge bg-${
                      selectedSentApplication.status === "pending"
                        ? "warning"
                        : selectedSentApplication.status === "approved"
                        ? "success"
                        : "danger"
                    }`}
                  >
                    {selectedSentApplication.status}
                  </span>
                </div>
                <div className="mb-3">
                  <h5>Submitted On:</h5>
                  <p>{new Date(selectedSentApplication.created_at).toLocaleDateString()}</p>
                </div>
                <div className="mb-3">
                  <h5>Applicant Name:</h5>
                  <p>{selectedSentApplication.applicant_name}</p>
                </div>
                <div className="mb-3">
                  <h5>Contact Information:</h5>
                  <p>{selectedSentApplication.contact_info}</p>
                </div>
                <div className="mb-3">
                  <h5>Application Reason:</h5>
                  <p>{selectedSentApplication.reason}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mobile-list">
              <h3>Sent Applications</h3>
              {sentApplications.length > 0 ? (
                sentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => setSelectedSentApplication(application)}
                  >
                    <h5>Application for {application.cat_name}</h5>
                    <p>
                      Status:{" "}
                      <span
                        className={`badge bg-${
                          application.status === "pending" ? "warning" : application.status === "approved" ? "success" : "danger"
                        }`}
                      >
                        {application.status}
                      </span>
                    </p>
                    <p>Submitted: {new Date(application.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p>No applications sent</p>
              )}
            </div>
          )
        ) : null}
      </div>
      {/* Fixed bottom navigation for mobile */}
      <div className="mobile-nav fixed-bottom d-flex justify-content-around bg-light p-2">
        <button
          className={`btn btn-link ${activeTab === "conversations" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("conversations");
            setSelectedParticipant(null);
            setSelectedCat(null);
            setSelectedSentApplication(null);
          }}
        >
          Conversations
        </button>
        <button
          className={`btn btn-link ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("applications");
            setSelectedParticipant(null);
            setSelectedCat(null);
            setSelectedSentApplication(null);
          }}
        >
          Applications
        </button>
        <button
          className={`btn btn-link ${activeTab === "sentApplications" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("sentApplications");
            setSelectedParticipant(null);
            setSelectedCat(null);
            setSelectedSentApplication(null);
          }}
        >
          Sent Applications
        </button>
      </div>
    </div>
  );
}

export default Inbox;
