import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Award, Target } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Leaderboards() {
  const [activeTab, setActiveTab] = useState('br');
  const [brLeaderboard, setBrLeaderboard] = useState([]);
  const [csLeaderboard, setCsLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const [brResponse, csResponse] = await Promise.all([
        axios.get(`${API}/leaderboard/br`),
        axios.get(`${API}/leaderboard/cs`)
      ]);
      setBrLeaderboard(brResponse.data);
      setCsLeaderboard(csResponse.data);
    } catch (error) {
      console.error('Failed to fetch leaderboards:', error);
    }
    setLoading(false);
  };

  const currentLeaderboard = activeTab === 'br' ? brLeaderboard : csLeaderboard;

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="text-yellow-500" size={24} />;
    if (index === 1) return <Award className="text-gray-400" size={24} />;
    if (index === 2) return <Award className="text-orange-600" size={24} />;
    return <Target className="text-gray-600" size={20} />;
  };

  return (
    <div className="min-h-screen py-24 px-4" data-testid="leaderboards-page">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold uppercase text-center mb-4" data-testid="leaderboards-title">
          <span className="text-neon-orange">Leaderboards</span>
        </h1>
        <p className="text-center text-gray-400 mb-12 text-lg" data-testid="leaderboards-subtitle">
          Top players ranked by total wins
        </p>

        <div className="flex justify-center gap-4 mb-12" data-testid="leaderboard-tabs">
          <button
            onClick={() => setActiveTab('br')}
            className={`tab-button ${activeTab === 'br' ? 'active' : ''}`}
            data-testid="tab-br"
          >
            Battle Royale
          </button>
          <button
            onClick={() => setActiveTab('cs')}
            className={`tab-button ${activeTab === 'cs' ? 'active' : ''}`}
            data-testid="tab-cs"
          >
            Clash Squad
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400" data-testid="loading-indicator">Loading...</div>
        ) : currentLeaderboard.length === 0 ? (
          <div className="text-center text-gray-500" data-testid="no-data-message">
            No players found. Be the first to create your stats!
          </div>
        ) : (
          <div className="space-y-2" data-testid="leaderboard-list">
            {currentLeaderboard.map((player, index) => {
              const wins = activeTab === 'br' ? player.br_wins : player.cs_wins;
              const kda = activeTab === 'br' ? player.br_kda : player.cs_kda;
              const rank = activeTab === 'br' ? player.br_rank : player.cs_rank;
              const highestKills = activeTab === 'br' ? player.br_highest_kills : player.cs_highest_kills;

              return (
                <div key={player.uid} className="leaderboard-row" data-testid={`leaderboard-row-${index}`}>
                  <div className="flex items-center gap-4 w-12" data-testid={`rank-icon-${index}`}>
                    {getRankIcon(index)}
                  </div>
                  <div className="w-16 text-2xl font-bold font-mono text-gray-500" data-testid={`rank-number-${index}`}>
                    #{index + 1}
                  </div>
                  {player.profile_picture && (
                    <img
                      src={player.profile_picture}
                      alt={player.name}
                      className="profile-avatar"
                      data-testid={`player-avatar-${index}`}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-xl text-white" data-testid={`player-name-${index}`}>{player.name}</div>
                    <div className="text-sm text-gray-500 font-mono" data-testid={`player-uid-${index}`}>UID: {player.uid}</div>
                  </div>
                  <div className="hidden md:block">
                    <span className="rank-badge" data-testid={`player-rank-${index}`}>{rank}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neon-orange" data-testid={`player-wins-${index}`}>{wins} Wins</div>
                    <div className="text-sm text-gray-400" data-testid={`player-stats-${index}`}>
                      KDA: {kda} | Best: {highestKills} kills
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboards;