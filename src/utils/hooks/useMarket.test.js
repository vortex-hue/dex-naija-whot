import { renderHook } from '@testing-library/react';
import useMarket from './useMarket';
import { useSelector, useDispatch } from 'react-redux';
import { refreshUsedCards } from '../../redux/actions';

// Mock react-redux
jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
}));

describe('useMarket Hook', () => {
    let mockDispatch;

    beforeEach(() => {
        mockDispatch = jest.fn();
        useDispatch.mockReturnValue(mockDispatch);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should refresh the market when market size is 10 or less', () => {
        // Mock state where market will be small
        // market = deck - usedCards
        useSelector.mockImplementation(selector => {
            const state = {
                deck: Array.from({ length: 15 }, (_, i) => ({ shape: 'circle', number: i })),
                usedCards: Array.from({ length: 10 }, (_, i) => ({ shape: 'circle', number: i })),
                userCards: [],
                opponentCards: [],
                activeCard: { shape: 'triangle', number: 1 },
            };
            return selector(state);
        });

        renderHook(() => useMarket());

        // Should call dispatch because market.length (5) <= 10
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'REFRESH_USED_CARDS' }));
    });

    it('should NOT refresh the market when market size is greater than 10', () => {
        useSelector.mockImplementation(selector => {
            const state = {
                deck: Array.from({ length: 30 }, (_, i) => ({ shape: 'circle', number: i })),
                usedCards: Array.from({ length: 5 }, (_, i) => ({ shape: 'circle', number: i })),
                userCards: [],
                opponentCards: [],
                activeCard: { shape: 'triangle', number: 1 },
            };
            return selector(state);
        });

        renderHook(() => useMarket());

        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should NOT trigger a loop when unrelated state changes (Renderer Stability)', () => {
        let state = {
            deck: Array.from({ length: 30 }, (_, i) => ({ shape: 'circle', number: i })),
            usedCards: Array.from({ length: 5 }, (_, i) => ({ shape: 'circle', number: i })),
            userCards: [],
            opponentCards: [],
            activeCard: { shape: 'triangle', number: 1 },
        };

        useSelector.mockImplementation(selector => selector(state));

        const { rerender } = renderHook(() => useMarket());

        // Change something unrelated (e.g., userCards content but not length)
        state = { ...state, userCards: [{ shape: 'star', number: 1 }] };
        rerender();

        expect(mockDispatch).not.toHaveBeenCalled();
    });
});
