import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Camera, List, Moon, MessageCircle, Music, MapPin, Clock, Mail, LogOut, Gift, Bell, BellRing } from 'lucide-react';
import MemoriesGallery from './components/MemoriesGallery';
import BucketList from './components/BucketList';

import Login from './components/Login';
import Chat from './components/Chat';
import Places from './components/Places';
import OpenWhen from './components/OpenWhen';
import Wishlist from './components/Wishlist';
import AppLock from './components/AppLock';
import { supabase } from './supabase';
import './App.css';

// REPLACE THIS URL WITH YOUR FIXED BACKGROUND IMAGE
const BACKGROUND_IMAGE_URL = '/bg.jpg';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [isLocked, setIsLocked] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');
  const activeModalRef = useRef(activeModal);

  useEffect(() => {
    activeModalRef.current = activeModal;
  }, [activeModal]);

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

  useEffect(() => {
    if (!session) return;
    const userEmail = session.user?.email;

    const channel = supabase
        .channel('global_chat_notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat' }, (payload) => {
            if (payload.new.sender !== userEmail && activeModalRef.current !== 'chat' && Notification.permission === 'granted') {
                new Notification('New Love Note 💌', {
                    body: payload.new.text,
                });
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [session]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
    }
  };

  if (!session) return <Login />;
  if (isLocked) return <AppLock onUnlock={() => setIsLocked(false)} />;

  const menuItems = [
    { id: 'memories', label: 'Memories', icon: <Camera />, gradient: 'linear-gradient(to bottom right, #ec4899, #f43f5e)', component: <MemoriesGallery onClose={() => setActiveModal(null)} /> },
    { id: 'bucketlist', label: 'Bucket List', icon: <List />, gradient: 'linear-gradient(to bottom right, #a855f7, #6366f1)', component: <BucketList onClose={() => setActiveModal(null)} /> },

    { id: 'chat', label: 'Love Notes', icon: <MessageCircle />, gradient: 'linear-gradient(to bottom right, #f87171, #db2777)', component: <Chat onClose={() => setActiveModal(null)} session={session} /> },
    { id: 'places', label: 'Places', icon: <MapPin />, gradient: 'linear-gradient(to bottom right, #fb923c, #f59e0b)', component: <Places onClose={() => setActiveModal(null)} /> },
    { id: 'openwhen', label: 'Open When', icon: <Mail />, gradient: 'linear-gradient(to bottom right, #fb7185, #ef4444)', component: <OpenWhen onClose={() => setActiveModal(null)} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Gift />, gradient: 'linear-gradient(to bottom right, #f472b6, #db2777)', component: <Wishlist onClose={() => setActiveModal(null)} /> },
  ];

  return (
    <div className="app-container">
      <div className="fixed-background">
        <div className="overlay"></div>
        <img src={BACKGROUND_IMAGE_URL} alt="Background" />
      </div>

      <div className="content-container">
        <header className="app-header">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%' }}
          >
            <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                    Notification.requestPermission().then(permission => {
                        setNotificationsEnabled(permission === 'granted');
                        if (permission === 'granted') {
                            alert('Notifications enabled! You will now receive alerts when you get a new Love Note.');
                        } else {
                            alert('Notifications permission was denied. You may need to enable it in your browser settings.');
                        }
                    });
                }}
                style={{ background: 'transparent', border: 'none', color: notificationsEnabled ? '#f472b6' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                title={notificationsEnabled ? "Notifications Enabled" : "Enable Notifications"}
              >
                {notificationsEnabled ? <BellRing size={16} /> : <Bell size={16} />}
              </button>
              <button
                onClick={handleLogout}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
            <div className="logo-container">
              <Heart fill="black" size={24} color="black" />
            </div>
            <h1 className="app-title">US TWO</h1>
            <p className="app-subtitle">OUR DIGITAL HOME</p>
          </motion.div>
        </header>

        <main className="bento-grid">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModal(item.id)}
              className={`bento-card`}
            >
              <div className="card-icon-bg">
                {item.icon}
              </div>
              <h3 className="card-title">{item.label}</h3>
            </motion.div>
          ))}
        </main>

        <footer className="app-footer">
          <p>© 2025</p>
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
