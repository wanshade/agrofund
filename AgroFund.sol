// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAgroFundFactory {
    function recordInvestment(address investor, address fundAddress) external;
    function updateLoanWithdrawalStatus(bool isLoanWithdrawn, bool isRepaymentWithdrawn) external;
}

contract AgroFund {
    address constant IDRB_ADDRESS = 0x1d9F4aeb3ecF2De3a5B0f89333ce8157Cb62b4d7;
    IERC20 public idrb;

    address public farmer;
    address public factory;

    struct Loan {
        uint256 id;
        uint256 amountRequested;
        uint256 amountFunded;
        uint256 interestRate;
        uint256 repaymentDeadline;
        uint256 creationTime;
        bool isFunded;
        bool isRepaid;
        bool isDefaulted;
        bool isLoanWithdrawn;
        bool isRepaymentWithdrawn;
    }

    Loan public loan;
    uint256 public fundingPeriod;

    mapping(address => uint256) public investments;
    mapping(address => uint256) public repaymentShares;
    address[] public loanInvestors;

    mapping(address => bool) public hasInvested;

    event LoanCreated(uint256 indexed id, address indexed farmer, uint256 amountRequested, uint256 interestRate, uint256 repaymentDeadline);
    event LoanFunded(uint256 indexed id, address indexed investor, uint256 amount);
    event LoanRepaid(uint256 indexed id);
    event FundsWithdrawn(uint256 indexed loanId, address indexed investor, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId);
    event RepaymentWithdrawn(uint256 indexed loanId, address indexed investor, uint256 amount);
    event LoanWithdrawn(uint256 indexed loanId, address indexed farmer, uint256 amount);

    constructor() {
        idrb = IERC20(IDRB_ADDRESS);
        factory = msg.sender;
        fundingPeriod = 30 days;
    }

    function initialize(address _farmer, uint256 amountRequested, uint256 interestRate, uint256 repaymentDeadline) external {
        require(msg.sender == factory, "Only factory can initialize");
        require(farmer == address(0), "Already initialized");
        farmer = _farmer;
        createLoan(amountRequested, interestRate, repaymentDeadline);
    }

    function createLoan(uint256 amountRequested, uint256 interestRate, uint256 repaymentDeadline) internal {
        require(loan.id == 0, "Loan already created");
        require(amountRequested > 0, "Amount must be greater than zero");
        require(repaymentDeadline > block.timestamp, "Invalid repayment deadline");

        loan = Loan({
            id: 1,
            amountRequested: amountRequested,
            amountFunded: 0,
            interestRate: interestRate,
            repaymentDeadline: repaymentDeadline,
            creationTime: block.timestamp,
            isFunded: false,
            isRepaid: false,
            isDefaulted: false,
            isLoanWithdrawn: false,
            isRepaymentWithdrawn: false
        });

        emit LoanCreated(1, farmer, amountRequested, interestRate, repaymentDeadline);
    }

    function fundLoan(uint256 amount) external {
        require(block.timestamp <= loan.creationTime + fundingPeriod, "Funding period has ended");
        require(!loan.isFunded, "Loan already funded");
        require(amount > 0 && amount <= loan.amountRequested - loan.amountFunded, "Invalid amount");

        idrb.transferFrom(msg.sender, address(this), amount);
        
        loan.amountFunded += amount;
        investments[msg.sender] += amount;
        
        if (!hasInvested[msg.sender]) {
            hasInvested[msg.sender] = true;
            loanInvestors.push(msg.sender);
            IAgroFundFactory(factory).recordInvestment(msg.sender, address(this));
        }

        if (loan.amountFunded >= loan.amountRequested) {
            loan.isFunded = true;
        }

        emit LoanFunded(1, msg.sender, amount);
    }

    function repayLoan() external {
        require(msg.sender == farmer, "Only farmer can repay the loan");
        require(loan.isFunded, "Loan not funded");
        require(!loan.isRepaid, "Loan already repaid");

        uint256 totalRepayment = loan.amountRequested + (loan.amountRequested * loan.interestRate / 100);
        require(totalRepayment > loan.amountRequested, "Invalid repayment amount");

        idrb.transferFrom(msg.sender, address(this), totalRepayment);

        loan.isRepaid = true;
        distributeRepayment(totalRepayment);

        emit LoanRepaid(1);
    }

    function distributeRepayment(uint256 totalRepayment) internal {
        uint256 totalInvested = loan.amountFunded;
        require(totalInvested > 0, "No investments in this loan");

        for (uint256 i = 0; i < loanInvestors.length; i++) {
            address investor = loanInvestors[i];
            uint256 amountInvested = investments[investor];

            if (amountInvested > 0) {
                uint256 investorShare = (amountInvested * totalRepayment) / totalInvested;
                repaymentShares[investor] += investorShare;
            }
        }
    }

    function withdrawRepayment() external {
        uint256 share = repaymentShares[msg.sender];
        require(share > 0, "No repayment to withdraw");
        
        repaymentShares[msg.sender] = 0;
        idrb.transfer(msg.sender, share);

        loan.isRepaymentWithdrawn = true;
        IAgroFundFactory(factory).updateLoanWithdrawalStatus(loan.isLoanWithdrawn, true);

        emit RepaymentWithdrawn(1, msg.sender, share);
    }

    function withdrawFunds() external {
        require(!loan.isFunded, "Loan is already funded");
        require(block.timestamp > loan.creationTime + fundingPeriod, "Funding period not over");

        uint256 amount = investments[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        investments[msg.sender] = 0;
        loan.amountFunded -= amount;
        
        idrb.transfer(msg.sender, amount);

        emit FundsWithdrawn(1, msg.sender, amount);
    }

    function withdrawLoan() external {
        require(msg.sender == farmer, "Only the farmer can withdraw the loan funds");
        require(loan.isFunded, "Loan not fully funded");
        require(!loan.isRepaid, "Loan already repaid");
        require(!loan.isLoanWithdrawn, "Loan already withdrawn");

        uint256 amountFunded = loan.amountFunded;
        loan.isLoanWithdrawn = true;
        IAgroFundFactory(factory).updateLoanWithdrawalStatus(true, loan.isRepaymentWithdrawn);
        
        idrb.transfer(msg.sender, amountFunded);

        emit LoanWithdrawn(1, msg.sender, amountFunded);
    }

    function declareLoanDefault() external {
        require(msg.sender == factory, "Only factory can declare default");
        require(block.timestamp > loan.repaymentDeadline, "Repayment deadline not passed");
        require(!loan.isRepaid, "Loan already repaid");
        require(!loan.isDefaulted, "Loan already defaulted");
        
        loan.isDefaulted = true;

        uint256 remainingFunds = idrb.balanceOf(address(this));
        distributeRepayment(remainingFunds);

        emit LoanDefaulted(1);
    }

    function getLoanDetails() external view returns (Loan memory) {
        return loan;
    }

    function getInvestors() external view returns (address[] memory) {
        return loanInvestors;
    }

    function getInvestmentAmount(address investor) external view returns (uint256) {
        return investments[investor];
    }

    function setFundingPeriod(uint256 _fundingPeriod) external {
        require(msg.sender == factory, "Only factory can set funding period");
        fundingPeriod = _fundingPeriod;
    }
}