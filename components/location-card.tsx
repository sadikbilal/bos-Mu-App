import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import DensityIndicator from "@/components/density-indicator"
import type { Location } from "@/lib/types"

interface LocationCardProps {
  location: Location
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="h-full flex flex-col border-none shadow-lg card-hover dark:bg-gray-800/50">
      <CardContent className="pt-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge
              variant={location.type === "kütüphane" ? "outline" : "secondary"}
              className={`mb-2 ${location.type === "kütüphane" ? "border-primary-500 text-primary-700 dark:border-primary-400 dark:text-primary-400" : ""}`}
            >
              {location.type === "kütüphane" ? "Kütüphane" : "Yemekhane"}
            </Badge>
            <h3 className="text-xl font-semibold">{location.name}</h3>
          </div>
          <DensityIndicator densityLevel={location.currentDensity} size="md" />
        </div>

        <p className="text-sm text-gray-500 mb-2">{location.floor ? `Kat: ${location.floor}` : ""}</p>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Son güncelleme:{" "}
            {(() => {
              try {
                const date = new Date(location.lastUpdated);
                return date.toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } catch (error) {
                return "Belirtilmemiş";
              }
            })()}
          </p>
          <Badge variant="outline" className="text-xs dark:border-gray-700">
            {location.availableSeats} / {location.totalSeats} Koltuk
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link
          href={`/locations/${location.id}`}
          className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium dark:text-primary-400 dark:hover:text-primary-300"
        >
          Detayları Gör <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}
