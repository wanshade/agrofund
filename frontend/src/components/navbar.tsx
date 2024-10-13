'use client'

import { Leaf, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import ConnectWallet from "@/components/ui/connect"
import { useActiveAccount } from "thirdweb/react"

export function Navbar() {
    const account = useActiveAccount();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const NavLinks = () => (
        <>
            {account && (
                <Link href={`/dashboard/${account?.address}`}>
                    <p className="text-gray-700 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition">Dashboard</p>
                </Link>
            )}
            <Link href="/projects">
                <p className="text-gray-700 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition">Projects</p>
            </Link>
            <Link href="/faucet">
                <p className="text-gray-700 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition">Faucet</p>
            </Link>
            <Link href="/faq">
                <p className="text-gray-700 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition">Faq</p>
            </Link>
            <ConnectWallet />
        </>
    )

    return (
        <header className="z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">
                    <Link className="flex items-center" href="/">
                        <Leaf className="h-6 w-6 text-green-600" />
                        <span className="ml-2 text-2xl font-bold text-gray-900">AgroFund</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-4 sm:space-x-6">
                        <NavLinks />
                    </nav>
                    <button className="md:hidden" onClick={toggleMenu}>
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
                {isMenuOpen && (
                    <div className="md:hidden">
                        <nav className="flex flex-col items-center space-y-4 py-4">
                            <NavLinks />
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}