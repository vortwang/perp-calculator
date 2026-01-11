# 永续合约计算器 (USDT本位)

一个功能强大、用户友好的永续合约计算器，基于 React 和 TailwindCSS 构建。专为加密货币交易者设计，可精确计算收益 (PnL)、目标平仓价格和强平价格。

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 功能特性

- **收益计算器**: 
  - 计算初始保证金、未实现盈亏 (PnL) 和 收益率 (ROE)。
  - 支持做多 (Long) 和做空 (Short) 双向计算。
  - 灵活调整杠杆倍数和开仓数量。

- **目标平仓价格**: 
  - 根据预期的 目标收益额 (PnL) 或 收益率 (ROE) 反推所需的平仓价格。

- **强平价格 (强平价)**: 
  - 精确的逐仓模式强平价格计算。
  - **新增**: 支持输入 "可用余额" (Available Balance)，模拟全仓模式或包含账户余额影响的强平价格计算。

- **多币种支持**:
  - 支持主流交易对: BTC, ETH, SOL, BNB, XRP, TON, LINK, OP, ARB, DOGE (均为 USDT 交易对)。
  - 根据选择的币种动态显示数量单位。

- **本地化界面**:
  - 全中文 (简体) 界面，贴合中文用户习惯。

- **高级设计**:
  - 采用类似于顶级交易平台的深色模式 (Dark Mode) 设计。
  - 响应式布局，操作直观流畅。

## 技术栈

- **前端**: React (Vite), TypeScript
- **样式**: TailwindCSS v4
- **测试**: Vitest (用于验证核心计算逻辑的准确性)

## 快速开始

### 前置要求

- Node.js (v18 或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆仓库:
   ```bash
   git clone https://github.com/vortwang/perp-calculator.git
   cd perp-calculator
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 启动开发服务器:
   ```bash
   npm run dev
   ```

4. 运行测试:
   ```bash
   npm run test
   ```

## 许可证

MIT
