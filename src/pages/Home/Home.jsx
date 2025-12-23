import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../../styles/home.css";
import mockup from "./assets/mockup.png";
import { Footer } from "../../components";

import { useAccount, useConnect } from "wagmi";
import { minipay } from "minipay-wagmi-connector";
import { useMiniPay } from "../../context/MiniPayContext";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function Home() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const { isMiniPayUser } = useMiniPay();

  return (
    <motion.section
      className="home naija-theme"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Dynamic Background Pattern */}
      <div className="naija-pattern-bg"></div>

      <div className="container">

        {/* Hero Section */}
        <div className="hero-content">
          <motion.div className="hero-text" variants={itemVariants}>
            <motion.div
              className="badge-container"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <span className="naija-badge">🇳🇬 The No.1 Card Game</span>
            </motion.div>

            <h1 className="title">
              <span className="title-main">NAIJA</span>
              <span className="title-accent">WHOT</span>
            </h1>

            <p className="subtitle">
              Oya! Challenge your friends, enter tournaments, and become the champion.
              No wallet needed, just pure vibes and strategy.
            </p>

            {/* Feature Grid */}
            <div className="features-grid">
              <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
                <div className="feature-icon">⚡</div>
                <h3>E Dey Rush</h3>
                <p>Fast-paced action</p>
              </motion.div>
              <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
                <div className="feature-icon">👥</div>
                <h3>Multiplayer</h3>
                <p>Play with guys</p>
              </motion.div>
              <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
                <div className="feature-icon">🏆</div>
                <h3>Tournaments</h3>
                <p>Win bragging rights</p>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <div className="cta-group">
              <Link to="/play-computer">
                <motion.button
                  className="cta-btn primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎮 Play Computer
                </motion.button>
              </Link>

              <Link to="/copylink">
                <motion.button
                  className="cta-btn secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  👥 Play Friend
                </motion.button>
              </Link>

              <Link to="/tournaments">
                <motion.button
                  className="cta-btn tournament"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: ["0 0 0px #FFD700", "0 0 20px #FFD700", "0 0 0px #FFD700"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆 Join Tournament
                </motion.button>
              </Link>
            </div>

            {/* MiniPay & Leaderboard Section */}
            <div className="cta-group" style={{ marginTop: '15px' }}>
              {(isConnected || isMiniPayUser) ? (
                <Link to="/leaderboard">
                  <motion.button
                    className="cta-btn secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ border: '1px solid #4CAF50', color: '#4CAF50' }}
                  >
                    📊 Leaderboard
                  </motion.button>
                </Link>
              ) : (
                <motion.button
                  className="cta-btn primary"
                  onClick={() => connect({ connector: minipay() })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: '#329622' }} // Celo/MiniPay Green
                >
                  ⚡ Connect MiniPay
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div className="hero-visual" variants={floatVariants} animate="animate">
            <div className="game-preview-container">
              <img src={mockup} alt="Whot Game" className="mockup-img" />
              <motion.div
                className="floating-card c1"
                animate={{ y: [-15, 15], rotate: [5, -5] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
              >
                🟪
              </motion.div>
              <motion.div
                className="floating-card c2"
                animate={{ y: [10, -10], rotate: [-5, 5] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
              >
                ⭐
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </motion.section>
  );
}

export default Home;
