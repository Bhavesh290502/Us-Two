import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Camera, List, Moon, MessageCircle, Music, MapPin, Clock, Mail, LogOut, Gift } from 'lucide-react';
import BackgroundSlider from './components/BackgroundSlider';
import MemoriesGallery from './components/MemoriesGallery';
import BucketList from './components/BucketList';
import DateNight from './components/DateNight';
import Login from './components/Login';
import Chat from './components/Chat';
import MusicPlayer from './components/MusicPlayer';
import Places from './components/Places';
import Countdown from './components/Countdown';
import OpenWhen from './components/OpenWhen';
import Wishlist from './components/Wishlist';
import AppLock from './components/AppLock';
import { supabase } from './supabase';
import './App.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) return <Login />;
  if (isLocked) return <AppLock onUnlock={() => setIsLocked(false)} />;

  const menuItems = [
    { id: 'memories', label: 'Memories', icon: <Camera />, gradient: 'linear-gradient(to bottom right, #ec4899, #f43f5e)', component: <MemoriesGallery onClose={() => setActiveModal(null)} /> },
    { id: 'bucketlist', label: 'Bucket List', icon: <List />, gradient: 'linear-gradient(to bottom right, #a855f7, #6366f1)', component: <BucketList onClose={() => setActiveModal(null)} /> },
    { id: 'datenight', label: 'Date Night', icon: <Moon />, gradient: 'linear-gradient(to bottom right, #60a5fa, #06b6d4)', component: <DateNight onClose={() => setActiveModal(null)} /> },
    { id: 'chat', label: 'Love Notes', icon: <MessageCircle />, gradient: 'linear-gradient(to bottom right, #f87171, #db2777)', component: <Chat onClose={() => setActiveModal(null)} session={session} /> },
    { id: 'music', label: 'Our Song', icon: <Music />, gradient: 'linear-gradient(to bottom right, #34d399, #0d9488)', component: <MusicPlayer onClose={() => setActiveModal(null)} /> },
    { id: 'places', label: 'Places', icon: <MapPin />, gradient: 'linear-gradient(to bottom right, #fb923c, #f59e0b)', component: <Places onClose={() => setActiveModal(null)} /> },
    { id: 'countdown', label: 'Countdown', icon: <Clock />, gradient: 'linear-gradient(to bottom right, #d946ef, #9333ea)', component: <Countdown onClose={() => setActiveModal(null)} /> },
    { id: 'openwhen', label: 'Open When', icon: <Mail />, gradient: 'linear-gradient(to bottom right, #fb7185, #ef4444)', component: <OpenWhen onClose={() => setActiveModal(null)} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Gift />, gradient: 'linear-gradient(to bottom right, #f472b6, #db2777)', component: <Wishlist onClose={() => setActiveModal(null)} /> },
  ];

  return (
    <div className="app-container">
      <BackgroundSlider />

      <div className="content-container">
        <header className="app-header">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%' }}
          >
            <button
              onClick={handleLogout}
              style={{ position: 'absolute', right: 0, top: 0, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
            <div className="logo-container">
              <Heart fill="white" size={32} color="white" />
            </div>
            <h1 className="app-title">Us Two</h1>
            <p className="app-subtitle">Our little corner of the internet</p>
          </motion.div>
        </header>

        <main className="bento-grid">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, translateY: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModal(item.id)}
              className={`bento-card card-${index}`}
            >
              <div className="card-icon-bg" style={{ background: item.gradient }}>
                {item.icon}
              </div>
              <h3 className="card-title">{item.label}</h3>
            </motion.div>
          ))}
        </main>

        <footer className="app-footer">
          <p>Made with ❤️ for us</p>
        </footer>
      </div>

      <AnimatePresence>
        {activeModal && (
          <div className="modal-wrapper">
            {menuItems.find(item => item.id === activeModal)?.component}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
