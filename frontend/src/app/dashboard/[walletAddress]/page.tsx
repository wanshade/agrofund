"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Leaf,
  TrendingUp,
  DollarSign,
  Users,
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { AGRO_FACTORY } from "@/app/constants";
import CreateProjectButton from "@/components/createbutton";
import { shortenAddress } from "thirdweb/utils";
import {
  resolveL2Name,
  BASENAME_RESOLVER_ADDRESS,
} from "thirdweb/extensions/ens";
import BlurFade from "@/components/ui/blur-fade";


// Define the type for loan data
type AgroFundData = {
  projectName: string;
  description: string;
  loanAmount: bigint;
  interestRate: bigint;
  repaymentDeadline: bigint;
  agroFundAddress: string;
  owner: string;
};

// Define the type for investment data
type InvestmentData = AgroFundData & {
  investedAmount: bigint;
};

export default function Dashboard() {
  const [resolvedNames, setResolvedNames] = useState<{[key: string]: string}>({});

  const params = useParams();
  const walletAddress = typeof params.walletAddress === 'string' 
    ? params.walletAddress 
    : Array.isArray(params.walletAddress) 
      ? params.walletAddress[0] 
      : '';
  
  const router = useRouter();
  const account = useActiveAccount();

  const contractFactory = getContract({
    client: client,
    chain: baseSepolia,
    address: AGRO_FACTORY,
  });

  const { data: dataLoans, isLoading: isLoadingLoans } = useReadContract({
    contract: contractFactory,
    method:
      "function getUserLoansDetails(address user) view returns ((string projectName, string description, uint256 loanAmount, uint256 interestRate, uint256 repaymentDeadline, address agroFundAddress, address owner)[])",
    params: [walletAddress],
  });

  const { data: dataInvestments, isLoading: isLoadingInvestments } =
    useReadContract({
      contract: contractFactory,
      method:
        "function getUserInvestmentDetails(address user) view returns ((string projectName, string description, uint256 loanAmount, uint256 interestRate, uint256 repaymentDeadline, address agroFundAddress, address owner)[] projectInfos, uint256[] amounts)",
      params: [walletAddress],
    });

  const [loans, setLoans] = useState<AgroFundData[]>([]);
  const [investments, setInvestments] = useState<InvestmentData[]>([]);

  useEffect(() => {
    if (dataLoans) {
      setLoans(dataLoans as AgroFundData[]);
    }
    if (dataInvestments) {
      const [projectInfos, amounts] = dataInvestments;
      const combinedInvestments = projectInfos.map((info, index) => ({
        ...info,
        investedAmount: amounts[index],
      }));
      setInvestments(combinedInvestments);
    }
  }, [dataLoans, dataInvestments]);

  useEffect(() => {
    if (account?.address === undefined) {
      router.push("/");
    }
  }, [account, router]);

  const formatCurrency = (amount: bigint) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(Number(amount) / 1e18);
  };

  const calculateTotalInvestments = () => {
    return investments.reduce(
      (acc, investment) => acc + investment.investedAmount,
      BigInt(0)
    );
  };

  const calculateAverageInterestRate = (items: AgroFundData[]) => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + Number(item.interestRate), 0);
    return sum / items.length;
  };

  const isLoading = isLoadingLoans || isLoadingInvestments;

  useEffect(() => {
    const resolveNames = async () => {
      try {
        if (walletAddress) {
          const name = await resolveL2Name({
            client: client,
            address: walletAddress as string,
            resolverAddress: BASENAME_RESOLVER_ADDRESS,
            resolverChain: baseSepolia,
          });
          setResolvedNames(prev => ({
            ...prev,
            [walletAddress]: name || shortenAddress(walletAddress)
          }));
        }
      } catch (error) {
        console.error("Error resolving name:", error);
        if (walletAddress) {
          setResolvedNames(prev => ({
            ...prev,
            [walletAddress]: shortenAddress(walletAddress)
          }));
        }
      }
    };

    resolveNames();
  }, [walletAddress]);


  return (
    <div className="flex flex-col min-h-screen ">
      <main className="flex-1 py-3">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
          <BlurFade delay={0.1}>
            <h1 className="text-2xl font-bold tracking-tighter mb-8 mt-8">
            Welcome,  {resolvedNames[walletAddress] || shortenAddress(walletAddress)}
            </h1>
            </BlurFade>
            <BlurFade delay={0.2}>
            <div className="flex justify-end mb-4">
              <CreateProjectButton />
            </div>
            </BlurFade>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <BlurFade delay={0.3}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Loans
                  </CardTitle>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      loans.reduce(
                        (acc, loan) => acc + loan.loanAmount,
                        BigInt(0)
                      )
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loans.length} active loans
                  </p>
                </CardContent>
              </Card>
              </BlurFade>
              <BlurFade delay={0.4}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Investments
                  </CardTitle>
                  <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(calculateTotalInvestments())}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {investments.length} active investments
                  </p>
                </CardContent>
              </Card>
              </BlurFade>
              <BlurFade delay={0.5}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Avg. Loan Rate
                  </CardTitle>
                  <BarChart className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateAverageInterestRate(loans)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loans.length} active loans
                  </p>
                </CardContent>
              </Card>
              </BlurFade>

              <BlurFade delay={0.6}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Avg. Investment Return
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateAverageInterestRate(investments)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {investments.length} active investments
                  </p>
                </CardContent>
              </Card>
              </BlurFade>
            </div>
            <BlurFade delay={0.7}>
            <h2 className="text-2xl font-bold tracking-tighter mb-6">
              Your Loans
            </h2>
            </BlurFade>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {!isLoading &&
                dataLoans &&
                (dataLoans.length > 0 ? (
                  dataLoans.map((loan, index) => (
                    <BlurFade key={index} delay={0.8 + index * 0.1}>
                    <Card >
                      <Link href={`/projects/${loan.agroFundAddress}`}>
                        <CardHeader>
                          <CardTitle>{loan.projectName}</CardTitle>
                        </CardHeader>
                      </Link>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Loan Amount: {formatCurrency(loan.loanAmount)}
                        </p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <p className="text-sm font-bold text-green-600">
                            Interest Rate: {loan.interestRate.toString()}%
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Link href={`/projects/${loan.agroFundAddress}`}>
                          <Button
                            onClick={() =>
                              console.log(`Repay loan for ${loan.projectName}`)
                            }
                          >
                            Details
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                    </BlurFade>
                  ))
                ) : (
                  <BlurFade delay={0.8}>
                  <p>You dont have any loans.</p>
                  </BlurFade>
                ))}
            </div>
            <BlurFade delay={0.9}>
            <h2 className="text-2xl font-bold tracking-tighter  mb-6">
              Your Investments
            </h2>
            </BlurFade>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {!isLoading && investments.length > 0 ? (
                investments.map((investment, index) => (
                  <BlurFade key={index} delay={0.9 + index * 0.1}>
                  <Card >
                    <Link href={`/projects/${investment.agroFundAddress}`}>
                      <CardHeader>
                        <CardTitle>{investment.projectName}</CardTitle>
                      </CardHeader>
                    </Link>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Investment Amount:{" "}
                        {formatCurrency(investment.investedAmount)}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <p className="text-sm font-bold text-green-600">
                          Return Rate: {investment.interestRate.toString()}%
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Link href={`/projects/${investment.agroFundAddress}`}>
                        <Button>Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  </BlurFade>
                ))
              ) : (
                <BlurFade delay={0.8}>
                <p>You dont have any investments.</p>
                </BlurFade>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}