import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dices, Sparkles } from 'lucide-react';

const ideas = [
    "Cook a new recipe together",
    "Stargazing picnic",
    "Movie marathon with forts",
    "Board game tournament",
    "Visit a local museum",
    "Sunset walk on the beach",
    "DIY Paint and Sip",
    "Karaoke night at home",
    "Go for a long drive",
    "Bake cookies from scratch"
];

export default function DateNight({ onClose }) {
    const [currentIdea, setCurrentIdea] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const spinWheel = () => {
        setIsSpinning(true);
        let count = 0;
        const interval = setInterval(() => {
            setCurrentIdea(ideas[Math.floor(Math.random() * ideas.length)]);
            count++;
            if (count > 20) {
                clearInterval(interval);
                setIsSpinning(false);
            }
        }, 100);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-overlay"
        >
            <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center' }}>
                <div className="modal-header">
                    <h2 style={{ color: 'white', width: '100%' }}>Date Night Randomizer</h2>
                    <button onClick={onClose} className="close-btn" style={{ position: 'absolute', right: '1.5rem' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>

                    <motion.div
                        animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0, ease: "linear" }}
                        style={{ marginBottom: '2rem' }}
                    >
                        <Dices size={64} color="#ff4d6d" />
                    </motion.div>

                    <AnimatePresence mode='wait'>
                        {currentIdea ? (
                            <motion.div
                                key={currentIdea}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                style={{ marginBottom: '3rem' }}
                            >
                                <h3 style={{ fontSize: '2rem', fontFamily: 'Playfair Display, serif', color: 'white', margin: 0 }}>
                                    {currentIdea}
                                </h3>
                            </motion.div>
                        ) : (
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', marginBottom: '3rem' }}>
                                Ready for an adventure?
                            </p>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={spinWheel}
                        disabled={isSpinning}
                        className="btn-primary"
                        style={{ fontSize: '1.2rem', padding: '1rem 3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Sparkles size={20} /> Spin the Wheel
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
