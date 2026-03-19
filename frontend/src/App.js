import React, { useState, useEffect } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Menu, X, Trophy, User, Home as HomeIcon, Mail, LogOut, Shield } from 'lucide-react';
import './App.css';
import Home from './pages/Home';
import Leaderboards from './pages/Leaderboards';
import StatsPage from './pages/StatsPage';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import { Toaster, toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mca-arjun-gaming.onrender.com";
const API = `${BACKEND_URL}/api`;

function Navbar({ user, setUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';
      const response = await axios.post(`${API}${endpoint}`, { uid, password });
      const { token, uid: userUid, is_admin } = response.data;
      
      localStorage.setItem('token', token);
      setUser({ uid: userUid, isAdmin: is_admin });
      setShowAuthModal(false);
      setUid('');
      setPassword('');
      toast.success(authMode === 'login' ? 'Logged in successfully!' : 'Account created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <>
      <nav className="navbar" data-testid="main-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-xl">
                MCA
              </div>
              <span className="text-xl font-bold tracking-wider text-neon-orange hidden sm:block">
                ARJUN GAMING
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-300 hover:text-neon-orange transition-colors" data-testid="nav-home">
                <HomeIcon size={20} className="inline mr-1" /> Home
              </Link>
              <Link to="/leaderboards" className="text-gray-300 hover:text-neon-orange transition-colors" data-testid="nav-leaderboards">
                <Trophy size={20} className="inline mr-1" /> Leaderboards
              </Link>
              <Link to="/stats" className="text-gray-300 hover:text-neon-orange transition-colors" data-testid="nav-stats">
                <User size={20} className="inline mr-1" /> Stats
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-neon-orange transition-colors" data-testid="nav-contact">
                <Mail size={20} className="inline mr-1" /> Contact
              </Link>
              {user?.isAdmin && (
                <Link to="/admin" className="text-yellow-500 hover:text-yellow-400 transition-colors" data-testid="nav-admin">
                  <Shield size={20} className="inline mr-1" /> Admin
                </Link>
              )}
            </div>

            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-neon-orange font-mono" data-testid="user-uid">{user.uid}</span>
                  <button
                    onClick={handleLogout}
                    className="primary-btn skew-button"
                    data-testid="logout-button"
                  >
                    <span className="skew-button-text">
                      <LogOut size={16} className="inline mr-1" /> Logout
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="primary-btn skew-button"
                  data-testid="login-button"
                >
                  <span className="skew-button-text">Login / Signup</span>
                </button>
              )}
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass-effect border-t border-white/10" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block text-gray-300 hover:text-neon-orange" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/leaderboards" className="block text-gray-300 hover:text-neon-orange" onClick={() => setMobileMenuOpen(false)}>
                Leaderboards
              </Link>
              <Link to="/stats" className="block text-gray-300 hover:text-neon-orange" onClick={() => setMobileMenuOpen(false)}>
                Stats
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-neon-orange" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
              {user?.isAdmin && (
                <Link to="/admin" className="block text-yellow-500" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>
              )}
              {user ? (
                <button onClick={handleLogout} className="w-full text-left text-red-500">
                  Logout ({user.uid})
                </button>
              ) : (
                <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="w-full text-left text-neon-orange">
                  Login / Signup
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)} data-testid="auth-modal">
          <div className="modal-content tech-corner" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-neon-orange mb-6 text-center" data-testid="auth-modal-title">
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">UID</label>
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter your UID"
                  required
                  data-testid="auth-uid-input"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter password"
                  required
                  data-testid="auth-password-input"
                />
              </div>
              <button type="submit" className="primary-btn w-full" data-testid="auth-submit-button">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm text-gray-400 hover:text-neon-orange transition-colors"
                data-testid="auth-toggle-button"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="footer py-8" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-neon-orange mb-3">MCA ARJUN GAMING</h3>
            <p className="text-gray-400 text-sm">Elite Free Fire gaming community. Join us to showcase your skills!</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-neon-yellow">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-neon-orange transition-colors text-sm">Home</Link>
              <Link to="/leaderboards" className="block text-gray-400 hover:text-neon-orange transition-colors text-sm">Leaderboards</Link>
              <Link to="/stats" className="block text-gray-400 hover:text-neon-orange transition-colors text-sm">Stats</Link>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-neon-yellow">Join Our Community</h4>
            <div className="space-y-3">
              <a
                href="https://whatsapp.com/channel/0029VajJpHH7tkjICaohNy3E"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-green-500 transition-colors text-sm"
                data-testid="whatsapp-link"
              >
                📱 WhatsApp Community
              </a>
              <a
                href="https://discord.gg/EP6sHqb6Ny"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-blue-500 transition-colors text-sm"
                data-testid="discord-link"
              >
                💬 Discord Server
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>&copy; 2026 MCA Arjun Gaming. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API}/stats`)
        .then(() => {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ uid: payload.uid, isAdmin: payload.uid === 'Gopichand' });
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [user]);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/stats" element={<StatsPage user={user} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminPanel user={user} />} />
        </Routes>
        <Footer />
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}

export default App;