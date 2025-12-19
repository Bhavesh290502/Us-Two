import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Image as ImageIcon, Calendar, Video, Play, Loader } from 'lucide-react';
import { supabase } from '../supabase';

export default function MemoriesGallery({ onClose }) {
    const [memories, setMemories] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newMemory, setNewMemory] = useState({ image: null, caption: '', date: '', file: null });

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

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a local preview URL
            const previewUrl = URL.createObjectURL(file);
            setNewMemory({ ...newMemory, image: previewUrl, file: file });
        }
    };

    const saveMemory = async () => {
        if (!newMemory.file) return;
        setUploading(true);

        try {
            const file = newMemory.file;
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('memories')
                .getPublicUrl(filePath);

            // 3. Save to Database
            const { data, error: dbError } = await supabase
                .from('memories')
                .insert([{
                    image: publicUrl, // Store the URL, not the file
                    caption: newMemory.caption,
                    date: newMemory.date
                }])
                .select();

            if (dbError) throw dbError;

            if (data) {
                setMemories([data[0], ...memories]);
                setNewMemory({ image: null, caption: '', date: '', file: null });
                setIsAdding(false);
            }

        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error uploading file. Did you create the "memories" bucket in Supabase? Check STORAGE_SETUP.md');
        } finally {
            setUploading(false);
        }
    };

    const deleteMemory = async (id, imageUrl) => {
        if (!window.confirm('Are you sure you want to delete this memory?')) return;
        setMemories(memories.filter(m => m.id !== id));

        // Delete from DB
        await supabase.from('memories').delete().eq('id', id);

        // Try to delete from storage (optional cleanup)
        if (imageUrl && imageUrl.includes('supabase')) {
            const path = imageUrl.split('/').pop();
            await supabase.storage.from('memories').remove([path]);
        }
    }

    const isVideo = (url) => {
        if (!url) return false;
        // Check extension or data URI
        return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.startsWith('data:video');
    };

    const [selectedMemory, setSelectedMemory] = useState(null);

    const downloadMemory = async (e, memory) => {
        e.stopPropagation();
        try {
            const response = await fetch(memory.image);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `memory_${memory.date || 'download'}.${blob.type.split('/')[1]}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback for simple link download if fetch fails (e.g. CORS)
            const link = document.createElement('a');
            link.href = memory.image;
            link.target = '_blank';
            link.download = `memory_${memory.date || 'download'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

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
                            <Plus style={{ marginRight: '0.5rem' }} /> Add Photo or Video
                        </button>
                    )}

                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ position: 'relative', border: '2px dashed rgba(255,255,255,0.3)', borderRadius: '12px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                                    <input type="file" accept="image/*,video/*" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                                    {newMemory.image ? (
                                        newMemory.file?.type.startsWith('video') ? (
                                            <video src={newMemory.image} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <img src={newMemory.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        )
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                                <ImageIcon size={32} />
                                                <Video size={32} />
                                            </div>
                                            <p>Click to upload photo or video</p>
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
                                    <button onClick={() => setIsAdding(false)} className="btn-secondary" disabled={uploading}>Cancel</button>
                                    <button onClick={saveMemory} className="btn-primary" disabled={uploading}>
                                        {uploading ? <Loader className="animate-spin" size={18} /> : 'Save Memory'}
                                    </button>
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
                                onClick={() => setSelectedMemory(memory)}
                                style={{ cursor: 'pointer' }}
                            >
                                {isVideo(memory.image) ? (
                                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                        <video
                                            src={memory.image}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            muted
                                            preload="metadata"
                                        />
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                            <Play size={48} fill="rgba(255,255,255,0.8)" color="transparent" />
                                        </div>
                                    </div>
                                ) : (
                                    <img src={memory.image} alt={memory.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}

                                <div style={{ padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', position: 'absolute', bottom: 0, left: 0, width: '100%', boxSizing: 'border-box', pointerEvents: 'none' }}>
                                    <p style={{ color: 'white', fontWeight: 'bold', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{memory.caption}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center' }}>
                                        <Calendar size={12} style={{ marginRight: '0.25rem' }} /> {memory.date}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteMemory(memory.id, memory.image); }}
                                    className="close-btn"
                                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', zIndex: 10 }}
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedMemory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 2000,
                            background: 'rgba(0,0,0,0.95)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '2rem'
                        }}
                        onClick={() => setSelectedMemory(null)}
                    >
                        <button
                            onClick={() => setSelectedMemory(null)}
                            style={{
                                position: 'absolute', top: '2rem', right: '2rem',
                                background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'
                            }}
                        >
                            <X size={32} />
                        </button>

                        <div
                            style={{ maxWidth: '90%', maxHeight: '90%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {isVideo(selectedMemory.image) ? (
                                <video
                                    src={selectedMemory.image}
                                    controls
                                    autoPlay
                                    style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                                />
                            ) : (
                                <img
                                    src={selectedMemory.image}
                                    alt={selectedMemory.caption}
                                    style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                                />
                            )}

                            <div style={{ marginTop: '1rem', textAlign: 'center', color: 'white' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{selectedMemory.caption}</h3>
                                <p style={{ opacity: 0.7, margin: 0, fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {selectedMemory.date && new Date(selectedMemory.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </p>
                                <button
                                    onClick={(e) => downloadMemory(e, selectedMemory)}
                                    className="btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem' }}
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
