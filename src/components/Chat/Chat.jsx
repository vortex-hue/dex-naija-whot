import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../../socket/socket';
import './Chat.css';

// Simple 'pop' sound
const notificationSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAABAFRYVFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFRYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFRYAAAAHAAAA2NvbXBhdGlibHGVX2JyYW5kcwBtcDQyYXZjMQBUU1NFAAAADwAAA0xhdmY1Ny41Ni4xMDIAAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVLFn8J1AAABAAAB8IAQMAhAkFwM+D/4P/w//D/8P/w//D/8P/w//D/8P/w//D/8P/w//D/8P/w//D/8P/w//D/8P/w//D/8MAAAABgAAAAABnENkAAACkAAABRDAwMAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwAAD/80DEAAABA0gAAAAA//NkxAAACpCQAABQAAAAAAf/zZMQAAAqQkAAAUAAAAAAP/zZMQAAAqQkAAAUAAAAAAP/zZMQAAAqQkAAAUAAAAAAP/zZMQAAAqQkAAAUAAAAAAP/zZMQAAAqQkAAAUAAAAAAP/zZMQAAAqQkAAAUAAAAAAA==");

const Chat = ({ roomId, storedId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isUnread, setIsUnread] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                // Play sound if message is from opponent
                if (msg.senderId !== storedId) {
                    notificationSound.currentTime = 0;
                    notificationSound.play().catch(e => console.log("Audio play failed", e));
                }
                return [...prev, msg];
            });

            if (!isOpen) {
                setIsUnread(true);
            } else {
                socket.emit('mark_read', { room_id: roomId, user_id: storedId });
            }
        };

        const handleChatHistory = (history) => {
            setMessages(history);
            if (isOpen) {
                socket.emit('mark_read', { room_id: roomId, user_id: storedId });
            }
        };

        const handleMessagesRead = ({ readerId }) => {
            if (readerId !== storedId) {
                setMessages(prev => prev.map(msg =>
                    msg.senderId === storedId ? { ...msg, status: 'read' } : msg
                ));
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('chat_history', handleChatHistory);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('chat_history', handleChatHistory);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [isOpen, roomId, storedId]);

    // Also trigger mark_read when opening
    useEffect(() => {
        if (isOpen) {
            socket.emit('mark_read', { room_id: roomId, user_id: storedId });
        }
    }, [isOpen, roomId, storedId]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgData = {
            room_id: roomId,
            message: newMessage.trim(),
            senderId: storedId // Use 'user' for self if simpler, but storedId is distinct
        };

        socket.emit('send_message', msgData);
        setNewMessage('');
        // Optimistic UI update could be done here, but socket is fast enough
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setIsUnread(false);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                className={`chat-toggle-btn ${isUnread ? 'unread' : ''}`}
                onClick={toggleChat}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
            >
                <span className="icon">💬</span>
                {isUnread && <span className="badge" />}
            </motion.button>

            {/* Chat Modal/Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window"
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                    >
                        <div className="chat-header">
                            <h3>Game Chat</h3>
                            <button className="chat-close-btn" onClick={toggleChat}>×</button>
                        </div>

                        <div className="chat-messages">
                            {(messages || []).length === 0 ? (
                                <p className="chat-empty">No messages yet. Say hi!</p>
                            ) : (
                                (messages || []).map((msg, index) => (
                                    <div
                                        key={msg.id || index}
                                        className={`chat-bubble ${msg.senderId === storedId ? 'mine' : 'theirs'}`}
                                    >
                                        <div className="text">{msg.text || ""}</div>
                                        <div className="time">
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={sendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!newMessage.trim()}>➤</button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chat;
