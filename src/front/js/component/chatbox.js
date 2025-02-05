import React, { useState, useEffect, useContext,useRef } from "react";
import { Context } from "../store/appContext";
import "../../styles/chatbox.css";
// need a way to pull converasations 
// 
const Chatbox = () => {
  const { store, actions } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true); // State to control collapse

  const recipientId = store.currentChatRecipientId; // Access current recipient ID
  const recipientName = store.currentChatRecipientName || "Unknown User"; // Access recipient name
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!isCollapsed) {
      scrollToBottom();
    }
  }, [isCollapsed, messages]);
  
  const messagesEndRef = useRef(null); // Ref for the bottom of messages
  const messagesContainerRef = useRef(null); // Ref for the messages container
  // Fetch messages and mark them as read when the chatbox is expanded
 
 useEffect(()=>{
  console.log("store is chatboxopen changed:", store.isChatboxOpen)
  setIsCollapsed(!store.isChatboxOpen)
 }, [store.isChatboxOpen])
 
 
 
 
 const cat = store.singleCat;
 useEffect(() => {
  let intervalId;

  const fetchAndMarkMessages = async () => {
    if (!isCollapsed && recipientId) {
      try {
        const fetchedMessages = await actions.getConversationWithOwner(recipientId);
        setMessages(fetchedMessages || []);
        await actions.markMessagesAsRead(store.user.id, recipientId); // Mark messages as read
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  // Fetch messages immediately and set up interval for polling
  if (!isCollapsed && recipientId) {
    fetchAndMarkMessages();
    intervalId = setInterval(fetchAndMarkMessages, 5000); // Fetch every 5 seconds
  }

  // Cleanup interval on unmount or when chatbox is collapsed
  return () => clearInterval(intervalId);
}, [isCollapsed, recipientId, actions, store.user.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;


    actions.setChatRecipient(cat.user_id, cat.owner.username || "Owner");

    // actions.toggleChatboxOpen(true);


    try {
      const result = await actions.sendMessage(recipientId, messageText);
      if (result) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender_id: store.user.id,
            recipient_id: recipientId,
            text: messageText,
            timestamp: new Date().toISOString(),
            read: false,
          },
        ]);
      }
      setMessageText("");
      
    }
    
    catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCollapseToggle =()=>{
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    actions.toggleChatboxOpen(!newCollapsedState);
  }





  return (
    <div className={`chatbox-wrapper ${isCollapsed ? "collapsed" : ""}`}>
      {/* <div className="chatbox-header" onClick={() => setIsCollapsed(!isCollapsed)}> */}
      <div className="chatbox-header" onClick={handleCollapseToggle}>
        <span>{isCollapsed ? "Chat" : `Chat with ${recipientName}`}</span>
        <button className="collapse-button">{isCollapsed ? "▼" : "▲"}</button> {/* Toggle button */}
      </div>
      {!isCollapsed && (
        <div className="chatbox overflow-auto">
          <div className="messages "  ref={messagesContainerRef} >
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${msg.sender_id === store.user.id ? "sent" : "received"}`}
                >
                  {msg.text}
                  {msg.sender_id !== store.user.id && msg.read && (
                    <span className="read-indicator">✓</span> /* Read indicator */
                  )}
                </div>
              ))
            ) : (
              <p>No messages yet.</p>
            )}

<div ref={messagesEndRef} /> 
          </div>
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
