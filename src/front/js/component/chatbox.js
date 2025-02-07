import React, { useState, useEffect, useContext, useRef } from "react";
import { Context } from "../store/appContext";
import "../../styles/chatbox.css";
// dont use the store to pull the information, use the logic thats in the inbox.js to properly grab the messages.
const Chatbox = () => {
  const { store, actions } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showConversationList, setShowConversationList] = useState(false); // Added conversation list state

  // Refs for scrolling
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Recipient info from store
  const recipientId = store.currentChatRecipientId;
  const recipientName = store.currentChatRecipientName || "Unknown User";
  const cat = store.singleCat;

  // Scroll handling
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!isCollapsed) scrollToBottom();
    actions.getMessages();
  }, [isCollapsed, messages]);

  // Conversation list functionality
  // fix this use actions.getmessages and save them as a variable and then use the foreach on that variable
  // double check where this action is getting called
  // ################################################################
  const getUniqueConversations = () => {
    const conversations = {};
    store.messages.forEach((msg) => {
      const otherUserId = msg.sender_id === store.user?.id ? msg.recipient_id : msg.sender_id;
      const otherUsername = msg.sender_id === store.user?.id ? msg.recipient : msg.sender;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          recipient_id: otherUserId,
          recipient_name: otherUsername,
          latest_message: msg.text,
          timestamp: msg.timestamp,
        };
      }
    });
    return Object.values(conversations).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  // Fetch messages when chatbox is open
  useEffect(() => {
    let intervalId;
    const fetchAndMarkMessages = async () => {
      if (!isCollapsed && recipientId) {
        try {
          const fetchedMessages = await actions.getConversationWithOwner(recipientId);
          setMessages(fetchedMessages || []);
          await actions.markMessagesAsRead(store.user?.id, recipientId);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    if (!isCollapsed && recipientId) {
      fetchAndMarkMessages();
      intervalId = setInterval(fetchAndMarkMessages, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isCollapsed, recipientId, actions, store.user?.id]);

  // Handle conversation selection
  const handleConversationSelect = (conv) => {
    actions.setChatRecipient(conv.recipient_id, conv.recipient_name);
    setShowConversationList(false);
  };

  // Message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const result = await actions.sendMessage(recipientId, messageText);
      if (result) {
        setMessages((prev) => [
          ...prev,
          {
            sender_id: store.user?.id,
            recipient_id: recipientId,
            text: messageText,
            timestamp: new Date().toISOString(),
            read: false,
          }
        ]);
      }
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className={`chatbox-wrapper ${isCollapsed ? "collapsed" : ""}`}>
      <div className="chatbox-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <button 
          className="conversation-list-button"
          onClick={(e) => {
            e.stopPropagation();
            setShowConversationList(!showConversationList);
          }}
        >
          💬
        </button>
        <span>{isCollapsed ? "Chat" : `Chat with ${recipientName}`}</span>
        <button className="collapse-button">
          {isCollapsed ? "▼" : "▲"}
        </button>
      </div>

      {showConversationList && (
        <div className="conversation-list">
          {getUniqueConversations().length > 0 ? (
            getUniqueConversations().map((conv) => (
              <div
                key={conv.recipient_id}
                className="conversation-item"
                onClick={() => handleConversationSelect(conv)}
              >
                <strong>{conv.recipient_name}</strong>: {conv.latest_message}
              </div>
            ))
          ) : (
            <p>No conversations yet.</p>
          )}
        </div>
      )}

      {!isCollapsed && (
        <div className="chatbox overflow-auto">
          <div className="messages" ref={messagesContainerRef}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.sender_id === store.user?.id ? "sent" : "received"}`}
              >
                {msg.text}
                {msg.sender_id !== store.user?.id && msg.read && (
                  <span className="read-indicator">✓</span>
                )}
              </div>
            ))}
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