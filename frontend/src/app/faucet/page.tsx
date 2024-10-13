"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Wallet } from "lucide-react";
import { getContract, prepareContractCall } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { client } from "../client";
import { TransactionButton } from "thirdweb/react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { CoolMode } from "@/components/ui/cool-mode";
import BlurFade from "@/components/ui/blur-fade";

export default function FaucetPage() {
  const [address, setAddress] = useState("");
  const { toast } = useToast();

  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: "0x93958e920fF5c68fd2a18042213Edc41a2C42b32",
  });

  const validateAddress = (addr: string) => {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleAddressChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setAddress(e.target.value);
  };

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <BlurFade delay={0.2}>
      <Card className="bg-white shadow-xl rounded-xl overflow-hidden w-full max-w-2xl">
        <CardHeader className="bg-gradient-to-b from-green-100 to-green-200">
          <div className="flex items-center space-x-2">
            <Wallet className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">IDRB Faucet</CardTitle>
          </div>
          
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2 max-w-xl">
            <p> You need IDRB tokens to use this DApp. </p>
            <p>Contract Address for IDRB token : 0x1d9F4aeb3ecF2De3a5B0f89333ce8157Cb62b4d7</p>
            <p>
              Before claim you need ETH Base Sepolia for gas, you can get some
              ETH base sepolia from{" "}
              <Link
                href="https://thirdweb.com/base-sepolia-testnet"
                className="underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                this faucet
              </Link>
            </p>
            
            <p>Enter your address to claim 10,000,000 IDRB tokens</p>
            <br />
              <Input
                placeholder="Enter your wallet address"
                value={address}
                onChange={handleAddressChange}
                className="font-mono"
              />
            </div>
            <CoolMode>
              
            
            <TransactionButton
              transaction={() =>
                prepareContractCall({
                  contract: contract,
                  method: "function claim(address _to)",
                  params: [address],
                })
              }
              onTransactionConfirmed={() => {
                toast({
                  title: "Claim Successful",
                  description: "You can now check your balance.",
                  duration: 5000,
                });
              }}
              onError={(error) => {
                let errorMessage = "An error occurred while claiming tokens.";
                if (error.message.includes("Please wait for cooldown")) {
                  errorMessage =
                    "You have already claimed tokens. Please wait 1 hour to claim again.";
                } else if (!validateAddress(address)) {
                  errorMessage = "Please enter a valid Ethereum address.";
                }
                toast({
                  title: "Claim Failed",
                  description: errorMessage,
                  duration: 5000,
                  variant: "destructive",
                });
              }}
              disabled={!validateAddress(address)}
            >
              Claim Tokens
            </TransactionButton>
            </CoolMode>
          </div>
        </CardContent>
      </Card>
      </BlurFade>
    </div>
  );
}
