import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function BucketList({ onClose }) {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const { data, error } = await supabase
            .from('bucketlist')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setItems(data);
    };

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        const { data, error } = await supabase
            .from('bucketlist')
            .insert([{ text: newItem, completed: false }])
            .select();

        if (data) {
            setItems([data[0], ...items]);
            setNewItem('');
        }
    };

    const toggleItem = async (id, currentStatus) => {
        // Optimistic update
        setItems(items.map(item => item.id === id ? { ...item, completed: !currentStatus } : item));

        await supabase
            .from('bucketlist')
            .update({ completed: !currentStatus })
            .eq('id', id);
    };

    const deleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this dream?')) return;
        setItems(items.filter(item => item.id !== id));
        await supabase
            .from('bucketlist')
            .delete()
            .eq('id', id);
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-overlay"
        >
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2 style={{ color: 'white' }}>Our Bucket List</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={addItem} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Add a new dream..."
                            className="input-field"
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={20} />
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <AnimatePresence>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                        <button onClick={() => toggleItem(item.id, item.completed)} style={{ background: 'transparent', border: 'none', color: item.completed ? '#10b981' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                                            {item.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                        </button>
                                        <span style={{
                                            fontSize: '1.1rem', color: 'white',
                                            textDecoration: item.completed ? 'line-through' : 'none',
                                            opacity: item.completed ? 0.5 : 1
                                        }}>
                                            {item.text}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                        onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.2)'}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {items.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: '2rem' }}>What do you dream of doing together?</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
