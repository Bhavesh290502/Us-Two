import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MapPin, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function Places({ onClose }) {
    const [places, setPlaces] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newPlace, setNewPlace] = useState({ name: '', date: '', notes: '' });

    useEffect(() => {
        fetchPlaces();
    }, []);

    const fetchPlaces = async () => {
        const { data, error } = await supabase
            .from('places')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setPlaces(data);
    };

    const savePlace = async () => {
        if (!newPlace.name) return;

        const { data, error } = await supabase
            .from('places')
            .insert([newPlace])
            .select();

        if (data) {
            setPlaces([data[0], ...places]);
            setNewPlace({ name: '', date: '', notes: '' });
            setIsAdding(false);
        }
    };

    const deletePlace = async (id) => {
        if (!window.confirm('Are you sure you want to delete this adventure?')) return;
        setPlaces(places.filter(p => p.id !== id));
        await supabase
            .from('places')
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
                    <h2 style={{ color: 'white' }}>Places We've Been</h2>
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
                            <Plus style={{ marginRight: '0.5rem' }} /> Add New Adventure
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
                                placeholder="Where did we go?"
                                value={newPlace.name}
                                onChange={e => setNewPlace({ ...newPlace, name: e.target.value })}
                                className="input-field"
                            />
                            <input
                                type="date"
                                value={newPlace.date}
                                onChange={e => setNewPlace({ ...newPlace, date: e.target.value })}
                                className="input-field"
                            />
                            <textarea
                                placeholder="Favorite memory from this trip..."
                                value={newPlace.notes}
                                onChange={e => setNewPlace({ ...newPlace, notes: e.target.value })}
                                className="input-field"
                                style={{ minHeight: '100px', resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
                                <button onClick={savePlace} className="btn-primary">Save</button>
                            </div>
                        </motion.div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {places.map((place) => (
                            <div key={place.id} style={{
                                background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem',
                                border: '1px solid rgba(255,255,255,0.1)', position: 'relative'
                            }}>
                                <button
                                    onClick={() => deletePlace(place.id)}
                                    className="close-btn"
                                    style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'rgba(255,255,255,0.3)' }}
                                    onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <MapPin size={20} color="#fb923c" />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{place.name}</h3>
                                </div>
                                {place.date && (
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} /> {new Date(place.date).toLocaleDateString()}
                                    </p>
                                )}
                                {place.notes && (
                                    <p style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: '1.5' }}>
                                        "{place.notes}"
                                    </p>
                                )}
                            </div>
                        ))}

                        {places.length === 0 && !isAdding && (
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem 0' }}>
                                <MapPin size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>Where to next?</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
