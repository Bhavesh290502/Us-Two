import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

const defaultImages = [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=1974&auto=format&fit=crop"
];

export default function BackgroundSlider() {
    const [index, setIndex] = useState(0);
    const [images, setImages] = useState(defaultImages);

    useEffect(() => {
        const fetchBackgrounds = async () => {
            const { data } = await supabase.from('backgrounds').select('url');
            if (data && data.length > 0) {
                setImages(data.map(bg => bg.url));
            }
        };

        fetchBackgrounds();

        // Subscribe to changes
        const channel = supabase
            .channel('bg_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'backgrounds' }, () => {
                fetchBackgrounds();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images]);

    return (
        <div className="background-slider">
            <div className="overlay" />
            <AnimatePresence mode='wait'>
                <motion.img
                    key={index}
                    src={images[index]}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    alt="Background memory"
                />
            </AnimatePresence>
        </div>
    );
}
