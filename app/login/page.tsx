"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, LogIn } from "lucide-react"

export default function LoginPage() {
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const { signIn, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn(studentId, password)
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
            <QrCode className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">BoşMu?</h1>
          <p className="text-gray-600 mt-2">Kampüs alanlarını akıllıca kullanın</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>Öğrenci numaranız ve şifreniz ile giriş yapın.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Öğrenci Numarası</Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Örn: 2023123456"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full gradient-bg" disabled={loading}>
                {loading ? (
                  "Giriş Yapılıyor..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Giriş Yap
                  </>
                )}
              </Button>
              <div className="text-center text-sm">
                Hesabınız yok mu?{" "}
                <Link href="/register" className="text-primary-600 hover:underline">
                  Kayıt Ol
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
