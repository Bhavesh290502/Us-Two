import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Gift, ExternalLink, Trash2, ShoppingBag } from 'lucide-react';
import { supabase } from '../supabase';

export default function Wishlist({ onClose }) {
    const [items, setItems] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', url: '', price: '', note: '' });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const { data, error } = await supabase
            .from('wishlist')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setItems(data);
    };

    const saveItem = async () => {
        if (!newItem.name) return;

        // Ensure URL has protocol
        let url = newItem.url;
        if (url && !url.startsWith('http')) {
            url = 'https://' + url;
        }

        const itemToSave = { ...newItem, url };

        const { data, error } = await supabase
            .from('wishlist')
            .insert([itemToSave])
            .select();

        if (data) {
            setItems([data[0], ...items]);
            setNewItem({ name: '', url: '', price: '', note: '' });
            setIsAdding(false);
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this gift idea?')) return;
        setItems(items.filter(i => i.id !== id));
        await supabase
            .from('wishlist')
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
                    <h2 style={{ color: 'white' }}>Our Wishlist</h2>
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
                            <Plus style={{ marginRight: '0.5rem' }} /> Add Gift Idea
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
                                placeholder="Product Name"
                                value={newItem.name}
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                className="input-field"
                            />
                            <input
                                type="text"
                                placeholder="Link (URL)"
                                value={newItem.url}
                                onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                                className="input-field"
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Price (optional)"
                                    value={newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    className="input-field"
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="text"
                                    placeholder="Note (e.g. Size M)"
                                    value={newItem.note}
                                    onChange={e => setNewItem({ ...newItem, note: e.target.value })}
                                    className="input-field"
                                    style={{ flex: 2 }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
                                <button onClick={saveItem} className="btn-primary">Save</button>
                            </div>
                        </motion.div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.map((item) => (
                            <div key={item.id} style={{
                                background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem',
                                border: '1px solid rgba(255,255,255,0.1)', position: 'relative',
                                display: 'flex', alignItems: 'center', gap: '1rem'
                            }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Gift color="white" size={24} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.25rem 0' }}>
                                        {item.name}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                        {item.price && <span>{item.price}</span>}
                                        {item.note && <span>• {item.note}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary"
                                            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }}
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="close-btn"
                                        style={{ position: 'static', background: 'rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {items.length === 0 && !isAdding && (
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem 0' }}>
                                <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>What's on your wishlist?</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
