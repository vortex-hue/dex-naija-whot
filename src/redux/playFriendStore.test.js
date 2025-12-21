import { sanitizeState } from './playFriendStore';

describe('Redux State Sanitization', () => {
    it('should remove null cards from card arrays', () => {
        const corruptedState = {
            userCards: [{ shape: 'star', number: 1 }, null, { shape: 'triangle', number: 2 }],
            opponentCards: [undefined, { shape: 'circle', number: 5 }],
            deck: [null, undefined],
            activeCard: null
        };

        const cleanState = sanitizeState(corruptedState);

        expect(cleanState.userCards).toHaveLength(2);
        expect(cleanState.userCards[0]).toEqual({ shape: 'star', number: 1 });
        expect(cleanState.userCards[1]).toEqual({ shape: 'triangle', number: 2 });

        expect(cleanState.opponentCards).toHaveLength(1);
        expect(cleanState.opponentCards[0]).toEqual({ shape: 'circle', number: 5 });

        expect(cleanState.deck).toHaveLength(0);
        expect(cleanState.activeCard).toEqual({});
    });

    it('should remove cards missing shape or number', () => {
        const corruptedState = {
            usedCards: [
                { shape: 'star', number: 1 },
                { shape: 'star' }, // missing number
                { number: 5 }, // missing shape
                {}
            ]
        };

        const cleanState = sanitizeState(corruptedState);
        expect(cleanState.usedCards).toHaveLength(1);
        expect(cleanState.usedCards[0]).toEqual({ shape: 'star', number: 1 });
    });

    it('should handle missing arrays by defaulting to empty arrays', () => {
        const corruptedState = {
            userCards: null,
            opponentCards: undefined
        };

        const cleanState = sanitizeState(corruptedState);
        expect(Array.isArray(cleanState.userCards)).toBe(true);
        expect(cleanState.userCards).toHaveLength(0);
        expect(Array.isArray(cleanState.opponentCards)).toBe(true);
        expect(cleanState.opponentCards).toHaveLength(0);
    });
});
