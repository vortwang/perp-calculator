
import React, { useState } from 'react';
import { calculateAll, calculateTargetClosePrice, DEFAULT_TAKER_FEE_RATE, DEFAULT_MMR } from '../utils/calculator';
import type { CalculatorState } from '../utils/calculator';

type Tab = 'revenue' | 'close_price' | 'liq_price';

const Calculator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('revenue');

    // State
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);

    const [direction, setDirection] = useState<'long' | 'short'>('long');
    const [leverage, setLeverage] = useState<string>('22');
    const [entryPrice, setEntryPrice] = useState<string>('77777');
    const [exitPrice, setExitPrice] = useState<string>('66666');
    const [quantity, setQuantity] = useState<string>('10');

    // Target Close Price State
    const [targetMethod, setTargetMethod] = useState<'pnl' | 'roe'>('roe');
    const [targetValue, setTargetValue] = useState<string>('100'); // % or Value

    // Results
    const [result, setResult] = useState<ReturnType<typeof calculateAll> | null>(null);
    const [targetResult, setTargetResult] = useState<number | null>(null);

    // Derived
    const baseAsset = symbol.replace('USDT', '');

    const handleCalculate = () => {
        const lev = parseFloat(leverage) || 0;
        const entry = parseFloat(entryPrice) || 0;
        const exit = parseFloat(exitPrice) || 0;
        const qty = parseFloat(quantity) || 0;

        // Target Close Price Calculation
        if (activeTab === 'close_price') {
            const tVal = parseFloat(targetValue) || 0;
            // If method is ROE, pass value as ratio (100% = 1)
            const val = targetMethod === 'roe' ? tVal / 100 : tVal;
            const res = calculateTargetClosePrice(entry, qty, lev, val, targetMethod, direction);
            setTargetResult(res);
            return;
        }

        // Standard Calculation
        const state: CalculatorState = {
            symbol,
            direction,
            leverage: lev,
            entryPrice: entry,
            exitPrice: activeTab === 'revenue' ? exit : undefined,
            quantity: qty,
            takerFeeRate: DEFAULT_TAKER_FEE_RATE,
            maintenanceMarginRate: DEFAULT_MMR,
        };

        const res = calculateAll(state);
        setResult(res);
    };

    // Format currency
    const fmt = (num: number | null | undefined, decimals = 2) => {
        if (num === null || num === undefined) return '--';
        return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    return (
        <div className="w-full max-w-4xl bg-[#1e2329] text-[#eaecef] rounded-lg shadow-2xl overflow-hidden font-sans border border-[#2b3139]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2b3139]">
                <h2 className="text-xl font-semibold">计算器</h2>
                <button className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 pt-4 space-x-6 text-base font-medium text-gray-400 border-b border-[#2b3139]">
                <button
                    className={`pb-3 ${activeTab === 'revenue' ? 'text-[#fcd535] border-b-2 border-[#fcd535]' : 'hover:text-white'}`}
                    onClick={() => setActiveTab('revenue')}
                >
                    收益
                </button>
                <button
                    className={`pb-3 ${activeTab === 'close_price' ? 'text-[#fcd535] border-b-2 border-[#fcd535]' : 'hover:text-white'}`}
                    onClick={() => setActiveTab('close_price')}
                >
                    平仓价格
                </button>
                <button
                    className={`pb-3 ${activeTab === 'liq_price' ? 'text-[#fcd535] border-b-2 border-[#fcd535]' : 'hover:text-white'}`}
                    onClick={() => setActiveTab('liq_price')}
                >
                    强平价格
                </button>
            </div>

            <div className="flex flex-col md:flex-row p-6 gap-8">
                {/* Input Section */}
                <div className="flex-1 space-y-5">
                    {/* Margin Mode & Calc Method */}
                    {activeTab === 'liq_price' && (
                        <div className="flex items-center justify-between">
                            <label className="text-gray-400">仓位</label>
                            <div className="w-2/3 bg-[#2b3139] rounded px-3 py-2 text-sm text-gray-300">
                                逐仓
                            </div>
                        </div>
                    )}

                    {activeTab === 'close_price' && (
                        <div className="flex items-center justify-between">
                            <label className="text-gray-400 w-24">计算方式</label>
                            <div className="flex-1 flex bg-[#2b3139] rounded p-1">
                                <button
                                    className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${targetMethod === 'pnl' ? 'bg-[#474d57] text-[#fcd535]' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setTargetMethod('pnl')}
                                >
                                    收益额
                                </button>
                                <button
                                    className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${targetMethod === 'roe' ? 'bg-[#474d57] text-[#fcd535]' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setTargetMethod('roe')}
                                >
                                    收益率
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Symbol */}
                    <div className="flex items-center justify-between relative">
                        <label className="text-gray-400 w-24">币种</label>
                        <div
                            className="flex-1 bg-[#2b3139] rounded px-3 py-2 text-sm text-white flex justify-between items-center cursor-pointer hover:border hover:border-gray-500 border border-transparent transition-colors"
                            onClick={() => setIsSymbolDropdownOpen(!isSymbolDropdownOpen)}
                        >
                            <span>{symbol}</span>
                            <span className="text-xs">▼</span>
                        </div>

                        {isSymbolDropdownOpen && (
                            <div className="absolute top-full right-0 w-[calc(100%-6rem)] mt-1 bg-[#2b3139] rounded shadow-xl border border-[#474d57] z-10 overflow-hidden max-h-60 overflow-y-auto">
                                {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'TONUSDT', 'LINKUSDT', 'OPUSDT', 'ARBUSDT', 'DOGEUSDT'].map((s) => (
                                    <div
                                        key={s}
                                        className="px-3 py-2 hover:bg-[#474d57] cursor-pointer text-sm"
                                        onClick={() => {
                                            setSymbol(s);
                                            setIsSymbolDropdownOpen(false);
                                        }}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Direction */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 w-24">开仓类型</label>
                        <div className="flex-1 flex bg-[#2b3139] rounded p-1">
                            <button
                                className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${direction === 'long' ? 'bg-[#2ebd85] text-white' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => setDirection('long')}
                            >
                                开多
                            </button>
                            <button
                                className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${direction === 'short' ? 'bg-[#f6465d] text-white' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => setDirection('short')}
                            >
                                开空
                            </button>
                        </div>
                    </div>

                    {/* Leverage */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 w-24">杠杆倍数</label>
                        <div className="flex-1 bg-[#2b3139] rounded flex items-center border border-transparent hover:border-gray-500 transition-colors focus-within:border-[#fcd535]">
                            <input
                                type="number"
                                className="w-full bg-transparent p-2 text-white outline-none text-right appearance-none"
                                value={leverage}
                                onChange={(e) => setLeverage(e.target.value)}
                            />
                            <span className="pr-3 text-gray-500 text-sm">倍</span>
                        </div>
                    </div>

                    {/* Entry Price */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 w-24">开仓价格</label>
                        <div className="flex-1 bg-[#2b3139] rounded flex items-center border border-transparent hover:border-gray-500 transition-colors focus-within:border-[#fcd535]">
                            <input
                                type="number"
                                className="w-full bg-transparent p-2 text-white outline-none text-right appearance-none"
                                value={entryPrice}
                                onChange={(e) => setEntryPrice(e.target.value)}
                            />
                            <span className="pr-3 text-gray-500 text-sm">USDT</span>
                        </div>
                    </div>

                    {/* Exit Price - Only for Revenue */}
                    {activeTab === 'revenue' && (
                        <div className="flex items-center justify-between">
                            <label className="text-gray-400 w-24">平仓价格</label>
                            <div className="flex-1 bg-[#2b3139] rounded flex items-center border border-transparent hover:border-gray-500 transition-colors focus-within:border-[#fcd535]">
                                <input
                                    type="number"
                                    className="w-full bg-transparent p-2 text-white outline-none text-right appearance-none"
                                    value={exitPrice}
                                    onChange={(e) => setExitPrice(e.target.value)}
                                />
                                <span className="pr-3 text-gray-500 text-sm">USDT</span>
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 w-24">开仓数量</label>
                        <div className="flex-1 bg-[#2b3139] rounded flex items-center border border-transparent hover:border-gray-500 transition-colors focus-within:border-[#fcd535]">
                            <input
                                type="number"
                                className="w-full bg-transparent p-2 text-white outline-none text-right appearance-none"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                            <span className="pr-3 text-gray-500 text-sm">{baseAsset}</span>
                        </div>
                    </div>

                    {/* Target Value - Only for Close Price */}
                    {activeTab === 'close_price' && (
                        <div className="flex items-center justify-between">
                            <label className="text-gray-400 w-24">{targetMethod === 'roe' ? '预期收益率' : '预期收益'}</label>
                            <div className="flex-1 bg-[#2b3139] rounded flex items-center border border-transparent hover:border-gray-500 transition-colors focus-within:border-[#fcd535]">
                                <input
                                    type="number"
                                    className="w-full bg-transparent p-2 text-white outline-none text-right appearance-none"
                                    value={targetValue}
                                    onChange={(e) => setTargetValue(e.target.value)}
                                />
                                <span className="pr-3 text-gray-500 text-sm">{targetMethod === 'roe' ? '%' : 'USDT'}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        className="w-full py-3 bg-[#e67e22] hover:bg-[#d35400] text-white font-semibold rounded transition-colors mt-4"
                        onClick={handleCalculate}
                    >
                        开始计算
                    </button>
                </div>

                {/* Result Section */}
                <div className="flex-1 md:w-80 bg-[#171a1e] rounded p-6 flex flex-col">
                    <h3 className="text-lg font-medium mb-6 text-gray-200">计算结果</h3>

                    <div className="space-y-4 flex-1">
                        {activeTab === 'revenue' ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">保证金</span>
                                    <span className="text-gray-200">{fmt(result?.initialMargin)} USDT</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">收益</span>
                                    <span className={`${(result?.unrealizedPnL || 0) >= 0 ? 'text-[#2ebd85]' : 'text-[#f6465d]'} font-semibold`}>
                                        {result?.unrealizedPnL && result.unrealizedPnL > 0 ? '+' : ''}{fmt(result?.unrealizedPnL)} USDT
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">收益率</span>
                                    <span className={`${(result?.roe || 0) >= 0 ? 'text-[#2ebd85]' : 'text-[#f6465d]'} font-semibold`}>
                                        {result?.roe && result.roe > 0 ? '+' : ''}{fmt((result?.roe || 0) * 100)} %
                                    </span>
                                </div>
                                <div className="mt-8 pt-6 border-t border-[#2b3139]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">强平价格</span>
                                        <span className="text-[#fcd535]">{fmt(result?.liquidationPrice)} USDT</span>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'close_price' ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">平仓价格</span>
                                    <span className="text-white font-bold text-xl">{fmt(targetResult)} USDT</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">强平价</span>
                                    <span className="text-white font-bold text-xl">{fmt(result?.liquidationPrice)} USDT</span>
                                </div>
                                <div className="mt-4 text-xs text-gray-500">
                                    * 注意:当前只针对逐仓的单个持仓计算强平价，计算结果仅供参考
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
