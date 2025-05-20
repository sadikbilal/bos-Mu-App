import Link from "next/link"
import { ArrowRight, QrCode, Clock, Users, BookOpen, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import LocationCard from "@/components/location-card"
import { getLocations } from "@/lib/data"
import HeroSection from "@/components/hero-section"
import FeatureCard from "@/components/feature-card"

export default async function Home() {
  const locations = await getLocations()

  return (
    <main>
      <HeroSection />

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Nasıl Çalışır?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            BoşMu? sistemi, kampüsteki ortak alanların doluluk durumunu gerçek zamanlı olarak takip etmenizi sağlar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<QrCode className="h-10 w-10 text-primary-600" />}
            title="QR Kod ile Giriş/Çıkış"
            description="Masalardaki QR kodları okutarak yerinizi ayırtın ve çıkış yaparken tekrar okutun."
          />
          <FeatureCard
            icon={<Clock className="h-10 w-10 text-secondary-500" />}
            title="Mola Sistemi"
            description="Yemek molası için 1.5 saat, normal mola için 20 dakika süreniz var."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-accent-500" />}
            title="Gerçek Zamanlı Doluluk"
            description="Hangi alanların dolu, hangi alanların boş olduğunu anında görün."
          />
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl my-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold gradient-text">Popüler Alanlar</h2>
          <Link href="/locations" className="flex items-center text-primary-600 hover:text-primary-700">
            Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.slice(0, 6).map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 gradient-text">Hemen Başlayın</h2>
            <p className="text-lg text-gray-600 mb-6">
              Öğrenci numaranız ile kayıt olun, QR kodları tarayın ve kampüs alanlarını daha verimli kullanın.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gradient-bg">
                <Link href="/register">Kayıt Ol</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/scan">QR Kod Tara</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-100 p-6 rounded-xl flex flex-col items-center text-center animate-float">
              <BookOpen className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Kütüphaneler</h3>
              <p className="text-gray-600">Sessiz çalışma alanları ve grup çalışma odaları</p>
            </div>
            <div
              className="bg-secondary-100 p-6 rounded-xl flex flex-col items-center text-center animate-float"
              style={{ animationDelay: "1s" }}
            >
              <Utensils className="h-12 w-12 text-secondary-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Yemekhaneler</h3>
              <p className="text-gray-600">Yemek saatlerinde yoğunluğu takip edin</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
