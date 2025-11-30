import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User } from 'lucide-react';
import { supabase } from '../supabase';

export default function Chat({ onClose, session }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const userEmail = session?.user?.email;

    useEffect(() => {
        // Fetch initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat')
                .select('*')
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('chat_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat' }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            text: newMessage,
            sender: userEmail, // Use email to identify sender
            timestamp: new Date().toISOString()
        };

        const { error } = await supabase
            .from('chat')
            .insert([message]);

        if (error) {
            console.error('Error sending message:', error);
        } else {
            setNewMessage('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-overlay"
        >
            <div className="modal-content" style={{ height: '80vh', maxWidth: '500px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ color: 'white', margin: 0 }}>Love Notes</h2>
                    </div>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {messages.map((msg) => {
                            const isMe = msg.sender === userEmail;
                            return (
                                <div key={msg.id} className={`chat-message`} style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '80%',
                                    marginBottom: '1rem'
                                }}>
                                    <div className={`chat-bubble`} style={{
                                        background: isMe ? 'linear-gradient(to right, #ec4899, #db2777)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '0.75rem 1rem',
                                        borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: 'rgba(255,255,255,0.4)',
                                        marginTop: '0.25rem',
                                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                                    }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="input-field"
                            style={{ borderRadius: '24px', padding: '0.75rem 1.25rem' }}
                        />
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Send size={20} style={{ marginLeft: '2px' }} />
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
