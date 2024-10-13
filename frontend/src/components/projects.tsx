'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, TrendingUp } from "lucide-react"
import Link from "next/link"


export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: "Peningkatan Produksi Padi",
      farmer: "Pak Budi",
      location: "Cianjur, Jawa Barat",
      targetFunding: 50000000,
      currentFunding: 30000000,
      duration: 6,
      expectedReturn: 15,
    },
    {
      id: 2,
      title: "Ekspansi Kebun Jagung",
      farmer: "Ibu Siti",
      location: "Malang, Jawa Timur",
      targetFunding: 75000000,
      currentFunding: 45000000,
      duration: 4,
      expectedReturn: 12,
    },
    {
      id: 3,
      title: "Modernisasi Peternakan",
      farmer: "Pak Dedi",
      location: "Bogor, Jawa Barat",
      targetFunding: 100000000,
      currentFunding: 80000000,
      duration: 8,
      expectedReturn: 18,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none mb-8">
            Proyek Tersedia
          </h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">Petani: {project.farmer}</p>
                  <p className="text-sm text-gray-600 mb-2">Lokasi: {project.location}</p>
                  <p className="text-sm text-gray-600 mb-2">Target Pendanaan: Rp {project.targetFunding.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mb-2">Terkumpul: Rp {project.currentFunding.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mb-2">Durasi: {project.duration} bulan</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <p className="text-sm font-bold text-green-600">Return: {project.expectedReturn}%</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Investasi Sekarang</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
    </div>
  )
}