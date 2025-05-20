import Link from "next/link"
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react"
import { getLocationById, getLocationLogs } from "@/lib/data"
import DensityIndicator from "@/components/density-indicator"
import DensityChart from "@/components/density-chart"
import ContributeForm from "@/components/contribute-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LocationDetailPageProps {
  params: {
    id: string
  }
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const location = await getLocationById(params.id)
  const logs = await getLocationLogs(params.id)

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Alan bulunamadı</h1>
        <Link href="/locations" className="text-emerald-600 hover:underline">
          Tüm alanlara dön
        </Link>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/locations" className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Tüm Alanlara Dön
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={location.type === "kütüphane" ? "outline" : "secondary"}>
              {location.type === "kütüphane" ? "Kütüphane" : "Yemekhane"}
            </Badge>
            <DensityIndicator densityLevel={location.currentDensity} showLabel size="sm" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{location.name}</h1>
          <div className="flex items-center text-gray-500 mb-1">
            {location.floor && (
              <div className="flex items-center mr-4">
                <MapPin className="h-4 w-4 mr-1" /> Kat: {location.floor}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" /> Son güncelleme:{" "}
              {new Date(location.lastUpdated).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg flex items-center">
          <div className="mr-3">
            <DensityIndicator densityLevel={location.currentDensity} size="lg" />
          </div>
          <div>
            <p className="font-medium">Şu anki doluluk</p>
            <p className="text-2xl font-bold">
              {location.currentDensity === "low" && "Boş (%0-40)"}
              {location.currentDensity === "medium" && "Orta (%40-70)"}
              {location.currentDensity === "high" && "Kalabalık (%70+)"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Doluluk Geçmişi</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today">
              <TabsList>
                <TabsTrigger value="today">Bugün</TabsTrigger>
                <TabsTrigger value="week">Bu Hafta</TabsTrigger>
              </TabsList>
              <TabsContent value="today" className="h-[300px]">
                <DensityChart
                  logs={logs.filter((log) => {
                    const today = new Date()
                    const logDate = new Date(log.timestamp)
                    return (
                      logDate.getDate() === today.getDate() &&
                      logDate.getMonth() === today.getMonth() &&
                      logDate.getFullYear() === today.getFullYear()
                    )
                  })}
                />
              </TabsContent>
              <TabsContent value="week" className="h-[300px]">
                <DensityChart logs={logs} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Katkıda Bulun</CardTitle>
            <Users className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Şu anki doluluk durumunu bildirerek diğer öğrencilere yardımcı olun.
            </p>
            <ContributeForm locationId={location.id} />
          </CardContent>
        </Card>
      </div>

      {location.type === "kütüphane" && location.floors && (
        <Card>
          <CardHeader>
            <CardTitle>Kat Bazlı Doluluk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {location.floors.map((floor) => (
                <div key={floor.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{floor.name}</h3>
                    <DensityIndicator densityLevel={floor.densityLevel} showLabel />
                  </div>
                  <p className="text-sm text-gray-500">{floor.description || `${location.name} - ${floor.name}`}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
