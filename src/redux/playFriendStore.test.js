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

    it('should maintain reference stability if state is already clean', () => {
        const cleanState = {
            userCards: [{ shape: 'star', number: 1 }],
            opponentCards: [],
            usedCards: [],
            deck: [{ shape: 'circle', number: 2 }],
            activeCard: { shape: 'triangle', number: 5 }
        };

        const result = sanitizeState(cleanState);
        expect(result).toBe(cleanState); // Same reference
    });

    it('should detect and fix invalid activeCard objects', () => {
        const invalidStates = [
            { activeCard: null },
            { activeCard: [] },
            { activeCard: 'not an object' },
            { activeCard: { shape: 'broken' } } // missing number
        ];

        invalidStates.forEach(s => {
            const sanitized = sanitizeState(s);
            expect(sanitized.activeCard).toEqual({});
        });
    });

    it('should ignore non-card-array properties', () => {
        const stateWithExtra = {
            userCards: [],
            score: 100,
            config: { x: 1 }
        };
        const sanitized = sanitizeState(stateWithExtra);
        expect(sanitized.score).toBe(100);
        expect(sanitized.config).toEqual({ x: 1 });
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
