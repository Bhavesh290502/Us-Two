import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, X, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../supabase';

export default function Settings({ onClose }) {
    const [backgrounds, setBackgrounds] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchBackgrounds();
    }, []);

    const fetchBackgrounds = async () => {
        const { data } = await supabase.from('backgrounds').select('*').order('created_at', { ascending: false });
        if (data) setBackgrounds(data);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `bg_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'memories' bucket (reusing it since it's public)
            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('memories')
                .getPublicUrl(filePath);

            const { data, error: dbError } = await supabase
                .from('backgrounds')
                .insert([{ url: publicUrl }])
                .select();

            if (dbError) throw dbError;

            if (data) setBackgrounds([data[0], ...backgrounds]);

        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error uploading background. Make sure you set up the Storage bucket!');
        } finally {
            setUploading(false);
        }
    };

    const deleteBackground = async (id, url) => {
        if (!window.confirm('Are you sure you want to delete this background?')) return;
        setBackgrounds(backgrounds.filter(bg => bg.id !== id));
        await supabase.from('backgrounds').delete().eq('id', id);

        // Optional: Delete from storage
        if (url.includes('supabase')) {
            const path = url.split('/').pop();
            await supabase.storage.from('memories').remove([path]);
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
                    <h2 style={{ color: 'white' }}>App Settings</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <h3 style={{ color: 'white', marginTop: 0 }}>Customize Backgrounds</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        Upload photos to cycle through on the home screen.
                    </p>

                    <div style={{ marginBottom: '2rem' }}>
                        <label
                            className="btn-secondary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                border: '2px dashed rgba(255,255,255,0.3)',
                                cursor: uploading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {uploading ? <Loader className="animate-spin" /> : <Upload style={{ marginRight: '0.5rem' }} />}
                            {uploading ? 'Uploading...' : 'Upload New Background'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    <div className="memory-grid">
                        {backgrounds.map((bg) => (
                            <div key={bg.id} className="memory-card" style={{ aspectRatio: '16/9' }}>
                                <img src={bg.url} alt="Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    onClick={() => deleteBackground(bg.id, bg.url)}
                                    className="close-btn"
                                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {backgrounds.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                            No custom backgrounds yet. Using default images.
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
