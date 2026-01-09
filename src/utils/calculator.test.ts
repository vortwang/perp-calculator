
import { describe, it, expect } from 'vitest';
import {
    calculateInitialMargin,
    calculateOpenFee,
    calculateLiquidationPrice,
    calculateTargetClosePrice,
    calculateAll,
    type CalculationResult
} from './calculator';

describe('Calculator Logic', () => {
    it('should calculate Initial Margin correctly', () => {
        // 1 BTC at 10000 with 10x leverage = 1000 margin
        expect(calculateInitialMargin(1, 10000, 10)).toBe(1000);
    });

    it('should calculate Open Fee correctly (Taker)', () => {
        // 1 BTC at 10000 with 0.05% fee = 5
        expect(calculateOpenFee(1, 10000, 0.0005)).toBe(5);
    });

    it('should calculate Liquidation Price for Long', () => {
        // Long 1 BTC at 10000, 10x Lev.
        // IM = 1000. MMR = 0.5% (0.005).
        // LP = (Entry - IM/Q) / (1 - MMR)
        // LP = (10000 - 1000) / (1 - 0.005) = 9000 / 0.995 = 9045.226
        const lp = calculateLiquidationPrice(10000, 1, 10, 0.005, 'long');
        expect(lp).toBeCloseTo(9045.226, 2);
    });

    it('should calculate Liquidation Price for Short', () => {
        // Short 1 BTC at 10000, 10x Lev.
        // LP = (Entry + IM/Q) / (1 + MMR)
        // LP = (10000 + 1000) / (1 + 0.005) = 11000 / 1.005 = 10945.27
        const lp = calculateLiquidationPrice(10000, 1, 10, 0.005, 'short');
        expect(lp).toBeCloseTo(10945.27, 2);
    });

    it('should calculate Target Close Price correctly', () => {
        // Long 1 BTC at 10000. Target PnL 500.
        // Exit = 10000 + 500/1 = 10500.
        const tpLong = calculateTargetClosePrice(10000, 1, 10, 500, 'pnl', 'long');
        expect(tpLong).toBe(10500);

        // Short 1 BTC at 10000. Target PnL 500.
        // Exit = 10000 - 500/1 = 9500.
        const tpShort = calculateTargetClosePrice(10000, 1, 10, 500, 'pnl', 'short');
        expect(tpShort).toBe(9500);

        // Long 1 BTC at 10000, 10x Lev. IM = 1000. Target ROE 100% (1).
        // Target PnL = 1000 * 1 = 1000.
        // Exit = 10000 + 1000/1 = 11000.
        const tpRoe = calculateTargetClosePrice(10000, 1, 10, 1, 'roe', 'long');
        expect(tpRoe).toBe(11000);
    });

    it('should calculate everything in calculateAll', () => {
        const result: CalculationResult = calculateAll({
            symbol: 'BTCUSDT',
            direction: 'long',
            leverage: 22,
            entryPrice: 77777,
            quantity: 10,
            takerFeeRate: 0.0006, // 0.06%
            maintenanceMarginRate: 0.005
        });

        // IM = (10 * 77777) / 22 = 777770 / 22 = 35353.18
        expect(result.initialMargin).toBeCloseTo(35353.18, 1);

        // Fee = 10 * 77777 * 0.0006 = 466.662
        expect(result.estimatedOpenFee).toBeCloseTo(466.66, 1);

        // Order Cost = IM + Fee = 35353.18 + 466.66 = 35819.84
        expect(result.orderCost).toBeCloseTo(35819.84, 1);

        // Liq Price (Long)
        // IM/Q = 3535.318
        // LP = (77777 - 3535.318) / 0.995 = 74241.68 / 0.995 = 74614.75
        expect(result.liquidationPrice).toBeCloseTo(74614.75, 1);
    });
});
