import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import GameOver from './GameOver';
import useIsGameOver from '../../utils/hooks/useIsGameOver';

// Mock the hooks
jest.mock('../../utils/hooks/useIsGameOver');
jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
}));

describe('GameOver Component', () => {
    beforeEach(() => {
        localStorage.setItem('storedId', 'my-id');
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should show "YOU WIN" when local state says winner is the user', () => {
        useIsGameOver.mockReturnValue(() => ({ answer: true, winner: 'user' }));

        render(<GameOver />);

        expect(screen.getByText(/YOU WIN/i)).toBeInTheDocument();
    });

    it('should override local state with remoteGameOver if user is the loser', () => {
        // Local state doesn't think game is over yet
        useIsGameOver.mockReturnValue(() => ({ answer: false, winner: null }));

        // Remote signal says 'opponent' won
        render(<GameOver remoteGameOver="opponent-id" />);

        expect(screen.getByText(/YOU LOST/i)).toBeInTheDocument();
        expect(screen.queryByText(/YOU WIN/i)).not.toBeInTheDocument();
    });

    it('should override local state with remoteGameOver if user is the winner', () => {
        // Local state doesn't think game is over yet
        useIsGameOver.mockReturnValue(() => ({ answer: false, winner: null }));

        // Remote signal says I won
        render(<GameOver remoteGameOver="my-id" />);

        expect(screen.getByText(/YOU WIN/i)).toBeInTheDocument();
    });

    it('should show tournament champion text if user wins the final match', () => {
        useIsGameOver.mockReturnValue(() => ({ answer: true, winner: 'user' }));

        const tournamentData = {
            size: 2,
            currentRound: 1,
            name: "Test Tourney",
            matches: [{ id: 'match1', round: 1 }]
        };

        render(
            <GameOver
                isTournament={true}
                tournamentData={tournamentData}
                currentMatchId="match1"
            />
        );

        expect(screen.getByText(/TOURNAMENT CHAMPION/i)).toBeInTheDocument();
    });
});
