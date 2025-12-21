const calculateScore = (cards) => cards.reduce((sum, card) => sum + (card.number || 0), 0);

describe('Scoring Logic', () => {
    it('should correctly sum card values', () => {
        const cards = [
            { shape: 'circle', number: 1 },
            { shape: 'triangle', number: 5 },
            { shape: 'cross', number: 14 }
        ];
        expect(calculateScore(cards)).toBe(20);
    });

    it('should handle empty cards', () => {
        expect(calculateScore([])).toBe(0);
    });
});
