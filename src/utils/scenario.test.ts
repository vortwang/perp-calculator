
import { describe, test, expect } from 'vitest';
import { calculateLiquidationPrice } from './calculator';

describe('Simplified Isolated Formula Verification', () => {
    test('User Example - Long', () => {
        // Scene:
        // Entry: 61000
        // Qty: 2
        // Leverage: 10
        // MMR: 0.005

        // IM = (2 * 61000) / 10 = 12200
        // MM = 2 * 61000 * 0.005 = 610
        // LP = 61000 - (12200 - 610) / 2 = 61000 - 5795 = 55205

        // Note: We don't pass walletBalance here, forcing it to calculate IM from leverage
        const lp = calculateLiquidationPrice(61000, 2, 10, 0.005, 'long');
        expect(lp).toBeCloseTo(55205, 1);
    });
});
