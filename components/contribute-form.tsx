"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { submitDensityReport } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"

interface ContributeFormProps {
  locationId: string
}

export default function ContributeForm({ locationId }: ContributeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (densityLevel: "low" | "medium" | "high") => {
    setIsSubmitting(true)

    try {
      await submitDensityReport(locationId, densityLevel)
      toast({
        title: "Teşekkürler!",
        description: "Katkınız başarıyla kaydedildi.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Katkınız kaydedilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <p className="font-medium mb-3">Şu anki doluluk durumu nedir?</p>
      <div className="grid grid-cols-3 gap-2">
        <Card
          className="p-3 cursor-pointer hover:bg-green-50 border-green-200 transition-colors"
          onClick={() => !isSubmitting && handleSubmit("low")}
        >
          <div className="flex flex-col items-center">
            <div className="h-4 w-4 bg-green-500 rounded-full mb-2" />
            <span className="text-sm font-medium">Boş</span>
            <span className="text-xs text-gray-500">%0-40</span>
          </div>
        </Card>

        <Card
          className="p-3 cursor-pointer hover:bg-yellow-50 border-yellow-200 transition-colors"
          onClick={() => !isSubmitting && handleSubmit("medium")}
        >
          <div className="flex flex-col items-center">
            <div className="h-4 w-4 bg-yellow-500 rounded-full mb-2" />
            <span className="text-sm font-medium">Orta</span>
            <span className="text-xs text-gray-500">%40-70</span>
          </div>
        </Card>

        <Card
          className="p-3 cursor-pointer hover:bg-red-50 border-red-200 transition-colors"
          onClick={() => !isSubmitting && handleSubmit("high")}
        >
          <div className="flex flex-col items-center">
            <div className="h-4 w-4 bg-red-500 rounded-full mb-2" />
            <span className="text-sm font-medium">Kalabalık</span>
            <span className="text-xs text-gray-500">%70+</span>
          </div>
        </Card>
      </div>

      {isSubmitting && (
        <Button disabled className="w-full mt-4">
          Gönderiliyor...
        </Button>
      )}
    </div>
  )
}
