"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Leaf, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BlurFade from "@/components/ui/blur-fade";

export default function FAQPage() {
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  const faqs = [
    {
      question: "What is AgroFund?",
      answer:
        "AgroFund is a decentralized finance (DeFi) platform that connects investors directly with farmers who need capital. It allows you to invest in agricultural projects and earn returns.",
    },
    {
      question: "How does AgroFund work?",
      answer:
        "AgroFund works in four simple steps: 1) Connect your wallet, 2) Choose agricultural projects to fund, 3) Make your investment, and 4) Receive returns.",
    },
    {
      question: "What blockchain does AgroFund use?",
      answer:
        "AgroFund is powered by Base, a secure and efficient Ethereum Layer 2 solution.",
    },
    {
      question: "How do I start investing?",
      answer:
        "To start investing, connect your wallet, browse available projects, choose one that interests you, and make your investment using IDRB tokens.",
    },
    {
      question: "What is IDRB?",
      answer:
        "IDRB is a mock token for testing purposes. Its the token used for investments and repayments on the AgroFund platform.",
    },
    {
      question: "How are returns calculated?",
      answer:
        "Returns are based on the interest rate set for each project. When a farmer repays the loan, investors receive their initial investment plus interest proportional to their investment amount.",
    },
    {
      question: "Is my investment secure?",
      answer:
        "AgroFund uses smart contracts to ensure transparency and security. However, as with any investment, there are risks involved. We recommend diversifying your investments and only investing what you can afford to lose.",
    },
    
    {
      question: "Can I withdraw my investment before the project ends?",
      answer:
        "No, investments are locked until the projects repayment deadline. You can only withdraw your investment (plus any returns) after the loan has been repaid by the farmer.",
    },
    {
      question: "How do I track my investments?",
      answer:
        "You can track your investments through the project details page. It shows the funding progress, loan status, and important dates for each project you have invested in.",
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <BlurFade delay={0.1}>
          <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
          </BlurFade>
          <BlurFade delay={0.2}>
          <h1 className="text-4xl font-bold mb-4 text-green-800">Frequently Asked Questions</h1>
          </BlurFade>
          <BlurFade delay={0.2}>
          <p className="text-xl text-gray-600">Find answers to common questions about AgroFund</p>
          </BlurFade>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <BlurFade key={index} delay={0.3 + index * 0.1}>
            <Card key={index} className="border-green-200 hover:shadow-lg transition-shadow duration-300">
              <button 
                className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-lg"
                onClick={() => toggleQuestion(index)}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-green-700">{faq.question}</h2>
                  {openQuestions.includes(index) ? (
                    <ChevronUp className="h-6 w-6 text-green-600 ml-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-green-600 ml-4 flex-shrink-0" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openQuestions.includes(index) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
            </BlurFade>
          ))}
        </div>
        <div className="mt-16 text-center bg-green-100 rounded-lg p-8 shadow-inner">
          <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-semibold mb-4 text-green-800">Still have questions?</h2>
          <p className="mb-6 text-gray-600 text-lg">If you couldn&apos;t find the answer to your question, our support team is here to help.</p>
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}