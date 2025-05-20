import { cn } from "@/lib/utils"

type DensityLevel = "low" | "medium" | "high"

interface DensityIndicatorProps {
  densityLevel: DensityLevel
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export default function DensityIndicator({ densityLevel, size = "md", showLabel = false }: DensityIndicatorProps) {
  const getColor = () => {
    switch (densityLevel) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  const getLabel = () => {
    switch (densityLevel) {
      case "low":
        return "Boş"
      case "medium":
        return "Orta"
      case "high":
        return "Kalabalık"
      default:
        return "Bilinmiyor"
    }
  }

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-3 w-3"
      case "md":
        return "h-4 w-4"
      case "lg":
        return "h-6 w-6"
      default:
        return "h-4 w-4"
    }
  }

  return (
    <div className="flex items-center">
      <div className={cn("rounded-full", getColor(), getSizeClass())} />

      {showLabel && <span className="ml-2 text-sm font-medium">{getLabel()}</span>}
    </div>
  )
}
