import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Youtube, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mca-arjun-gaming.onrender.com";
const API = `${BACKEND_URL}/api`;

function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API}/youtube/videos`);
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      <section className="hero-section" data-testid="hero-section">
        <img
          src="https://images.unsplash.com/photo-1741722604322-f0d0d8223418?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHw0fHxmdXR1cmlzdGljJTIwYmF0dGxlZmllbGQlMjBnYW1pbmclMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3MzE1NjAxOHww&ixlib=rb-4.1.0&q=85"
          alt="Hero Background"
          className="hero-bg"
        />
        <div className="hero-overlay" />
        <div className="hero-content max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase text-white mb-4" data-testid="hero-title">
            MCA ARJUN
            <span className="text-neon-orange block">GAMING</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8" data-testid="hero-subtitle">
            Elite Free Fire Community | Compete, Dominate, Conquer
          </p>
          <a
            href="https://www.youtube.com/@mcaarjungaming"
            target="_blank"
            rel="noopener noreferrer"
            className="primary-btn skew-button inline-flex items-center gap-3 text-lg"
            data-testid="subscribe-button"
          >
            <span className="skew-button-text flex items-center gap-2">
              <Youtube size={24} /> Subscribe Now <ExternalLink size={20} />
            </span>
          </a>
        </div>
      </section>

      <section className="py-24 px-4" data-testid="about-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card tech-corner" data-testid="stat-card-players">
              <div className="text-5xl font-bold text-neon-orange mb-2">1000+</div>
              <div className="text-gray-400 uppercase tracking-widest text-sm">Active Players</div>
            </div>
            <div className="stat-card tech-corner" data-testid="stat-card-tournaments">
              <div className="text-5xl font-bold text-neon-yellow mb-2">50+</div>
              <div className="text-gray-400 uppercase tracking-widest text-sm">Tournaments</div>
            </div>
            <div className="stat-card tech-corner" data-testid="stat-card-winners">
              <div className="text-5xl font-bold text-neon-red mb-2">100+</div>
              <div className="text-gray-400 uppercase tracking-widest text-sm">Winners</div>
            </div>
          </div>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="py-24 px-4 bg-card" data-testid="videos-section">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase text-neon-orange mb-12 text-center" data-testid="videos-title">
              Latest Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-card tech-corner"
                  data-testid={`video-card-${video.id}`}
                >
                  <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-2" data-testid={`video-title-${video.id}`}>
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      {new Date(video.published_at).toLocaleDateString()}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 px-4" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold uppercase mb-6 text-white" data-testid="cta-title">
            Ready to <span className="text-neon-orange">Dominate?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8" data-testid="cta-description">
            Join our elite community of Free Fire warriors. Create your stats profile and compete for the top spot!
          </p>
          <a href="/stats" className="primary-btn skew-button inline-block text-lg" data-testid="cta-button">
            <span className="skew-button-text">Create Your Profile</span>
          </a>
        </div>
      </section>
    </div>
  );
}

export default Home;