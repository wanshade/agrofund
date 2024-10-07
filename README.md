# AgroFund Smart Contract

A decentralized lending platform built on Base, enabling farmers to secure loans and investors to fund agricultural projects.
This project is submitted for the **Buildathon Base Around The World** - Southeast Asia.



## Overview

AgroFund is a DeFi protocol that connects farmers seeking funding with investors looking to support agricultural projects. The platform uses IDRB (Indonesian Rupiah Backed) stablecoin for all transactions, ensuring stability and ease of use for both farmers and investors.

## Features

- **Loan Creation**: Farmers can create loan requests specifying amount, interest rate, and repayment deadline
- **Decentralized Funding**: Multiple investors can partially fund a single loan
- **Automated Repayment Distribution**: Smart contract automatically distributes repayments to investors based on their contribution
- **Default Protection**: Built-in mechanisms to handle loan defaults and protect investors
- **Transparent Tracking**: All loan and investment activities are recorded on-chain


## ⚠️ DISCLAIMER ⚠️
WARNING: THIS SMART CONTRACT IS UNAUDITED AND FOR DEMONSTRATION PURPOSES ONLY
This contract has not undergone a formal security audit and may contain bugs, vulnerabilities, or other issues that could lead to the loss of funds. DO NOT use this contract in production or with real assets. The creators and contributors are not responsible for any losses incurred through the use of this code.
If you intend to use this contract for actual financial transactions:

Obtain a comprehensive security audit from a reputable firm
Conduct thorough testing on testnet environments
Start with small amounts and gradually increase usage after proven stability

## Smart Contracts

### AgroFund.sol
The core contract that handles individual loan functionality:
- Loan creation and funding
- Repayment processing
- Fund withdrawal for both farmers and investors
- Default declaration

### AgroFundFactory.sol
A factory contract that:
- Deploys new AgroFund contracts
- Tracks all created projects
- Maintains user investment history
- Provides various view functions for frontend integration

## Key Functions

### AgroFund Contract

```solidity
function fundLoan(uint256 amount) external
```
Allows investors to fund a loan.

```solidity
function repayLoan() external
```
Enables farmers to repay their loans with interest.

```solidity
function withdrawLoan() external
```
Allows farmers to withdraw funded amounts.

### AgroFundFactory Contract

```solidity
function createAgroFund(
    string memory projectName,
    string memory description,
    uint256 loanAmount,
    uint256 interestRate,
    uint256 repaymentDeadline
) external returns (address)
```
Creates a new loan project.

## Events

The contracts emit various events for easy tracking:
- `LoanCreated`
- `LoanFunded`
- `LoanRepaid`
- `LoanDefaulted`
- `AgroFundCreated`

## Technical Details

- Solidity Version: ^0.8.20
- Framework: OpenZeppelin
- Testnet: Base Sepolia

## Security Considerations

- All functions have appropriate access controls
- Utilizes OpenZeppelin's secure IERC20 interface
- Built-in timelock mechanisms for funding periods
- Mathematical operations protected against overflow

## How to Use

1. **For Farmers**:
   - Create a loan request via the factory contract
   - Wait for funding
   - Withdraw funds once fully funded
   - Repay loan before deadline

2. **For Investors**:
   - Browse available projects
   - Fund projects partially or fully
   - Withdraw repayments once loans are repaid

## Deployed Addresses

- IDRB Token: `0x1d9F4aeb3ecF2De3a5B0f89333ce8157Cb62b4d7`
- AgroFundFactory: [To be added after deployment]

## License

This project is licensed under the MIT License.
