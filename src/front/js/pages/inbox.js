// (1) Importing React and hooks, plus Context from our store and React Router
import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useLocation } from "react-router-dom";
import "../../styles/inbox.css";
import ApplicationCard from "../component/applicationCard";

// (2) The Inbox component manages messages (conversations) and cat applications.
function Inbox() {
  // (2a) Destructure store and actions from our global context
  const { store, actions } = useContext(Context);

  // (2b) We'll use useLocation to retrieve any state passed via route navigation
  const location = useLocation();

  // (2c) Local state variables for managing conversations, applications, and current selections
  const [conversations, setConversations] = useState({});
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedParticipantUsername, setSelectedParticipantUsername] = useState("");
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const [catApplications, setCatApplications] = useState({});
  const [selectedCat, setSelectedCat] = useState(null);
  const [sentApplications,setSentApplications] = useState([]);
  
  const [AppliedCat, setAppliedCat] = useState(null);

  // (2d) These values may come from route state to open a specific conversation
  const recipientIdFromProps = location.state?.recipientId || null;
  const recipientNameFromProps = location.state?.recipientName || null;

  // (3) useEffect to fetch all messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      await actions.getMessages();
    };
    fetchMessages();
  }, [actions]);

  // (4) Once messages are fetched, build a conversations object grouping by participant.
  //     If a recipientId is passed, we auto-select that conversation.
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
        actions.setChatRecipient(
          recipientIdFromProps,
          recipientNameFromProps || "Unknown User"
        );
      }
    }
  }, [store.messages, store.user, recipientIdFromProps, recipientNameFromProps, actions]);

  // (5) useEffect to fetch cat applications
  useEffect(() => {
    const fetchApplications = async () => {
      const data = await actions.getCatApplications();
      if (data) setCatApplications(data);
    };
    fetchApplications();
  }, [actions]);

  useEffect(()=>{
    if (activeTab === "sentApplications") {
      const loadSentApplications = async ()=>{
        const data = await actions.fetchSentApplications()
        if (data) {
          setSentApplications(data)
        }
      }
      loadSentApplications()
    }
  }, [activeTab])






  // ################################ SENT APPLICATIONS FUNCTIONALITY ################################
  // (6) Function to fetch applications that the user has sent out
  const fetchSentApplications = async () => {
    const sentApps = await actions.fetchSentApplications(); // Adjust to your action function
    if (sentApps) setAppliedCat(store.sentApplications);
  };
  // ################################ END OF SENT APPLICATIONS FUNCTIONALITY ################################

  // (7) Selecting a conversation sets the participant and marks messages as read.
  const handleSelectConversation = async (participantId) => {
    setSelectedParticipant(participantId);
    setSelectedParticipantUsername(conversations[participantId]?.username || "Unknown User");
    await actions.markMessagesAsRead(store.user.id, participantId);
    actions.setChatRecipient(
      participantId,
      conversations[participantId]?.username || "Unknown User"
    );
  };

  // (8) Selecting a cat application sets that cat in state to display its applications
  const handleSelectApplication = (catId) => {
    setSelectedCat(catId);
    
  };

  // (9) Sending a message calls an action and updates local conversations state if successful
  const handleSendMessage = async () => {
    if (messageText.trim() && selectedParticipant) {
      const result = await actions.sendMessage(selectedParticipant, messageText);
      if (result) {
        const newMessage = result.data;
        setConversations((prevConversations) => {
          const updatedConversations = { ...prevConversations };
          if (!updatedConversations[selectedParticipant]) {
            updatedConversations[selectedParticipant] = {
              username: selectedParticipantUsername,
              messages: [],
            };
          }
          updatedConversations[selectedParticipant].messages.push(newMessage);
          return updatedConversations;
        });
        setMessageText("");
      }
    }
  };

  // (10) Rendering the Inbox with tabs for conversations, applications, and sent applications
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-4">
          <div className="dflex justify-content-center tab-navigation">
            <button
              className={`border rounded m-2 btn btn-light ${
                activeTab === "conversations" ? "active" : ""
              }`}
              onClick={() => setActiveTab("conversations")}
            >
              Conversations
            </button>
            <button
              className={`border rounded m-2 btn btn-light ${
                activeTab === "applications" ? "active" : ""
              }`}
              onClick={() => setActiveTab("applications")}
            >
              Applications
            </button>
            <button
              className={`border rounded m-2 btn btn-light ${
                activeTab === "sentApplications" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("sentApplications");
                fetchSentApplications();
              }}
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
                  className={`list-group-item list-group-item-action ${
                    participantId === selectedParticipant ? "active" : ""
                  }`}
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
                  className={`list-group-item list-group-item-action ${
                    catId === selectedCat ? "active" : ""
                  }`}
                  onClick={() => handleSelectApplication(catId)}
                >
                  Applications for {catApplications[catId]?.cat?.name}
                </div>
              ))}
            </div>
          ) : (
            // ################################ SENT APPLICATIONS FUNCTIONALITY ################################
            activeTab === "sentApplications" && (
              <div className="application-list">
              <h3>Sent Applications</h3>
             {sentApplications.length >0  ? (
              sentApplications.map((application)=> (
                <div key = {application.id} className="list-group-item list-group-item-action"> 
               <h5>application for {application.cat_name}
                <p>status: <span className={`badge bg-${application.status === "pending" ? "warning" : application.status === "approved" ? "success" : "danger"}`}>
                  "application.status"
                  </span></p>
                  <p>submitted: {new Date(application.created_at).toLocaleDateString()}</p>
               </h5>
                </div>
              ))
            ) :(
              <p>no applications sent</p>
            
             )}
             
             
             
             
             
             
              {/* {Object.keys(AppliedCat || {}).map((catId) => (
                <div
                  key={catId}
                  className={`list-group-item list-group-item-action ${
                    catId === selectedCat ? "active" : ""
                  }`}
                  onClick={() => handleSelectApplication(catId)}
                >
                  Sent Applications for {AppliedCat[catId]?.cat?.name}
                </div>
              ))} */}
            </div>
          )
           
            // ################################ END OF SENT APPLICATIONS FUNCTIONALITY ################################
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
                        className={`message ${
                          message.sender_id === store.user.id ? "sent" : "received"
                        }`}
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
          ) : selectedCat ? (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  Applications for {catApplications[selectedCat]?.cat?.name}
                </h2>
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
}

export default Inbox;
