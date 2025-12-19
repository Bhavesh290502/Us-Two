import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Plus, Trash2, Calendar, Heart } from 'lucide-react';
import { supabase } from '../supabase';

export default function Countdown({ onClose }) {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ name: '', date: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from('countdown')
            .select('*')
            .order('date', { ascending: true });
        if (data) setEvents(data);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setEvents(prev => [...prev]); // Force re-render for countdown
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const saveEvent = async () => {
        if (!newEvent.name || !newEvent.date) return;

        const { data, error } = await supabase
            .from('countdown')
            .insert([newEvent])
            .select();

        if (data) {
            setEvents([...events, data[0]].sort((a, b) => new Date(a.date) - new Date(b.date)));
            setNewEvent({ name: '', date: '' });
            setIsAdding(false);
        }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        setEvents(events.filter(e => e.id !== id));
        await supabase
            .from('countdown')
            .delete()
            .eq('id', id);
    }

    const calculateTimeLeft = (dateString) => {
        const difference = +new Date(dateString) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return timeLeft;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-overlay"
        >
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2 style={{ color: 'white' }}>Countdown</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="btn-secondary"
                            style={{ width: '100%', border: '2px dashed rgba(255,255,255,0.3)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Plus style={{ marginRight: '0.5rem' }} /> Add Special Date
                        </button>
                    )}

                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                        >
                            <input
                                type="text"
                                placeholder="Event Name (e.g. Anniversary)"
                                value={newEvent.name}
                                onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                                className="input-field"
                            />
                            <input
                                type="date"
                                value={newEvent.date}
                                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                className="input-field"
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
                                <button onClick={saveEvent} className="btn-primary">Save</button>
                            </div>
                        </motion.div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.map((event) => {
                            const timeLeft = calculateTimeLeft(event.date);
                            return (
                                <div key={event.id} style={{
                                    background: 'linear-gradient(to right, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px', padding: '1.5rem', position: 'relative'
                                }}>
                                    <button
                                        onClick={() => deleteEvent(event.id)}
                                        className="close-btn"
                                        style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'rgba(255,255,255,0.3)' }}
                                        onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                        onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Heart size={20} fill="#ec4899" color="#ec4899" /> {event.name}
                                    </h3>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} /> {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>

                                    <div className="countdown-grid">
                                        {Object.entries(timeLeft).map(([unit, value]) => (
                                            <div key={unit} className="countdown-item">
                                                <span className="countdown-value">{value}</span>
                                                <span className="countdown-label">{unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {events.length === 0 && !isAdding && (
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem 0' }}>
                                <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>What are we counting down to?</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
