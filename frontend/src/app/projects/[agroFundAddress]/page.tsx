'use client'

import { useState, useCallback, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { toWei } from "thirdweb/utils"
import { getContract, prepareContractCall, PreparedTransaction } from "thirdweb"
import { baseSepolia, base } from "thirdweb/chains"
import { 
  useReadContract, 
  useActiveAccount, 
  TransactionButton,
} from "thirdweb/react"
import { CalendarIcon, CreditCardIcon, UserIcon, ReceiptText } from "lucide-react"

import { client } from "@/app/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  resolveL2Name,
  BASENAME_RESOLVER_ADDRESS,
} from "thirdweb/extensions/ens";
import Link from "next/link"
import BlurFade from "@/components/ui/blur-fade"

// Types
interface LoanDetails {
  id: bigint
  amountRequested: bigint
  amountFunded: bigint
  interestRate: bigint
  repaymentDeadline: bigint
  creationTime: bigint
  isFunded: boolean
  isRepaid: boolean
  isDefaulted: boolean
  isLoanWithdrawn: boolean
  isRepaymentWithdrawn: boolean
}


export default function ProjectDetailsPage() {
  // State
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(BigInt(0))
  const [isLoading, setIsLoading] = useState(false)
  const [resolvedFarmerName, setResolvedFarmerName] = useState<string | null>(null)
  
  // Hooks
  const { agroFundAddress } = useParams()
  const activeAccount = useActiveAccount()
  const { toast } = useToast()
  
  // Contract instances
  const contractLoan = getContract({
    client,
    chain: baseSepolia,
    address: agroFundAddress as string,
  })

  const idrbContract = getContract({
    client,
    chain: baseSepolia,
    address: "0x1d9F4aeb3ecF2De3a5B0f89333ce8157Cb62b4d7",
  })

  // Contract reads
  const { data: farmer } = useReadContract({
    contract: contractLoan,
    method: "function farmer() view returns (address)",
    params: [],
  })

  const { data: loanDetails } = useReadContract({
    contract: contractLoan,
    method: "function getLoanDetails() view returns ((uint256 id, uint256 amountRequested, uint256 amountFunded, uint256 interestRate, uint256 repaymentDeadline, uint256 creationTime, bool isFunded, bool isRepaid, bool isDefaulted, bool isLoanWithdrawn, bool isRepaymentWithdrawn))",
    params: [],
  }) as { data: LoanDetails | undefined }


  const { data: hasInvested } = useReadContract({
    contract: contractLoan,
    method: "function hasInvested(address) view returns (bool)",
    params: [activeAccount?.address || '']
  }) as { data: boolean }

  const { data: allowance } = useReadContract({
    contract: idrbContract,
    method: "function allowance(address owner, address spender) view returns (uint256)",
    params: [activeAccount?.address || '', agroFundAddress as string],
  })

  const { data: totalRepaymentAmount, isLoading: isLoadingRepayment } = useReadContract({
    contract: contractLoan,
    method: "function getTotalRepaymentAmount() view returns (uint256)",
    params: [],
  })



  // Derived state
  const isFarmer = activeAccount?.address === farmer
  const investmentAmountWei = investmentAmount ? toWei(investmentAmount) : BigInt(0)
  const needsInvestmentApproval = investmentAmountWei > currentAllowance

  // Calculate repayment amount
  const calculatedRepaymentAmount = useMemo(() => {
    if (!loanDetails) return BigInt(0)
    const principal = loanDetails.amountFunded
    const interest = (principal * loanDetails.interestRate) / BigInt(100)
    return principal + interest
  }, [loanDetails])

  const repaymentAmount = totalRepaymentAmount || calculatedRepaymentAmount
  const needsRepaymentApproval = repaymentAmount > currentAllowance

  // Update states when data changes
  useEffect(() => {
    if (allowance !== undefined) {
      setCurrentAllowance(allowance)
    }
  }, [allowance])

  useEffect(() => {
    if (totalRepaymentAmount !== undefined) {
      console.log("Contract repayment amount:", totalRepaymentAmount.toString())
      console.log("Calculated repayment amount:", calculatedRepaymentAmount.toString())
    }
  }, [totalRepaymentAmount, calculatedRepaymentAmount])

  useEffect(() => {
    const resolveFarmerName = async () => {
      if (farmer) {
        try {
          const name = await resolveL2Name({
            client,
            address: farmer,
            resolverAddress: BASENAME_RESOLVER_ADDRESS,
            resolverChain: base,
          });
          setResolvedFarmerName(name || farmer);
        } catch (error) {
          console.error("Error resolving farmer name:", error);
          setResolvedFarmerName(farmer);
        }
      }
    };

    resolveFarmerName();
  }, [farmer]);

  // Utility functions
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  const formatCurrency = (amount: bigint) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) / 1e18)
  }

  const calculateFundingPercentage = (): number => {
    if (!loanDetails) return 0
    const amountRequested = Number(loanDetails.amountRequested)
    const amountFunded = Number(loanDetails.amountFunded)
    return amountRequested > 0 ? (amountFunded / amountRequested) * 100 : 0
  }

  // Transaction handlers
  const handleInvest = async (): Promise<PreparedTransaction<any>> => {
    if (!investmentAmount || Number(investmentAmount) <= 0) {
      throw new Error("Invalid investment amount")
    }

    if (needsInvestmentApproval) {
      return await prepareContractCall({
        contract: idrbContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [agroFundAddress as string, investmentAmountWei]
      })
    } else {
      return await prepareContractCall({
        contract: contractLoan,
        method: "function fundLoan(uint256 amount)",
        params: [investmentAmountWei]
      })
    }
  }

  const handleWithdrawLoan = async (): Promise<PreparedTransaction<any>> => {
    return await prepareContractCall({
      contract: contractLoan,
      method: "function withdrawLoan()",
      params: []
    })
  }

  const handleWithdrawInvestment = async (): Promise<PreparedTransaction<any>> => {
    return await prepareContractCall({
      contract: contractLoan,
      method: "function withdrawRepayment()",
      params: []
    })
  }

  const handleRepayLoan = async (): Promise<PreparedTransaction<any>> => {
    if (needsRepaymentApproval) {
      return await prepareContractCall({
        contract: idrbContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [agroFundAddress as string, repaymentAmount]
      })
    } else {
      return await prepareContractCall({
        contract: contractLoan,
        method: "function repayLoan()",
        params: []
      })
    }
  }

  const handleTransactionSuccess = useCallback((action: string) => {
    if (action === 'investApprove') {
      setCurrentAllowance(investmentAmountWei)
      toast({
        title: "Investment Approval Successful",
        description: "You can now proceed with your investment.",
        duration: 5000,
      })
    } else if (action === 'repaymentApprove') {
      setCurrentAllowance(repaymentAmount)
      toast({
        title: "Repayment Approval Successful",
        description: "You can now proceed with loan repayment.",
        duration: 5000,
      })
    } else if (action === 'invest') {
      setIsInvestModalOpen(false)
      setInvestmentAmount("")
      toast({
        title: "Investment Successful",
        description: `You have successfully invested ${investmentAmount} IDRB.`,
        duration: 5000,
      })
    } else if (action === 'withdrawLoan') {
      toast({
        title: "Loan Withdrawn",
        description: "You have successfully withdrawn the loan.",
        duration: 5000,
      })
    } else if (action === 'withdrawInvestment') {
      toast({
        title: "Investment Withdrawn",
        description: "You have successfully withdrawn your investment.",
        duration: 5000,
      })
    } else if (action === 'repayLoan') {
      toast({
        title: "Loan Repaid",
        description: "You have successfully repaid the loan.",
        duration: 5000,
      })
    }
  }, [investmentAmountWei, investmentAmount, repaymentAmount, toast])

  const fundingPercentage = calculateFundingPercentage()
  const isFullyFunded = loanDetails?.amountRequested === loanDetails?.amountFunded

  return (
    <div className="container mx-auto mt-8 min-h-screen max-w-6xl ">
       <BlurFade delay={0.1}>
      <div className="flex justify-between items-center mb-6">
        {/* <h1 className="text-2xl font-bold">Project Details</h1> */}
        <div className="space-x-2 flex place-items-end ml-auto">
          {!isFarmer && !isFullyFunded && activeAccount?.address && (
            <Button 
              onClick={() => setIsInvestModalOpen(true)}
              className="bg-custom-teal hover:bg-custom-teal2 text-white"
              disabled={isLoading}
            >
              Invest Now
            </Button>
          )}
          {isFarmer && activeAccount?.address && (
            <>
              <TransactionButton
                transaction={handleWithdrawLoan}
                onTransactionConfirmed={() => handleTransactionSuccess('withdrawLoan')}
                className="bg-green-600 hover:bg-dark-700 text-white"
                disabled={isLoading || !loanDetails?.isFunded || loanDetails?.isLoanWithdrawn}
              >
                Withdraw Loan
              </TransactionButton>
              <TransactionButton
                transaction={handleRepayLoan}
                onTransactionConfirmed={() => handleTransactionSuccess(needsRepaymentApproval ? 'repaymentApprove' : 'repayLoan')}
                className="bg-green-600 hover:bg-dark-700 text-white"
                disabled={isLoading || !loanDetails?.isFunded || loanDetails?.isRepaid || !loanDetails?.isLoanWithdrawn}
              >
                {needsRepaymentApproval ? 'Approve Repayment' : 'Repay Loan'}
              </TransactionButton>
            </>
          )}
          {!isFarmer && activeAccount?.address && (
            <TransactionButton
              transaction={handleWithdrawInvestment}
              onTransactionConfirmed={() => handleTransactionSuccess('withdrawInvestment')}
              className="bg-green-600 hover:bg-dark-700 text-white"
              disabled={isLoading || !loanDetails?.isRepaid || loanDetails?.isRepaymentWithdrawn || !hasInvested}
            >
              Withdraw Investment
            </TransactionButton>
          )}
        </div>
      </div>
      </BlurFade>

      <Dialog open={isInvestModalOpen} onOpenChange={setIsInvestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount (IDRB)</Label>
              <Input
                id="amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
              />
            </div>
            <TransactionButton
              transaction={handleInvest}
              onTransactionConfirmed={() => handleTransactionSuccess(needsInvestmentApproval ? 'investApprove' : 'invest')}
              className="w-full"
              disabled={!investmentAmount || Number(investmentAmount) <= 0 || isLoading}
            >
              {needsInvestmentApproval ? 'Approve IDRB' : 'Confirm Investment'}
            </TransactionButton>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2">
      <BlurFade delay={0.2}>
      <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-b from-green-100 to-green-200">
            <CardTitle>Loan Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Funding Progress</span>
                <span className="text-sm font-medium text-gray-600">
                  {fundingPercentage.toFixed(2)}%
                </span>
              </div>
              <Progress value={fundingPercentage} className="w-full" />
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="font-medium text-gray-500">Amount Requested</dt>
                <dd className="text-lg">{formatCurrency(loanDetails?.amountRequested || BigInt(0))}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Amount Funded</dt>
                <dd className="text-lg">{formatCurrency(loanDetails?.amountFunded || BigInt(0))}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Interest Rate</dt>
                <dd className="text-lg">{Number(loanDetails?.interestRate || 0)}%</dd>
              </div>
              {/* <div>
                <dt className="font-medium text-gray-500">Repayment Amount</dt>
                <dd className="text-lg">{formatCurrency(repaymentAmount)}</dd>
              </div> */}
            
            </dl>
          </CardContent>
        </Card>
        </BlurFade>

        

        <BlurFade delay={0.3}>
        <Card className="bg-white shadow-xl rounded-xl overflow-hidden h-full">
        <CardHeader className="bg-gradient-to-b from-green-100 to-green-200">
          <CardTitle>Farmer Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Farmer Address:</span>
            </div>
            <p className="text-sm text-gray-600 break-all bg-gray-100 p-2 rounded mb-3"> {resolvedFarmerName || 'Not available'}</p>
            <div className="flex items-center space-x-2 mb-3">
              <ReceiptText className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Contract Address:</span>
            </div>
            <p className="text-sm text-gray-600 break-all bg-gray-100 p-2 rounded"><Link href={`https://sepolia.basescan.org/address/${agroFundAddress}`} className='text-gray-500' target="_blank"
      rel="noopener noreferrer">{agroFundAddress}</Link></p>
          </CardContent>
        </Card>
        </BlurFade>

        <BlurFade delay={0.4}>
        <Card className="bg-white shadow-xl rounded-xl overflow-hidden h-full">
        <CardHeader className="bg-gradient-to-b from-green-100 to-green-200">
            <CardTitle>Loan Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 w-auto">
              <StatusBadge 
                isActive={loanDetails?.isFunded} 
                activeText="Funded" 
                inactiveText="Not Funded"
              />
              <StatusBadge 
                isActive={loanDetails?.isRepaid} 
                activeText="Repaid" 
                inactiveText="Not Repaid"
              />
              
              <StatusBadge 
                isActive={loanDetails?.isLoanWithdrawn} 
                activeText="Loan Withdrawn" 
                inactiveText="Loan Not Withdrawn"
              />
              <StatusBadge 
                isActive={loanDetails?.isRepaymentWithdrawn} 
                activeText="Repayment Withdrawn" 
                inactiveText="Repayment Not Withdrawn"
              />
            </div>
          </CardContent>
        </Card>
        </BlurFade>

        <BlurFade delay={0.5}>
        <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-b from-green-100 to-green-200">
            <CardTitle>Important Dates</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Creation Date:</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDate(loanDetails?.creationTime || BigInt(0))}
                </p>
              </div>
              <Separator />
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <CreditCardIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Repayment Deadline:</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDate(loanDetails?.repaymentDeadline || BigInt(0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </BlurFade>
      </div>
    </div>
  )
}

function StatusBadge({ 
  isActive, 
  activeText, 
  inactiveText, 
  isDestructive = false 
}: {
  isActive?: boolean
  activeText: string
  inactiveText: string
  isDestructive?: boolean
}) {
  const variant = isActive 
    ? (isDestructive ? "destructive" : "default")
    : "secondary"
  
  return (
    <Badge variant={variant}>
      {isActive ? activeText : inactiveText}
    </Badge>
  )
}