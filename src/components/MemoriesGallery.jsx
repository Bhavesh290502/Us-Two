import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Image as ImageIcon, Calendar } from 'lucide-react';
import { supabase } from '../supabase';

export default function MemoriesGallery({ onClose }) {
    const [memories, setMemories] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newMemory, setNewMemory] = useState({ image: null, caption: '', date: '' });

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        const { data, error } = await supabase
            .from('memories')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setMemories(data);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMemory({ ...newMemory, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const saveMemory = async () => {
        if (!newMemory.image) return;

        const { data, error } = await supabase
            .from('memories')
            .insert([newMemory])
            .select();

        if (data) {
            setMemories([data[0], ...memories]);
            setNewMemory({ image: null, caption: '', date: '' });
            setIsAdding(false);
        } else if (error) {
            console.error('Error saving memory:', error);
            alert('Could not save memory. Image might be too large for this demo.');
        }
    };

    const deleteMemory = async (id) => {
        setMemories(memories.filter(m => m.id !== id));
        await supabase
            .from('memories')
            .delete()
            .eq('id', id);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="modal-overlay"
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h2 style={{ color: 'white' }}>Our Memories</h2>
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
                            <Plus style={{ marginRight: '0.5rem' }} /> Add New Memory
                        </button>
                    )}

                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ position: 'relative', border: '2px dashed rgba(255,255,255,0.3)', borderRadius: '12px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                    {newMemory.image ? (
                                        <img src={newMemory.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                            <ImageIcon size={48} style={{ marginBottom: '0.5rem' }} />
                                            <p>Click to upload photo</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="What's happening here?"
                                    value={newMemory.caption}
                                    onChange={e => setNewMemory({ ...newMemory, caption: e.target.value })}
                                    className="input-field"
                                />
                                <input
                                    type="date"
                                    value={newMemory.date}
                                    onChange={e => setNewMemory({ ...newMemory, date: e.target.value })}
                                    className="input-field"
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
                                    <button onClick={saveMemory} className="btn-primary">Save Memory</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="memory-grid">
                        {memories.map((memory) => (
                            <motion.div
                                key={memory.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="memory-card"
                            >
                                <img src={memory.image} alt={memory.caption} />
                                <div style={{ padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', position: 'absolute', bottom: 0, left: 0, width: '100%', boxSizing: 'border-box' }}>
                                    <p style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>{memory.caption}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center' }}>
                                        <Calendar size={12} style={{ marginRight: '0.25rem' }} /> {memory.date}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteMemory(memory.id)}
                                    className="close-btn"
                                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)' }}
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
