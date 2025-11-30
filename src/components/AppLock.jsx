import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

export default function AppLock({ onUnlock }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const CORRECT_PIN = '1304'; // Default PIN (I Love You)

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === CORRECT_PIN) {
                onUnlock();
            } else {
                setError(true);
                setTimeout(() => {
                    setPin('');
                    setError(false);
                }, 500);
            }
        }
    }, [pin, onUnlock]);

    const handleNumberClick = (num) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 200, background: 'black' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2rem',
                    width: '100%',
                    maxWidth: '300px'
                }}
            >
                <div style={{
                    width: '60px', height: '60px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem'
                }}>
                    {error ? <Lock color="#ef4444" size={24} /> : <Lock color="white" size={24} />}
                </div>

                <h2 style={{ color: 'white', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Enter Passcode</h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{
                            width: '12px', height: '12px',
                            borderRadius: '50%',
                            background: i < pin.length ? 'white' : 'rgba(255,255,255,0.2)',
                            transition: 'background 0.2s'
                        }} />
                    ))}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    width: '100%'
                }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '70px',
                                height: '70px',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {num}
                        </button>
                    ))}
                    <div />
                    <button
                        onClick={() => handleNumberClick(0)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '70px',
                            height: '70px',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            width: '70px',
                            height: '70px',
                            color: 'white',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
