'use client'

import React, { useState } from 'react'
import { getContract, prepareContractCall, waitForReceipt } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

import { baseSepolia } from 'thirdweb/chains'
import { client } from '@/app/client'
import { AGRO_FACTORY } from '@/app/constants'
import { toWei } from "thirdweb/utils";

export default function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { mutateAsync: sendTransaction } = useSendTransaction()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    loanAmount: '',
    interestRate: '',
    repaymentDeadline: ''
  })

  const [errors, setErrors] = useState({
    projectName: '',
    description: '',
    loanAmount: '',
    interestRate: '',
    repaymentDeadline: ''
  })

  const contractFactory = getContract({
    client: client,
    chain: baseSepolia,
    address: AGRO_FACTORY,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    let error = ''
    switch (name) {
      case 'projectName':
        if (!value.trim()) error = 'Project name is required'
        break
      case 'description':
        if (!value.trim()) error = 'Description is required'
        break
      case 'loanAmount':
        if (!value) error = 'Loan amount is required'
        else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) error = 'Please enter a valid positive number'
        break
      case 'interestRate':
        if (!value) error = 'Interest rate is required'
        else if (isNaN(parseFloat(value)) || parseFloat(value) < 0 || parseFloat(value) > 100) error = 'Please enter a valid percentage between 0 and 100'
        break
      case 'repaymentDeadline':
        if (!value) error = 'Repayment deadline is required'
        else if (new Date(value) <= new Date()) error = 'Deadline must be in the future'
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const isFormValid = () => {
    return Object.values(errors).every(error => !error) && Object.values(formData).every(value => value.trim() !== '')
  }

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const loanAmountInWei = toWei(formData.loanAmount)
    const repaymentTimestamp = Math.floor(new Date(formData.repaymentDeadline).getTime() / 1000)

    try {
      const transaction = prepareContractCall({
        contract: contractFactory,
        method: "function createAgroFund(string projectName, string description, uint256 loanAmount, uint256 interestRate, uint256 repaymentDeadline) returns (address)",
        params: [
          formData.projectName,
          formData.description,
          loanAmountInWei,
          BigInt(formData.interestRate),
          BigInt(repaymentTimestamp)
        ]
      })
      
      const result = await sendTransaction(transaction)
      
      const receipt = await waitForReceipt({
        client,
        chain: baseSepolia,
        transactionHash: result.transactionHash,
      })
      
      toast({
        title: "Project Created",
        description: "Your project has been successfully created!",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Transaction failed:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Project</Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-2xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectName" className="text-right">
              Project Name
            </Label>
            <div className="col-span-3">
              <Input
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="Enter project name"
                className={errors.projectName ? "border-red-500" : ""}
              />
              {errors.projectName && <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <div className="col-span-3">
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter project description"
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loanAmount" className="text-right">
              Loan Amount
            </Label>
            <div className="col-span-3">
              <Input
                id="loanAmount"
                name="loanAmount"
                type="number"
                value={formData.loanAmount}
                onChange={handleInputChange}
                placeholder="Enter loan amount ex 1000000"
                className={errors.loanAmount ? "border-red-500" : ""}
              />
              {errors.loanAmount && <p className="text-red-500 text-sm mt-1">{errors.loanAmount}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interestRate" className="text-right">
              Interest Rate
            </Label>
            <div className="col-span-3">
              <Input
                id="interestRate"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={handleInputChange}
                placeholder="Enter interest rate ex 1 or 2"
                className={errors.interestRate ? "border-red-500" : ""}
              />
              {errors.interestRate && <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="repaymentDeadline" className="text-right">
              Repayment Deadline
            </Label>
            <div className="col-span-3">
              <Input
                id="repaymentDeadline"
                name="repaymentDeadline"
                type="date"
                value={formData.repaymentDeadline}
                onChange={handleInputChange}
                className={errors.repaymentDeadline ? "border-red-500" : ""}
              />
              {errors.repaymentDeadline && <p className="text-red-500 text-sm mt-1">{errors.repaymentDeadline}</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading || !isFormValid()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}