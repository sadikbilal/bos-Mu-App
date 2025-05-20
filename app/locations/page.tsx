import { getLocations } from "@/lib/data"
import LocationCard from "@/components/location-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function LocationsPage() {
  const locations = await getLocations()
  const libraries = locations.filter((loc) => loc.type === "kütüphane")
  const cafeterias = locations.filter((loc) => loc.type === "yemekhane")

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tüm Alanlar</h1>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="libraries">Kütüphaneler</TabsTrigger>
          <TabsTrigger value="cafeterias">Yemekhaneler</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {locations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="libraries">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {libraries.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cafeterias">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {cafeterias.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
