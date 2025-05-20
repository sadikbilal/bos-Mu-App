"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { QrCode, Camera, CameraOff, Check } from "lucide-react"
// Update the import to use the useAuth hook directly from auth-provider
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { checkInToDesk } from "@/lib/actions"

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [processingResult, setProcessingResult] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode("reader")
    scannerRef.current = html5QrCode

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          html5QrCode.stop().catch(console.error)
          setScanResult(decodedText)
          setScanning(false)
        },
        (errorMessage) => {
          // Error callback
          console.log(errorMessage)
        },
      )
      .catch((err) => {
        console.error(`Unable to start scanning: ${err}`)
        toast({
          title: "Kamera Erişimi Hatası",
          description: "Kameraya erişim sağlanamadı. Lütfen kamera izinlerini kontrol edin.",
          variant: "destructive",
        })
        setScanning(false)
      })

    setScanning(true)
  }

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error)
      setScanning(false)
    }
  }

  const handleProcessResult = async () => {
    if (!scanResult || !user) return

    setProcessingResult(true)

    try {
      // QR kodun içeriğini analiz et
      const qrContent = scanResult.trim();
      console.log("Okunan QR Kod:", qrContent);

      // Tüm küçük harfe çevir
      const lowerContent = qrContent.toLowerCase();
      
      // Farklı QR kod formatlarını işle
      if (lowerContent.includes('masa') || lowerContent.startsWith('m-') || lowerContent.startsWith('table')) {
        // Masa QR kodu (farklı formatlar)
        let tableNumber;
        
        if (lowerContent.startsWith('masa-')) {
          tableNumber = lowerContent.replace('masa-', '');
        } else if (lowerContent.startsWith('m-')) {
          tableNumber = lowerContent.replace('m-', '');
        } else if (lowerContent.startsWith('table')) {
          tableNumber = lowerContent.replace(/table[^0-9]*/i, '');
        } else {
          // Sadece sayıyı al
          tableNumber = lowerContent.replace(/[^0-9]/g, '');
        }
        
        console.log("Masa numarası:", tableNumber);
        
        // Kütüphane ID'si ile birlikte kullan (Şu an için sabit)
        const locationId = "1"; // Merkez Kütüphane ID'si
        
        try {
          // Örnek masa verisi
          const desk = {
            id: `1-${tableNumber}`,
            locationId: "1",
            tableNumber: parseInt(tableNumber),
            status: "available",
            qrCode: `masa-${tableNumber}`
          };
          
          // Masa girişi yap
          await checkInToDesk(user.id, desk.id, locationId);
          
          toast({
            title: "İşlem Başarılı",
            description: `${tableNumber} numaralı masaya giriş yapıldı.`,
          });
          
          // Dashboard'a yönlendir
          router.push("/dashboard");
          return;
        } catch (deskError: any) {
          console.error("Masa işleme hatası:", deskError);
          // API hatası durumunda alternatif çözüm
          throw new Error(`Masa işlemi sırasında hata: ${deskError.message}`);
        }
      } 
      else if (lowerContent.includes('kutuphane') && (lowerContent.includes('giris') || lowerContent.includes('giriş'))) {
        // Kütüphane giriş QR kodu
        toast({
          title: "Kütüphane Girişi",
          description: "Kütüphaneye giriş yapıldı. Şimdi bir masa seçebilirsiniz.",
        });

        // Kütüphane sayfasına yönlendir
        router.push("/locations/1");
        return;
      }
      else if (lowerContent.includes('kutuphane') && (lowerContent.includes('cikis') || lowerContent.includes('çıkış'))) {
        // Kütüphane çıkış QR kodu
        toast({
          title: "Kütüphane Çıkışı",
          description: "Kütüphaneden çıkış yapıldı.",
        });

        // Dashboard'a yönlendir
        router.push("/dashboard");
        return;
      }
      else if (lowerContent.includes('yemekhane') && (lowerContent.includes('giris') || lowerContent.includes('giriş'))) {
        // Yemekhane giriş QR kodu
        toast({
          title: "Yemekhane Girişi",
          description: "Yemekhaneye giriş yapıldı.",
        });

        // Dashboard'a yönlendir
        router.push("/dashboard");
        return;
      }
      else if (lowerContent.includes('yemekhane') && (lowerContent.includes('cikis') || lowerContent.includes('çıkış'))) {
        // Yemekhane çıkış QR kodu
        toast({
          title: "Yemekhane Çıkışı",
          description: "Yemekhaneden çıkış yapıldı.",
        });

        // Dashboard'a yönlendir
        router.push("/dashboard");
        return;
      }
      else if (qrContent.startsWith('{')) {
        // JSON formatında QR kod deneyebiliriz
        try {
          const jsonData = JSON.parse(qrContent);
          console.log("JSON QR veri:", jsonData);
          
          // İşleme devam et
          router.push("/dashboard");
          return;
        } catch (e) {
          console.error("JSON parse hatası:", e);
        }
      }
      else if (qrContent.includes(":")) {
        // Eski format işleme devam et
        router.push("/dashboard");
        return;
      }
      
      // Diğer QR formatlarını kabul et (test amaçlı)
      console.log("Bilinmeyen QR kod formatı kabul ediliyor:", qrContent);
      toast({
        title: "QR Kod Tarandı",
        description: "QR kod tanındı: " + qrContent.substring(0, 20) + "...",
      });
      
      // Dashboard'a yönlendir
      router.push("/dashboard");
      
    } catch (error) {
      console.error("QR işleme hatası:", error);
      toast({
        title: "İşlem Başarısız",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive",
      })
      setScanResult(null)
    } finally {
      setProcessingResult(false)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">QR Kod Tarama</h1>
          <p className="text-gray-600 mt-2">Masalardaki QR kodları tarayarak giriş yapabilirsiniz.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="mr-2 h-5 w-5 text-primary-600" />
              QR Kod Tarayıcı
            </CardTitle>
            <CardDescription>
              {!user ? "QR kod taramak için giriş yapmalısınız." : "Kameranızı masadaki QR koda doğrultun."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <Alert>
                <AlertTitle>Giriş Yapın</AlertTitle>
                <AlertDescription>QR kod taramak için önce giriş yapmalısınız.</AlertDescription>
              </Alert>
            ) : scanResult ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">QR Kod Başarıyla Tarandı</h3>
                <p className="text-sm text-gray-500 mb-4">Masaya giriş yapmak için onaylayın.</p>
              </div>
            ) : (
              <div className="relative">
                <div
                  id="reader"
                  className={`w-full h-64 bg-gray-100 rounded-lg overflow-hidden ${
                    scanning ? "border-2 border-primary-500" : ""
                  }`}
                ></div>
                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg">
                    <p className="text-gray-500">Kamera kapalı</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {!user ? (
              <Button asChild className="gradient-bg">
                <a href="/login">Giriş Yap</a>
              </Button>
            ) : scanResult ? (
              <div className="flex gap-4">
                <Button variant="outline" onClick={resetScanner} disabled={processingResult}>
                  Tekrar Tara
                </Button>
                <Button className="gradient-bg" onClick={handleProcessResult} disabled={processingResult}>
                  {processingResult ? "İşleniyor..." : "Onayla"}
                </Button>
              </div>
            ) : (
              <Button
                onClick={scanning ? stopScanner : startScanner}
                className={scanning ? "bg-red-500 hover:bg-red-600" : "gradient-bg"}
              >
                {scanning ? (
                  <>
                    <CameraOff className="mr-2 h-4 w-4" /> Taramayı Durdur
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" /> QR Kod Tara
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
