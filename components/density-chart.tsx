"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { DensityLog } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"

interface DensityChartProps {
  logs: DensityLog[]
}

export default function DensityChart({ logs }: DensityChartProps) {
  const isMobile = useMobile()
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Transform logs into chart data
    const transformedData = logs.map((log) => {
      const date = new Date(log.timestamp)
      let densityValue = 0

      switch (log.densityLevel) {
        case "low":
          densityValue = 20 // Represent as 20% for visualization
          break
        case "medium":
          densityValue = 55 // Represent as 55% for visualization
          break
        case "high":
          densityValue = 85 // Represent as 85% for visualization
          break
      }

      return {
        time: date.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        doluluk: densityValue,
        source: log.source,
      }
    })

    setChartData(transformedData)
  }, [logs])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Bu zaman dilimi için veri bulunmamaktadır.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: isMobile ? 10 : 12 }} interval={isMobile ? 2 : 1} />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: isMobile ? 10 : 12 }} />
        <Tooltip formatter={(value: number) => [`${value}%`, "Doluluk"]} labelFormatter={(label) => `Saat: ${label}`} />
        <Legend />
        <Line type="monotone" dataKey="doluluk" stroke="#10b981" activeDot={{ r: 8 }} name="Doluluk Oranı" />
      </LineChart>
    </ResponsiveContainer>
  )
}
