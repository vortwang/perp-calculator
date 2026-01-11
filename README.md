# Perp Calculator (USDT-Margined)

A powerful, user-friendly Perpetual Contract Calculator built with React and TailwindCSS. Designed for crypto traders to calculate PnL, Target Prices, and Liquidation Prices with precision.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Revenue Calculator**: 
  - Calculate Initial Margin, Unrealized PnL, and ROE.
  - Supports Long and Short directions.
  - Adjustable leverage and quantity.

- **Target Close Price**: 
  - Calculate the required exit price to achieve a specific target PnL (amount) or ROE (%).

- **Liquidation Price**: 
  - Precise liquidation price calculation for Isolated Margin.
  - **New**: Supports "Available Balance" input to simulate cross-margin scenarios or balance-impacted liquidation prices.

- **Multiple Symbols Support**:
  - Supports major trading pairs: BTC, ETH, SOL, BNB, XRP, TON, LINK, OP, ARB, DOGE (USDT pairs).
  - Dynamic unit display based on selected symbol.

- **Localized UI**:
  - Fully translated into Chinese (Simplified) for accessibility.

- **Premium Design**:
  - Dark mode aesthetic inspired by top-tier trading platforms.
  - Responsive and intuitive layout.

## Tech Stack

- **Frontend**: React (Vite), TypeScript
- **Styling**: TailwindCSS v4
- **Testing**: Vitest for robust calculation logic verification

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vortwang/perp-calculator.git
   cd perp-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm run test
   ```

## License

MIT
