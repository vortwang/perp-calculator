
// Constants
export const DEFAULT_TAKER_FEE_RATE = 0.0005; // 0.05%
export const DEFAULT_MMR = 0.005; // 0.5%

export interface CalculatorState {
    symbol: string;
    direction: 'long' | 'short';
    leverage: number;
    entryPrice: number;
    exitPrice?: number; // For PnL calculation
    quantity: number; // In contracts/units (e.g. BTC amount)
    takerFeeRate: number;
    maintenanceMarginRate: number; // MMR
}

export interface CalculationResult {
    initialMargin: number;
    maintenanceMargin: number;
    orderCost: number;
    estimatedOpenFee: number;
    liquidationPrice: number;
    bankruptcyPrice: number;
    unrealizedPnL: number | null;
    roe: number | null; // Return on Equity
    liqRiskRate: number | null; // Based on current Exit Price as Mark Price
}

/**
 * Calculates the Initial Margin (IM)
 * IM = (Quantity * EntryPrice) / Leverage
 */
export const calculateInitialMargin = (
    quantity: number,
    entryPrice: number,
    leverage: number
): number => {
    if (leverage === 0) return 0;
    return (quantity * entryPrice) / leverage;
};

/**
 * Calculates Estimated Open Fee
 * Fee = Qty * Price * FeeRate
 * (Using EntryPrice as proxy for execution price)
 */
export const calculateOpenFee = (
    quantity: number,
    entryPrice: number,
    feeRate: number
): number => {
    return quantity * entryPrice * feeRate;
};

/**
 * Calculates Order Cost
 * Cost = IM + OpenFee
 */
export const calculateOrderCost = (
    initialMargin: number,
    openFee: number
): number => {
    return initialMargin + openFee;
};

/**
 * Calculates Maintenance Margin (MM)
 * MM = Quantity * MarkPrice * MMR
 * Note: Uses EntryPrice for initial planning, or MarkPrice for live monitoring.
 * In this calculator context (planning), we usually look at Entry state or projected state.
 * However, strictly, MM scales with price. 
 * For Liquidation Price calc, MM is dynamic.
 */
export const calculateMaintenanceMargin = (
    quantity: number,
    price: number,
    mmr: number
): number => {
    return quantity * price * mmr;
};

/**
 * Calculates Liquidation Price (Isolated)
 * 
 * Derivation:
 * Long: LiqPrice = (EntryPrice - IM/Q) / (1 - MMR)
 * Short: LiqPrice = (EntryPrice + IM/Q) / (1 + MMR)
 * 
 * Where IM is the Initial Margin allocated (EntryPrice * Q / Leverage)
 */
export const calculateLiquidationPrice = (
    entryPrice: number,
    quantity: number,
    leverage: number,
    mmr: number,
    direction: 'long' | 'short',
    walletBalance?: number
): number => {
    if (entryPrice <= 0 || quantity <= 0 || mmr <= 0) return 0;
    if (walletBalance === undefined && leverage <= 0) return 0;

    // If walletBalance is provided, use it as the margin backing the position
    // If not, calculate Initial Margin based on leverage
    const margin = walletBalance !== undefined ? walletBalance : (quantity * entryPrice) / leverage;

    if (direction === 'long') {
        // Formula: (Qty * Entry - Margin) / (Qty * (1 - MMR))
        const numerator = (quantity * entryPrice) - margin;
        const denominator = quantity * (1 - mmr);
        if (denominator === 0) return 0;
        const lp = numerator / denominator;
        return lp > 0 ? lp : 0;
    } else {
        // Formula: (Qty * Entry + Margin) / (Qty * (1 + MMR))
        const numerator = (quantity * entryPrice) + margin;
        const denominator = quantity * (1 + mmr);
        const lp = numerator / denominator;
        return lp > 0 ? lp : 0;
    }
};

/**
 * Calculates Bankruptcy Price (where Margin = 0)
 * Long: Mark = Entry - IM/Q
 * Short: Mark = Entry + IM/Q
 */
export const calculateBankruptcyPrice = (
    entryPrice: number,
    quantity: number,
    leverage: number,
    direction: 'long' | 'short'
): number => {
    if (quantity === 0 || leverage === 0) return 0;
    const imPerQty = entryPrice / leverage;

    if (direction === 'long') {
        return Math.max(0, entryPrice - imPerQty);
    } else {
        return entryPrice + imPerQty;
    }
};

/**
 * Calculates PnL (Unrealized)
 * Long: (Mark - Entry) * Q
 * Short: (Entry - Mark) * Q
 */
export const calculatePnL = (
    entryPrice: number,
    markPrice: number,
    quantity: number,
    direction: 'long' | 'short'
): number => {
    if (direction === 'long') {
        return (markPrice - entryPrice) * quantity;
    } else {
        return (entryPrice - markPrice) * quantity;
    }
};

/**
 * Calculates ROE
 * ROE = PnL / IM
 */
export const calculateROE = (
    pnl: number,
    initialMargin: number
): number => {
    if (initialMargin === 0) return 0;
    return pnl / initialMargin;
};

/**
 * Calculates Target Close Price based on expected PnL or ROE
 */
export const calculateTargetClosePrice = (
    uniqueEntryPrice: number, // renamed to avoid conflict if any, but actually arguments don't conflict. 
    quantity: number,
    leverage: number,
    targetValue: number, // PnL amount or ROE percentage (e.g. 0.5 for 50%)
    calculationMethod: 'pnl' | 'roe',
    direction: 'long' | 'short'
): number => {
    if (quantity === 0) return 0;

    let targetPnL = targetValue;

    if (calculationMethod === 'roe') {
        if (leverage === 0) return 0;
        const im = (quantity * uniqueEntryPrice) / leverage;
        targetPnL = im * targetValue;
    }

    // PnL = (Exit - Entry) * Q  => Exit = Entry + PnL/Q
    // Short PnL = (Entry - Exit) * Q => Exit = Entry - PnL/Q

    const pnlPerQty = targetPnL / quantity;

    if (direction === 'long') {
        return uniqueEntryPrice + pnlPerQty;
    } else {
        return uniqueEntryPrice - pnlPerQty;
    }
};

/**
 * Main calculation function
 */
export const calculateAll = (state: CalculatorState): CalculationResult => {
    const {
        direction,
        leverage,
        entryPrice,
        exitPrice,
        quantity,
        takerFeeRate,
        maintenanceMarginRate,
    } = state;

    const initialMargin = calculateInitialMargin(quantity, entryPrice, leverage);
    const estimatedOpenFee = calculateOpenFee(quantity, entryPrice, takerFeeRate);
    const orderCost = calculateOrderCost(initialMargin, estimatedOpenFee);

    const liquidationPrice = calculateLiquidationPrice(
        entryPrice,
        quantity,
        leverage,
        maintenanceMarginRate,
        direction
    );

    const bankruptcyPrice = calculateBankruptcyPrice(
        entryPrice,
        quantity,
        leverage,
        direction
    );

    let unrealizedPnL = null;
    let roe = null;
    let maintenanceMargin = 0;
    let liqRiskRate = null;

    if (exitPrice !== undefined && exitPrice > 0) {
        unrealizedPnL = calculatePnL(entryPrice, exitPrice, quantity, direction);
        roe = calculateROE(unrealizedPnL, initialMargin);
        maintenanceMargin = calculateMaintenanceMargin(quantity, exitPrice, maintenanceMarginRate);

        // Liq Risk Rate calculation
        // RemainingMargin = IM - Loss - Funding (Funding ignored for now)
        // Loss is negative PnL. So Remaining = IM + PnL.
        // If PnL is negative, Margin decreases.
        // LiqRisk = MM / RemainingMargin * 100%

        // Note: This matches the formula: RemainingMargin = IM - UPnL.
        // Wait, the formula said "RemainingMargin = IM - UPnL - Funding".
        // "UPnL" in that context likely meant "Loss" (positive value for loss)?
        // Usually "Remaining Margin = Margin Balance".
        // Margin Balance = Initial Margin + Unrealized PnL.
        // If UPnL is positive (profit), Margin Balance increases.
        // If UPnL is negative (loss), Margin Balance decreases.
        // The prompt says: "RemainingMargin = IM – UPnL – FundingFee"
        // And "FundingFee 扣减顺序...".
        // If UPnL is (Mark - Entry)*Q.
        // If loss (e.g. Long, Mark < Entry), UPnL is negative.
        // IM - (-Loss) = IM + Loss? No, that increases margin.
        // So "IM - UPnL" implies UPnL is defined as *Unrealized Loss* (positive number) or the formula subtracts the PnL value?
        // Let's assume standard logic: Margin Balance = IM + PnL.
        // If PnL is -10, Balance = IM - 10.
        // So RemainingMargin = IM + PnL.

        const remainingMargin = initialMargin + unrealizedPnL;

        if (remainingMargin <= 0) {
            liqRiskRate = 10000; // instant liquidation/bankruptcy
        } else {
            liqRiskRate = (maintenanceMargin / remainingMargin) * 100;
        }
    }

    return {
        initialMargin,
        maintenanceMargin: exitPrice ? maintenanceMargin : calculateMaintenanceMargin(quantity, entryPrice, maintenanceMarginRate), // MM at current price
        orderCost,
        estimatedOpenFee,
        liquidationPrice,
        bankruptcyPrice,
        unrealizedPnL,
        roe,
        liqRiskRate
    };
};
