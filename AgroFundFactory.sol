// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgroFund.sol";

contract AgroFundFactory {
    struct ProjectInfo {
        string projectName;
        string description;
        uint256 loanAmount;
        uint256 interestRate;
        uint256 repaymentDeadline;
        address agroFundAddress;
        address owner;
        bool isLoanWithdrawn;
        bool isRepaymentWithdrawn;
    }

    ProjectInfo[] public projects;
    mapping(address => bool) public isAgroFund;

    mapping(address => address[]) public userLoans;
    mapping(address => address[]) public userInvestments;
    mapping(address => mapping(address => uint256)) public userInvestmentAmounts;

    event AgroFundCreated(address indexed agroFundAddress, address indexed owner, string projectName);
    event InvestmentRecorded(address indexed investor, address indexed fundAddress, uint256 amount);
    event WithdrawalStatusUpdated(address indexed fundAddress, bool isLoanWithdrawn, bool isRepaymentWithdrawn);

    function createAgroFund(
        string memory projectName,
        string memory description,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 repaymentDeadline
    ) external returns (address) {
        require(bytes(projectName).length > 0, "Project name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(loanAmount > 0, "Loan amount must be greater than 0");
        require(interestRate > 0 && interestRate <= 100, "Interest rate must be between 1 and 100");
        require(repaymentDeadline > block.timestamp, "Repayment deadline must be in the future");

        AgroFund newAgroFund = new AgroFund();
        address agroFundAddress = address(newAgroFund);
        
        newAgroFund.initialize(msg.sender, loanAmount, interestRate, repaymentDeadline);

        isAgroFund[agroFundAddress] = true;
        addProjectToList(projectName, description, loanAmount, interestRate, repaymentDeadline, agroFundAddress, msg.sender);
        userLoans[msg.sender].push(agroFundAddress);

        emit AgroFundCreated(agroFundAddress, msg.sender, projectName);

        return agroFundAddress;
    }

    function recordInvestment(address investor, address fundAddress) external {
        require(isAgroFund[msg.sender], "Only AgroFund contracts can record investments");
        
        if (!isInvestmentRecorded(investor, fundAddress)) {
            userInvestments[investor].push(fundAddress);
        }
        
        AgroFund fund = AgroFund(fundAddress);
        uint256 amount = fund.getInvestmentAmount(investor);
        userInvestmentAmounts[investor][fundAddress] = amount;
        
        emit InvestmentRecorded(investor, fundAddress, amount);
    }

    function updateLoanWithdrawalStatus(bool isLoanWithdrawn, bool isRepaymentWithdrawn) external {
        require(isAgroFund[msg.sender], "Only AgroFund contracts can update status");
        
        for (uint256 i = 0; i < projects.length; i++) {
            if (projects[i].agroFundAddress == msg.sender) {
                projects[i].isLoanWithdrawn = isLoanWithdrawn;
                projects[i].isRepaymentWithdrawn = isRepaymentWithdrawn;
                emit WithdrawalStatusUpdated(msg.sender, isLoanWithdrawn, isRepaymentWithdrawn);
                break;
            }
        }
    }

    function isInvestmentRecorded(address investor, address fundAddress) internal view returns (bool) {
        address[] memory investments = userInvestments[investor];
        for (uint i = 0; i < investments.length; i++) {
            if (investments[i] == fundAddress) {
                return true;
            }
        }
        return false;
    }

    function addProjectToList(
        string memory projectName,
        string memory description,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 repaymentDeadline,
        address agroFundAddress,
        address owner
    ) internal {
        projects.push(ProjectInfo({
            projectName: projectName,
            description: description,
            loanAmount: loanAmount,
            interestRate: interestRate,
            repaymentDeadline: repaymentDeadline,
            agroFundAddress: agroFundAddress,
            owner: owner,
            isLoanWithdrawn: false,
            isRepaymentWithdrawn: false
        }));
    }

    function getUserLoansDetails(address user) external view returns (ProjectInfo[] memory) {
        ProjectInfo[] memory userLoanDetails = new ProjectInfo[](userLoans[user].length);

        for (uint256 i = 0; i < userLoans[user].length; i++) {
            address agroFundAddress = userLoans[user][i];
            for (uint256 j = 0; j < projects.length; j++) {
                if (projects[j].agroFundAddress == agroFundAddress) {
                    userLoanDetails[i] = projects[j];
                    break;
                }
            }
        }
        return userLoanDetails;
    }

    function getUserInvestmentDetails(address user) external view returns (
        ProjectInfo[] memory projectInfos,
        uint256[] memory amounts
    ) {
        address[] memory investments = userInvestments[user];
        projectInfos = new ProjectInfo[](investments.length);
        amounts = new uint256[](investments.length);

        for (uint256 i = 0; i < investments.length; i++) {
            address fundAddress = investments[i];
            amounts[i] = userInvestmentAmounts[user][fundAddress];
            
            for (uint256 j = 0; j < projects.length; j++) {
                if (projects[j].agroFundAddress == fundAddress) {
                    projectInfos[i] = projects[j];
                    break;
                }
            }
        }
        
        return (projectInfos, amounts);
    }

function getUserTotalInvestment(address user) external view returns (uint256) {
        uint256 total = 0;
        address[] memory investments = userInvestments[user];
        
        for (uint256 i = 0; i < investments.length; i++) {
            total += userInvestmentAmounts[user][investments[i]];
        }
        
        return total;
    }

    function getAllProjects() external view returns (ProjectInfo[] memory) {
        return projects;
    }

    function getUserInvestments(address user) external view returns (address[] memory) {
        return userInvestments[user];
    }
}