import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Lock, Mail, Loader } from 'lucide-react';
import { supabase } from '../supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
            <div className="background-slider">
                <img
                    src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop"
                    alt="Background"
                    style={{ opacity: 0.3, filter: 'blur(4px)' }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="modal-content"
                style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 10, padding: '2.5rem' }}
            >
                <div style={{
                    width: '80px', height: '80px',
                    background: 'linear-gradient(to top right, #ec4899, #e11d48)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.3)'
                }}>
                    <Heart fill="white" size={40} color="white" />
                </div>

                <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>Us Two</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
                    {isSignUp ? "Create your shared space" : "Welcome back, love"}
                </p>

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="input-field"
                            style={{ paddingLeft: '3rem' }}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="input-field"
                            style={{ paddingLeft: '3rem' }}
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary"
                        style={{ background: 'white', color: '#db2777', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </motion.button>
                </form>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: '#f87171', marginTop: '1rem', fontSize: '0.875rem' }}
                    >
                        {error}
                    </motion.p>
                )}

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="btn-secondary"
                    style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}
                >
                    {isSignUp ? "Already have an account? Sign In" : "First time here? Create Account"}
                </button>
            </motion.div>
        </div>
    );
}
