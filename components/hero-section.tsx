import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QrCode, ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 dark:bg-primary-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-200 dark:bg-secondary-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 right-1/4 w-72 h-72 bg-accent-200 dark:bg-accent-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-md mb-6">
            <QrCode className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <span className="text-sm font-medium">QR Kod ile Kolay Takip Sistemi</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Kampüs Alanlarını</span> Akıllıca Kullanın
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Kütüphane ve yemekhane doluluk durumlarını anlık takip edin, QR kod ile yer ayırtın, zaman kazanın.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gradient-bg">
              <Link href="/register">Hemen Başla</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="dark:border-gray-700 dark:bg-gray-800">
              <Link href="/locations" className="flex items-center">
                Alanları Keşfet <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
