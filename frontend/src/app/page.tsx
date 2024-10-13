import { LandingPage } from "@/components/landing-page";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <LandingPage/>
        </div>
      </main>
    </div>
  );
}