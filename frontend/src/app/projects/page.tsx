"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Leaf, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getContract } from "thirdweb";
import { client } from "../client";
import { baseSepolia, base } from "thirdweb/chains";
import { AGRO_FACTORY } from "../constants";
import { useReadContract } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import {
  resolveL2Name,
  BASENAME_RESOLVER_ADDRESS,
} from "thirdweb/extensions/ens";
import { useState, useEffect } from 'react';
import BlurFade from "@/components/ui/blur-fade";

export default function ProjectsPage() {
  const [resolvedNames, setResolvedNames] = useState<{[key: string]: string}>({});
  const [filter, setFilter] = useState<'all' | 'completed' | 'ongoing'>('ongoing');

  const convertToDays = (timestamp: any) => {
    const now = Date.now();
    const diffInMilliseconds = Number(timestamp) * 1000 - now;
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: AGRO_FACTORY,
  });

  const { data: projects, isLoading } = useReadContract({
    contract,
    method: "function getAllProjects() view returns ((string projectName, string description, uint256 loanAmount, uint256 interestRate, uint256 repaymentDeadline, address agroFundAddress, address owner, bool isLoanWithdrawn, bool isRepaymentWithdrawn)[])",
    params: [],
  });

  const formatCurrency = (amount: bigint) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR' }).format(Number(amount) / 1e18)
  }

  useEffect(() => {
    const resolveNames = async () => {
      if (projects) {
        const names: {[key: string]: string} = {};
        for (const project of projects) {
          try {
            const name = await resolveL2Name({
              client: client,
              address: project.owner,
              resolverAddress: BASENAME_RESOLVER_ADDRESS,
              resolverChain: base,
            });
            names[project.owner] = name || shortenAddress(project.owner);
          } catch (error) {
            console.error("Error resolving name:", error);
            names[project.owner] = shortenAddress(project.owner);
          }
        }
        setResolvedNames(names);
      }
    };

    resolveNames();
  }, [projects]);

  const completedProjects = projects?.filter(project => project.isLoanWithdrawn && project.isRepaymentWithdrawn) || [];
  const ongoingProjects = projects?.filter(project => !project.isLoanWithdrawn || !project.isRepaymentWithdrawn) || [];

  const filteredProjects = filter === 'all' ? projects : (filter === 'completed' ? completedProjects : ongoingProjects);

  return (
    <div className="flex flex-col min-h-screen max-w-6xl mx-auto mt-3">
      <main className="flex-1 py-3">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-2xl font-bold tracking-tighter mb-8">
            Project List
          </h1>
          <div className="mb-4">
            <Button 
              onClick={() => setFilter('all')} 
              variant={filter === 'all' ? 'default' : 'outline'}
              className="mr-2"
            >
              All 
            </Button>
            <Button 
              onClick={() => setFilter('completed')} 
              variant={filter === 'completed' ? 'default' : 'outline'}
              className="mr-2"
            >
              Completed 
            </Button>
            <Button 
              onClick={() => setFilter('ongoing')} 
              variant={filter === 'ongoing' ? 'default' : 'outline'}
            >
              Ongoing 
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {!isLoading &&
              filteredProjects &&
              (filteredProjects.length > 0 ? (
                filteredProjects.map((project, i: number) =>  (
                  <BlurFade key={project.agroFundAddress} delay={0.1 + i * 0.05}>
                    <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-b from-green-100 to-green-200 h-[96px] text-gray-600">
                        <CardTitle>{project.projectName}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600 mb-2">
                          Owner: {resolvedNames[project.owner] || shortenAddress(project.owner)}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Descriptions : {project.description}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Target Funding: {formatCurrency(project?.loanAmount || BigInt(0))}
                        </p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <p className="text-sm font-bold text-green-600">
                            Return: {project.interestRate.toString()}%
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Status: {project.isLoanWithdrawn && project.isRepaymentWithdrawn ? 'Completed' : 'Ongoing'}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/projects/${project.agroFundAddress}`}>
                          <Button className="w-full">
                            <Leaf className="h-4 w-4 mr-2" />
                            Project Details
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </BlurFade>
                ))
              ) : (
                <p>No Projects Available.</p>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}