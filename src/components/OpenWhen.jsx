import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Mail, BookOpen, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function OpenWhen({ onClose }) {
    const [letters, setLetters] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newLetter, setNewLetter] = useState({ title: '', content: '' });
    const [readingLetter, setReadingLetter] = useState(null);

    useEffect(() => {
        fetchLetters();
    }, []);

    const fetchLetters = async () => {
        const { data, error } = await supabase
            .from('letters')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setLetters(data);
    };

    const saveLetter = async () => {
        if (!newLetter.title || !newLetter.content) return;

        const { data, error } = await supabase
            .from('letters')
            .insert([newLetter])
            .select();

        if (data) {
            setLetters([data[0], ...letters]);
            setNewLetter({ title: '', content: '' });
            setIsAdding(false);
        }
    };

    const deleteLetter = async (id) => {
        if (!window.confirm('Are you sure you want to delete this letter?')) return;
        setLetters(letters.filter(l => l.id !== id));
        await supabase
            .from('letters')
            .delete()
            .eq('id', id);
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
                    <h2 style={{ color: 'white' }}>Open When...</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {!isAdding && !readingLetter && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="btn-secondary"
                            style={{ width: '100%', border: '2px dashed rgba(255,255,255,0.3)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Plus style={{ marginRight: '0.5rem' }} /> Write a New Letter
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
                                placeholder="Open when... (e.g. You're sad)"
                                value={newLetter.title}
                                onChange={e => setNewLetter({ ...newLetter, title: e.target.value })}
                                className="input-field"
                            />
                            <textarea
                                placeholder="Write your heart out..."
                                value={newLetter.content}
                                onChange={e => setNewLetter({ ...newLetter, content: e.target.value })}
                                className="input-field"
                                style={{ minHeight: '150px', resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
                                <button onClick={saveLetter} className="btn-primary">Seal Letter</button>
                            </div>
                        </motion.div>
                    )}

                    {readingLetter ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: '#fff1f2', color: '#881337', padding: '2rem', borderRadius: '12px', position: 'relative' }}
                        >
                            <button
                                onClick={() => setReadingLetter(null)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#881337' }}
                            >
                                <X size={20} />
                            </button>
                            <h3 style={{ marginTop: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>Open When {readingLetter.title}</h3>
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{readingLetter.content}</p>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {letters.map((letter) => (
                                <motion.div
                                    key={letter.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                                        borderRadius: '12px', padding: '1.5rem', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        textAlign: 'center', aspectRatio: '1/1', position: 'relative',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                    onClick={() => setReadingLetter(letter)}
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteLetter(letter.id); }}
                                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', border: 'none', color: '#881337', opacity: 0.5, cursor: 'pointer' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <Mail size={32} color="#e11d48" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ color: '#881337', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>{letter.title}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!isAdding && !readingLetter && letters.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem 0' }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Write a letter for a future moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
