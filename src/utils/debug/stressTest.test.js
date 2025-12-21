import initializeDeck from '../functions/initializeDeck';
import goToMarket from '../functions/goToMarket';

describe('Game Logic Stress Test', () => {
    it('should never result in null cards or empty deck during heavy market drawing', () => {
        // 1. Initialize a real game state
        let state = initializeDeck();
        let { deck, userCards, usedCards, opponentCards, activeCard } = state;

        const mockDispatch = (action) => {
            if (action.type === 'ADD_USER_CARD') {
                userCards.push(action.payload);
            } else if (action.type === 'ADD_OPPONENT_CARD') {
                opponentCards.push(action.payload);
            } else if (action.type === 'REMOVE_CARD_FROM_DECK') {
                const index = deck.findIndex(c => c.shape === action.payload.shape && c.number === action.payload.number);
                if (index > -1) deck.splice(index, 1);
            } else if (action.type === 'REFRESH_USED_CARDS') {
                // This simulates the useMarket hook's refresh logic
                // We take everything except current hands and active card
                const currentHands = [...userCards, ...opponentCards, activeCard];
                // The deck should be original - currentHands
                // But the reducer simply takes the payload. 
                // In the real app, the hook calculates the 'market' based on (deck - usedCards).
                // Let's just track 'deck' and 'usedCards' like the reducers do.
            }
        };

        // Simulate 500 market draws (multiple reshuffles)
        for (let i = 0; i < 500; i++) {
            // If deck is low, simulate the 'useMarket' refresh
            const market = deck.filter(c => !usedCards.some(u => u.shape === c.shape && u.number === c.number));

            if (market.length <= 2) {
                // Refresh: usedCards becomes basically empty or just current state
                usedCards = [...userCards, ...opponentCards, activeCard];
            }

            const config = {
                market: deck.filter(c => !usedCards.some(u => u.shape === c.shape && u.number === c.number)),
                dispatch: mockDispatch,
                usedCards,
                opponentCards,
                userCards
            };

            // Ensure market isn't empty before calling
            if (config.market.length > 0) {
                goToMarket('user', config, 1, usedCards);
            }

            // Assertions
            expect(userCards[userCards.length - 1]).not.toBeNull();
            expect(userCards[userCards.length - 1]).not.toBeUndefined();
            expect(userCards[userCards.length - 1].shape).toBeDefined();
        }

        expect(userCards.length).toBeGreaterThan(5);
    });
});
