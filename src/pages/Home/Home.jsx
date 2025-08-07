import React from "react";
import "../../styles/home.css";
import { Link } from "react-router-dom";
import mockup from "./assets/mockup.png";
import { Footer } from "../../components";

function Home() {
  return (
    <section className="home">
      {/* Modern gradient background */}
      <div className="hero-background">
        <div className="gradient-overlay"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="container">
        {/* Header with blockchain branding */}
        <header className="hero-header">
          <div className="blockchain-badges">
            <div className="badge honeycomb-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF6B35"/>
                <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="#FF6B35"/>
                <path d="M2 12L12 17L22 12L12 7L2 12Z" fill="#FF6B35"/>
              </svg>
              <span>Honeycomb Protocol</span>
            </div>
            <div className="badge solana-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4.5 16.5L19.5 3.5H7.5L4.5 6.5V16.5Z" fill="#9945FF"/>
                <path d="M19.5 3.5L4.5 16.5H16.5L19.5 13.5V3.5Z" fill="#14F195"/>
              </svg>
              <span>Solana</span>
            </div>
          </div>
        </header>

        {/* Main hero section */}
        <div className="hero-content">
          <div className="hero-text">
        <h1 className="title">
              <span className="title-main">NAIJA</span>
              <span className="title-accent">WHOT</span>
              <span className="title-subtitle">On-Chain Edition</span>
        </h1>
            
        <p className="subtitle">
              Experience the classic Nigerian card game reimagined with blockchain technology. 
              Earn XP, complete missions, and build your on-chain reputation through Honeycomb Protocol.
            </p>

            {/* Feature highlights */}
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Mission System</h3>
                <p>Complete quests and earn on-chain rewards</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <h3>Player Traits</h3>
                <p>Build your reputation and unlock special abilities</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>Progression</h3>
                <p>Track your growth with permanent on-chain stats</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Leaderboards</h3>
                <p>Compete with players worldwide</p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="game-preview">
              <img src={mockup} alt="Whot Game Preview" />
              <div className="preview-overlay">
                <div className="stats-panel">
                  <div className="stat">
                    <span className="stat-label">XP</span>
                    <span className="stat-value">1,250</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Level</span>
                    <span className="stat-value">8</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Missions</span>
                    <span className="stat-value">12/20</span>
                  </div>
                </div>
              </div>
            </div>
      </div>
        </div>

        {/* Call to action */}
        <div className="cta-section">
        <div className="btn-group">
            <Link to="/play-computer" className="cta-btn primary">
              <span className="btn-icon">🎮</span>
              <span>PLAY COMPUTER</span>
              <span className="btn-subtitle">Practice Mode</span>
            </Link>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <Link to="/copylink" className="cta-btn secondary">
              <span className="btn-icon">👥</span>
              <span>PLAY FRIEND</span>
              <span className="btn-subtitle">Multiplayer Mode</span>
            </Link>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <Link to="/tournaments" className="cta-btn tournament">
              <span className="btn-icon">🏆</span>
              <span>TOURNAMENTS</span>
              <span className="btn-subtitle">Win SOL Prizes</span>
            </Link>
          </div>

          {/* Blockchain features preview */}
          <div className="blockchain-preview">
            <h3>Powered by Blockchain</h3>
            <div className="tech-stack">
              <div className="tech-item">
                <div className="tech-icon honeycomb">🐝</div>
                <span>Honeycomb Protocol</span>
              </div>
              <div className="tech-item">
                <div className="tech-icon solana">⚡</div>
                <span>Solana</span>
              </div>
              <div className="tech-item">
                <div className="tech-icon verxio">📊</div>
                <span>Verxio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}

export default Home;
