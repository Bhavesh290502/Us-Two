import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Play, Pause, SkipForward } from 'lucide-react';
import { supabase } from '../supabase';

export default function MusicPlayer({ onClose }) {
    const [videoId, setVideoId] = useState('');
    const [newVideoId, setNewVideoId] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchSong();
    }, []);

    const fetchSong = async () => {
        const { data, error } = await supabase
            .from('song')
            .select('*')
            .limit(1);

        if (data && data.length > 0) {
            setVideoId(data[0].video_id);
        } else {
            // Default song if none exists
            setVideoId('jfKfPfyJRdk');
        }
    };

    const saveSong = async () => {
        if (!newVideoId) return;

        // Extract ID if full URL is pasted
        let id = newVideoId;
        if (newVideoId.includes('v=')) {
            id = newVideoId.split('v=')[1].split('&')[0];
        } else if (newVideoId.includes('youtu.be/')) {
            id = newVideoId.split('youtu.be/')[1];
        }

        // Check if song exists to update or insert
        const { data: existing } = await supabase.from('song').select('id').limit(1);

        if (existing && existing.length > 0) {
            await supabase.from('song').update({ video_id: id }).eq('id', existing[0].id);
        } else {
            await supabase.from('song').insert([{ video_id: id }]);
        }

        setVideoId(id);
        setNewVideoId('');
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-overlay"
        >
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 style={{ color: 'white' }}>Our Song</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body" style={{ textAlign: 'center' }}>
                    <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: '2rem' }}>
                        <iframe
                            width="100%"
                            height="300"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-secondary"
                            style={{ fontSize: '0.9rem', opacity: 0.7 }}
                        >
                            Change Song
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Paste YouTube Link or ID"
                                value={newVideoId}
                                onChange={e => setNewVideoId(e.target.value)}
                                className="input-field"
                            />
                            <button onClick={saveSong} className="btn-primary">Save</button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
