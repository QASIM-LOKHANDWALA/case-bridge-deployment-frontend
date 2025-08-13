import React, { useEffect, useState, useRef } from "react";
import {
    Send,
    User,
    MessageCircle,
    Clock,
    Search,
    ArrowLeft,
    Bot,
    CheckCheck,
    Check,
    Users,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const ChatPage = () => {
    const [contacts, setContacts] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newText, setNewText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const { token, user, isAuthenticated } = useAuth();

    useEffect(() => {
        axiosInstance
            .get("/api/chat/contacts/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            })
            .then((res) => setContacts(res.data))
            .catch((err) => {
                toast.error(`Error fetching contacts: ${err.message}`);
            });
    }, [token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }
    }, [newText]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        return () => {
            clearPollingInterval();
        };
    }, []);

    const openConversation = async (contact) => {
        try {
            const res = await axiosInstance.post(
                "/api/chat/start/",
                {
                    participant_id: contact.user_id,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
            setConversation({ id: res.data.conversation_id, ...contact });
            setMessages([]);
            setShowMobileChat(true);
            fetchMessages(res.data.conversation_id);
            startPollingMessages(res.data.conversation_id);
        } catch (error) {
            toast.error("Failed to start conversation:", error);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const res = await axiosInstance.get(
                `/api/chat/conversations/${conversationId}/messages/`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
            setMessages(res.data);
        } catch (error) {
            toast.error("Failed to fetch messages:", error);
        }
    };

    const pollingIntervalRef = useRef(null);

    const clearPollingInterval = () => {
        if (pollingIntervalRef.current) {
            if (isDev) console.log("Clearing previous polling interval");
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const startPollingMessages = (conversationId) => {
        if (isDev)
            console.log("Started Polling for conversation", conversationId);

        clearPollingInterval();

        pollingIntervalRef.current = setInterval(() => {
            if (isDev) console.log("Updating Conversations");
            fetchMessages(conversationId);
        }, 5000);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const filteredContacts = contacts.filter(
        (contact) =>
            contact.full_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sendMessage = async () => {
        if (!newText.trim()) return;

        const url = `/api/chat/conversations/${conversation.id}/send/`;

        const tempMessage = {
            id: Date.now(),
            sender: user.id,
            sender_email: user.email,
            text: newText,
            timestamp: new Date().toISOString(),
            status: "sending",
        };

        setMessages((prev) => [...prev, tempMessage]);

        const messageText = newText;
        setNewText("");

        try {
            const res = await axiosInstance.post(
                url,
                { text: messageText },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
        } catch (err) {
            if (isDev) console.error("Message failed", err);
            setMessages((prev) => prev.slice(0, -1));
            setNewText(messageText);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatMessageDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }
    };

    const isOnline = (userId) => {
        return onlineUsers.has(userId);
    };

    const getLastSeen = (contact) => {
        if (isOnline(contact.user_id)) return "Online";
        return "Last seen recently";
    };

    const ContactItem = ({ contact }) => (
        <button
            className={`w-full text-left p-4 hover:bg-gray-700 transition-all duration-200 ${
                conversation?.user_id === contact.user_id
                    ? "bg-gray-700 border-r-4 border-r-blue-500"
                    : ""
            }`}
            onClick={() => {
                openConversation(contact);
                if (isDev) console.log(contact);
            }}
        >
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-600`}
                    >
                        {contact.profile_picture ? (
                            <img
                                src={contact.profile_picture}
                                alt={contact.full_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    {isOnline(contact.user_id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate">
                            {contact.full_name}
                        </h3>
                        <span className="text-xs text-gray-400">2:30 PM</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                        {getLastSeen(contact)}
                    </p>
                </div>
            </div>
        </button>
    );

    const MessageBubble = ({ msg, isOwnMessage }) => (
        <div
            className={`flex mb-4 ${
                isOwnMessage ? "justify-end" : "justify-start"
            }`}
        >
            <div
                className={`flex items-end space-x-2 max-w-xs lg:max-w-md xl:max-w-lg ${
                    isOwnMessage
                        ? "flex-row-reverse space-x-reverse"
                        : "flex-row"
                }`}
            >
                {!isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <User className="w-4 h-4 text-gray-400" />
                    </div>
                )}
                <div className="flex flex-col">
                    <div
                        className={`px-4 py-2 rounded-2xl shadow-sm ${
                            isOwnMessage
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-white"
                        } ${isOwnMessage ? "rounded-br-md" : "rounded-bl-md"}`}
                    >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                        </p>
                    </div>
                    <div
                        className={`flex items-center mt-1 space-x-1 ${
                            isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                    >
                        <span className="text-xs text-gray-500">
                            {formatTime(msg.timestamp)}
                        </span>
                        {isOwnMessage && (
                            <div className="text-gray-500">
                                {msg.status === "sending" ? (
                                    <Clock className="w-3 h-3" />
                                ) : (
                                    <Check className="w-3 h-3" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="flex flex-col h-screen">
                {isAuthenticated &&
                    (user.role === "lawyer" ? (
                        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-2xl font-bold text-white">
                                        Case
                                        <span className="text-blue-400">
                                            Bridge
                                        </span>
                                    </div>
                                    <div className="hidden md:block text-sm text-gray-400">
                                        Lawyer Dashboard
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-sm font-medium text-white">
                                                {user.lawyer_profile.full_name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Advocate
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>
                    ) : (
                        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-2xl font-bold text-white">
                                        Case
                                        <span className="text-blue-400">
                                            Bridge
                                        </span>
                                    </div>
                                    <div className="hidden md:block text-sm text-gray-400">
                                        Client Dashboard
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-sm font-medium text-white">
                                                {
                                                    user?.general_profile
                                                        ?.full_name
                                                }
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Client
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>
                    ))}
                <div className="flex-1 overflow-auto">
                    <div className={`flex bg-gray-900 h-full`}>
                        <div
                            className={`${
                                showMobileChat ? "hidden" : "flex"
                            } md:flex w-full md:w-80 bg-gray-800 border-r border-gray-700 flex-col`}
                        >
                            <div className="p-4 bg-gray-800 border-b border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <MessageCircle className="w-6 h-6 text-blue-400" />
                                        <h2 className="text-xl font-semibold text-white">
                                            Messages
                                        </h2>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Link
                                            to="/home"
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {filteredContacts.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">
                                            No contacts found
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {searchTerm
                                                ? "Try a different search term"
                                                : "Your conversations will appear here"}
                                        </p>
                                    </div>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <ContactItem
                                            key={contact.user_id}
                                            contact={contact}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        <div
                            className={`${
                                showMobileChat ? "flex" : "hidden"
                            } md:flex flex-1 flex-col bg-gray-900`}
                        >
                            {conversation ? (
                                <>
                                    <div className="p-4 bg-gray-800 border-b border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    onClick={() =>
                                                        setShowMobileChat(false)
                                                    }
                                                >
                                                    <ArrowLeft className="w-5 h-5" />
                                                </button>
                                                <div className="relative">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-600`}
                                                    >
                                                        <User className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    {isOnline(
                                                        conversation.user_id
                                                    ) && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">
                                                        {conversation.full_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">
                                                        {getLastSeen(
                                                            conversation
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4">
                                        {messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                <div
                                                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gray-800`}
                                                >
                                                    <MessageCircle className="w-10 h-10 text-gray-500" />
                                                </div>
                                                <h3 className="text-xl font-medium text-white mb-2">
                                                    {`Chat with ${conversation.full_name}`}
                                                </h3>
                                                <p className="text-center text-gray-500 max-w-sm">
                                                    {
                                                        "No messages yet. Start the conversation!"
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {messages.map((msg, index) => {
                                                    const isOwnMessage =
                                                        msg.sender !==
                                                        conversation.user_id;
                                                    const showDateHeader =
                                                        index === 0 ||
                                                        formatMessageDate(
                                                            messages[index - 1]
                                                                .timestamp
                                                        ) !==
                                                            formatMessageDate(
                                                                msg.timestamp
                                                            );

                                                    return (
                                                        <React.Fragment
                                                            key={msg.id}
                                                        >
                                                            {showDateHeader && (
                                                                <div className="flex justify-center my-4">
                                                                    <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                                                                        {formatMessageDate(
                                                                            msg.timestamp
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <MessageBubble
                                                                msg={msg}
                                                                isOwnMessage={
                                                                    isOwnMessage
                                                                }
                                                            />
                                                        </React.Fragment>
                                                    );
                                                })}

                                                <div ref={messagesEndRef} />
                                            </>
                                        )}
                                    </div>

                                    <div className="p-4 bg-gray-800 border-t border-gray-700">
                                        <div className="flex items-end space-x-3">
                                            <div className="flex-1 relative">
                                                <textarea
                                                    ref={textareaRef}
                                                    value={newText}
                                                    onChange={(e) =>
                                                        setNewText(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyPress={handleKeyPress}
                                                    placeholder={`Message ${conversation.full_name}...`}
                                                    className="w-full p-3 pr-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent scrollbar-thin scrollbar-thumb-gray-600"
                                                    rows="1"
                                                    style={{
                                                        maxHeight: "120px",
                                                        minHeight: "48px",
                                                        overflow: "hidden",
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={sendMessage}
                                                disabled={!newText.trim()}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center transform hover:scale-105 active:scale-95"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center p-8">
                                    <div className="text-center text-gray-400 max-w-md">
                                        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <MessageCircle className="w-12 h-12 text-gray-600" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-white mb-3">
                                            Welcome to CaseBridge Messages
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed">
                                            Select a conversation from the
                                            sidebar to start chatting with your
                                            legal team or use our AI Legal
                                            Assistant for instant help.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatPage;
