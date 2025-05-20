import { getLocations } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContributeForm from "@/components/contribute-form"
import DensityIndicator from "@/components/density-indicator"

export default async function ContributePage() {
  const locations = await getLocations()
  const libraries = locations.filter((loc) => loc.type === "kütüphane")
  const cafeterias = locations.filter((loc) => loc.type === "yemekhane")

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Katkıda Bulun</h1>
      <p className="text-gray-600 mb-6">
        Bulunduğunuz alanın doluluk durumunu bildirerek diğer öğrencilere yardımcı olun.
      </p>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="libraries">Kütüphaneler</TabsTrigger>
          <TabsTrigger value="cafeterias">Yemekhaneler</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {locations.map((location) => (
              <Card key={location.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{location.name}</CardTitle>
                    <DensityIndicator densityLevel={location.currentDensity} showLabel />
                  </div>
                </CardHeader>
                <CardContent>
                  <ContributeForm locationId={location.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="libraries">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {libraries.map((location) => (
              <Card key={location.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{location.name}</CardTitle>
                    <DensityIndicator densityLevel={location.currentDensity} showLabel />
                  </div>
                </CardHeader>
                <CardContent>
                  <ContributeForm locationId={location.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cafeterias">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {cafeterias.map((location) => (
              <Card key={location.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{location.name}</CardTitle>
                    <DensityIndicator densityLevel={location.currentDensity} showLabel />
                  </div>
                </CardHeader>
                <CardContent>
                  <ContributeForm locationId={location.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
