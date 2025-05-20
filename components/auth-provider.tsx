"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth"
import { auth, signIn, createUser, signOutUser } from "@/lib/firebase"
import { getUserByStudentId, getUserById } from "@/lib/data"
import { createUserProfile } from "@/lib/actions"

export interface User {
  id: string
  studentNumber: string
  fullName: string
  email: string
  isActive: boolean
  createdAt: Date | null
  lastLogin: Date | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (studentId: string, password: string) => Promise<void>
  signOut: () => void
  register: (studentId: string, fullName: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Firebase Auth durumunu dinle
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Firestore'dan kullanıcı bilgilerini al (uid ile)
          const userDoc = await getUserById(firebaseUser.uid)
          
          if (userDoc) {
            // Firestore'dan alınan kullanıcı bilgilerini kullan
            setUser(userDoc)
          } else {
            // Kullanıcı profili bulunamadı, çıkış yap
            await signOutUser()
            setUser(null)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    // Korumalı rotalar için yönlendirme mantığı
    if (!loading) {
      const protectedRoutes = ["/dashboard", "/profile"]
      const authRoutes = ["/login", "/register"]

      if (protectedRoutes.some((route) => pathname?.startsWith(route)) && !user) {
        router.push("/login")
        toast({
          title: "Erişim Engellendi",
          description: "Bu sayfayı görüntülemek için giriş yapmalısınız.",
          variant: "destructive",
        })
      } else if (authRoutes.includes(pathname || "") && user) {
        router.push("/dashboard")
      }
    }
  }, [pathname, user, loading, router])

  const handleSignIn = async (studentId: string, password: string) => {
    try {
      setLoading(true)
      
      // Öğrenci numarası için kullanıcı bilgilerini al
      const userProfile = await getUserByStudentId(studentId)
      
      if (!userProfile) {
        throw new Error("Kullanıcı bulunamadı")
      }
      
      // Kullanıcının email'ini al ve Firebase ile giriş yap
      await signIn(userProfile.email, password)
      
      // Auth state listener kullanıcıyı otomatik olarak ayarlayacak
      
      router.push("/dashboard")
      toast({
        title: "Giriş Başarılı",
        description: "Hoş geldiniz!",
      })
    } catch (error) {
      console.error("Sign in error:", error)
      toast({
        title: "Giriş Başarısız",
        description: "Öğrenci numarası veya şifre hatalı.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleRegister = async (studentId: string, fullName: string, email: string, password: string) => {
    try {
      setLoading(true)
      
      // E-posta formatını oluştur
      const userEmail = email || `${studentId}@example.com` // E-posta sağlanmadıysa öğrenci numarasını kullan
      
      // Firebase ile kullanıcı oluştur
      const userCredential = await createUser(userEmail, password)
      const firebaseUser = userCredential.user
      
      // Firestore'da kullanıcı profili oluştur
      await createUserProfile(firebaseUser.uid, {
        studentNumber: studentId,
        email: userEmail,
        fullName: fullName,
        password: password
      })
      
      // Auth state listener kullanıcıyı otomatik olarak ayarlayacak
      
      router.push("/dashboard")
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu!",
      })
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Kayıt Başarısız",
        description: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      router.push("/")
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Çıkış Hatası",
        description: "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signIn: handleSignIn, 
        signOut: handleSignOut, 
        register: handleRegister 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
