'use client'
import React from 'react'
import Link from 'next/link'
export const Footer = () => {
  return (
    <footer className="flex flex-col gap-2 mx-auto max-w-6xl sm:flex-row py-6  shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-600">© 2024 AgroFund. Semua hak dilindungi.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Syarat & Ketentuan
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Kebijakan Privasi
          </Link>
        </nav>
      </footer>
  )
}
