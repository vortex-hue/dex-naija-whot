import React from 'react';
import { TournamentSystem, Footer } from '../../components';

import './Tournament.css';

const Tournament = () => {
    return (
        <div className="tournament-page">
            <div className="tournament-nav">
                <div className="nav-content">
                    <h1>🎮 Naija Whot Tournaments</h1>

                </div>
            </div>

            <div className="tournament-main">
                <TournamentSystem />
            </div>

            <Footer />
        </div>
    );
};

export default Tournament;