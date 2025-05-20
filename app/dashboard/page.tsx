"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, LogOut, Coffee, Utensils, History, QrCode } from "lucide-react"
// Update the import to use the useAuth hook directly from auth-provider
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { getUserCheckIns, startBreak, endBreak, checkOut } from "@/lib/actions"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeCheckIn, setActiveCheckIn] = useState<any>(null)
  const [checkInHistory, setCheckInHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [breakTimeLeft, setBreakTimeLeft] = useState<number | null>(null)
  const [breakInterval, setBreakIntervalState] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const data = await getUserCheckIns(user.id)
        setActiveCheckIn(data.activeCheckIn)
        setCheckInHistory(data.history)

        // If there's an active break, start the timer
        if (data.activeCheckIn?.breakStartTime && !data.activeCheckIn?.breakEndTime) {
          const breakType = data.activeCheckIn.breakType
          const maxBreakTime = breakType === "lunch" ? 90 * 60 * 1000 : 20 * 60 * 1000 // 90 or 20 minutes in ms
          const breakStartTime = new Date(data.activeCheckIn.breakStartTime).getTime()
          const now = Date.now()
          const elapsedTime = now - breakStartTime
          const timeLeft = Math.max(0, maxBreakTime - elapsedTime)

          setBreakTimeLeft(timeLeft)
          startBreakTimer(timeLeft)
        }
      } catch (error) {
        console.error("Error fetching check-ins:", error)
        toast({
          title: "Veri Yükleme Hatası",
          description: "Oturum bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      if (breakInterval) {
        clearInterval(breakInterval)
      }
    }
  }, [user])

  const startBreakTimer = (initialTimeLeft: number) => {
    if (breakInterval) {
      clearInterval(breakInterval)
    }

    const interval = setInterval(() => {
      setBreakTimeLeft((prev) => {
        if (!prev || prev <= 1000) {
          clearInterval(interval)
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    setBreakIntervalState(interval)
  }

  const handleStartBreak = async (breakType: "lunch" | "regular") => {
    if (!user || !activeCheckIn) return

    try {
      const result = await startBreak(user.id, activeCheckIn.id, breakType)
      setActiveCheckIn(result)

      const maxBreakTime = breakType === "lunch" ? 90 * 60 * 1000 : 20 * 60 * 1000
      setBreakTimeLeft(maxBreakTime)
      startBreakTimer(maxBreakTime)

      toast({
        title: "Mola Başlatıldı",
        description: breakType === "lunch" ? "Yemek molası (1.5 saat)" : "Normal mola (20 dakika)",
      })
    } catch (error) {
      toast({
        title: "Mola Başlatılamadı",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleEndBreak = async () => {
    if (!user || !activeCheckIn) return

    try {
      const result = await endBreak(user.id, activeCheckIn.id)
      setActiveCheckIn(result)

      if (breakInterval) {
        clearInterval(breakInterval)
        setBreakIntervalState(null)
      }
      setBreakTimeLeft(null)

      toast({
        title: "Mola Sona Erdi",
        description: "Çalışmaya devam edebilirsiniz.",
      })
    } catch (error) {
      toast({
        title: "Mola Sonlandırılamadı",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleCheckOut = async () => {
    if (!user || !activeCheckIn) return

    try {
      await checkOut(user.id, activeCheckIn.id)

      if (breakInterval) {
        clearInterval(breakInterval)
        setBreakIntervalState(null)
      }

      setActiveCheckIn(null)
      setBreakTimeLeft(null)

      // Refresh the history
      const data = await getUserCheckIns(user.id)
      setCheckInHistory(data.history)

      toast({
        title: "Çıkış Yapıldı",
        description: "Masadan başarıyla çıkış yaptınız.",
      })
    } catch (error) {
      toast({
        title: "Çıkış Yapılamadı",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const formatBreakTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getBreakProgress = () => {
    if (!breakTimeLeft || !activeCheckIn) return 0

    const maxBreakTime = activeCheckIn.breakType === "lunch" ? 90 * 60 * 1000 : 20 * 60 * 1000
    return 100 - (breakTimeLeft / maxBreakTime) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Hoş Geldin, {user?.fullName.split(" ")[0]}</h1>
        <p className="text-gray-600 mb-8">Kampüs alanlarını kullanım durumunu buradan takip edebilirsin.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Öğrenci Numarası</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{user?.studentNumber}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Aktif Oturum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeCheckIn ? "Var" : "Yok"}</p>
              {activeCheckIn && (
                <Badge variant="outline" className="mt-1">
                  {activeCheckIn.locationName}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Hızlı Erişim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/scan">
                    <QrCode className="h-4 w-4 mr-1" /> QR Tara
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/locations">Alanlar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Aktif Oturum</TabsTrigger>
            <TabsTrigger value="history">Geçmiş</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeCheckIn ? (
              <Card>
                <CardHeader>
                  <CardTitle>Aktif Oturum Bilgileri</CardTitle>
                  <CardDescription>
                    {activeCheckIn.locationName}, Masa #{activeCheckIn.deskId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Giriş Zamanı</p>
                        <p className="font-medium">{new Date(activeCheckIn.checkInTime).toLocaleString("tr-TR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Süre</p>
                        <p className="font-medium">
                          {formatDistanceToNow(new Date(activeCheckIn.checkInTime), { locale: tr, addSuffix: false })}
                        </p>
                      </div>
                    </div>

                    {activeCheckIn.breakStartTime && !activeCheckIn.breakEndTime ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                            <h3 className="font-medium">
                              {activeCheckIn.breakType === "lunch" ? "Yemek Molası" : "Normal Mola"}
                            </h3>
                          </div>
                          <Badge variant={activeCheckIn.breakType === "lunch" ? "secondary" : "outline"}>
                            {activeCheckIn.breakType === "lunch" ? "1.5 Saat" : "20 Dakika"}
                          </Badge>
                        </div>

                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Kalan Süre</span>
                            <span>{breakTimeLeft ? formatBreakTime(breakTimeLeft) : "00:00"}</span>
                          </div>
                          <Progress value={getBreakProgress()} className="h-2" />
                        </div>

                        <Button onClick={handleEndBreak} size="sm" className="w-full">
                          Molayı Bitir
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => handleStartBreak("regular")} variant="outline" className="flex-1">
                          <Coffee className="h-4 w-4 mr-2" /> Normal Mola (20dk)
                        </Button>
                        <Button onClick={() => handleStartBreak("lunch")} variant="outline" className="flex-1">
                          <Utensils className="h-4 w-4 mr-2" /> Yemek Molası (1.5s)
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleCheckOut} variant="destructive" className="w-full">
                    <LogOut className="h-4 w-4 mr-2" /> Çıkış Yap
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Aktif Oturum Yok</CardTitle>
                  <CardDescription>Şu anda herhangi bir masada oturum açmadınız.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="mb-4">Bir masada oturum açmak için QR kodu tarayın.</p>
                    <Button asChild className="gradient-bg">
                      <Link href="/scan">
                        <QrCode className="h-4 w-4 mr-2" /> QR Kod Tara
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Geçmiş Oturumlar</CardTitle>
                <CardDescription>Son kullandığınız masalar ve süreler</CardDescription>
              </CardHeader>
              <CardContent>
                {checkInHistory.length > 0 ? (
                  <div className="space-y-4">
                    {checkInHistory.map((checkIn) => (
                      <div key={checkIn.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{checkIn.locationName}</h3>
                            <p className="text-sm text-gray-500">Masa #{checkIn.deskId}</p>
                          </div>
                          <Badge variant="outline">
                            {formatDistanceToNow(new Date(checkIn.checkInTime), { locale: tr, addSuffix: false })}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-gray-500">Giriş:</p>
                            <p>{new Date(checkIn.checkInTime).toLocaleString("tr-TR")}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500">Çıkış:</p>
                            <p>{new Date(checkIn.checkOutTime).toLocaleString("tr-TR")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Henüz geçmiş oturum bulunmuyor.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
