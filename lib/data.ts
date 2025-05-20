import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from "firebase/firestore"
import { db } from "./firebase"
import type { Location, DensityLog, Desk, CheckIn, User } from "./types"
import { cache } from "react"

// Firestore koleksiyon referansları
const locationsRef = collection(db, "locations")
const logsRef = collection(db, "logs")
const desksRef = collection(db, "desks")
const checkInsRef = collection(db, "checkIns")
const usersRef = collection(db, "users")

// Tüm lokasyonları getir
export const getLocations = cache(async (): Promise<Location[]> => {
  try {
    const snapshot = await getDocs(locationsRef)
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Tarihlerin doğru şekilde dönüştürülmesini sağla
      let lastUpdated = data.lastUpdated;
      if (lastUpdated && typeof lastUpdated === 'object' && 'toDate' in lastUpdated) {
        try {
          lastUpdated = lastUpdated.toDate().toISOString();
        } catch (e) {
          lastUpdated = new Date().toISOString(); // Hata durumunda şimdiki zamanı kullan
        }
      } else if (typeof lastUpdated === 'string') {
        try {
          // String'i geçerli bir tarih olarak doğrula
          new Date(lastUpdated).toISOString();
        } catch (e) {
          lastUpdated = new Date().toISOString(); // Geçersiz string ise şimdiki zamanı kullan
        }
      } else {
        lastUpdated = new Date().toISOString(); // Değer yoksa şimdiki zamanı kullan
      }
      
      return {
        id: doc.id,
        ...data,
        lastUpdated
      };
    }) as Location[]
  } catch (error) {
    console.error("Error fetching locations:", error)
    // Manuel veri dön
    return [
      {
        id: "1",
        name: "Merkez Kütüphane",
        type: "kütüphane",
        currentDensity: "medium",
        lastUpdated: new Date().toISOString(),
        totalSeats: 10,
        availableSeats: 7,
        entranceQrCode: "kutuphane-giris",
        exitQrCode: "kutuphane-cikis"
      },
      {
        id: "2",
        name: "Merkez Yemekhane",
        type: "yemekhane",
        currentDensity: "medium",
        lastUpdated: new Date().toISOString(),
        totalSeats: 200,
        availableSeats: 120,
        entranceQrCode: "yemekhane-giris",
        exitQrCode: "yemekhane-cikis"
      }
    ] as Location[]
  }
})

// ID'ye göre lokasyon getir
export const getLocationById = cache(async (id: string): Promise<Location | null> => {
  try {
    const docRef = doc(locationsRef, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Location
    }
    return null
  } catch (error) {
    console.error("Error fetching location:", error)
    return null
  }
})

// Lokasyon için logları getir
export const getLocationLogs = cache(async (locationId: string): Promise<DensityLog[]> => {
  try {
    const q = query(
      logsRef, 
      where("locationId", "==", locationId),
      orderBy("timestamp", "desc"),
      limit(100)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString()
    } as DensityLog))
  } catch (error) {
    console.error("Error fetching logs:", error)
    return []
  }
})

// Lokasyon için masaları getir
export const getDesksByLocation = cache(async (locationId: string): Promise<Desk[]> => {
  try {
    const q = query(desksRef, where("locationId", "==", locationId))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastUpdated: doc.data().lastUpdated.toDate().toISOString()
    } as Desk))
  } catch (error) {
    console.error("Error fetching desks:", error)
    return []
  }
})

// ID'ye göre masa getir
export const getDeskById = cache(async (deskId: string): Promise<Desk | null> => {
  try {
    const docRef = doc(desksRef, deskId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return { 
        id: docSnap.id, 
        ...data,
        lastUpdated: data.lastUpdated.toDate().toISOString()
      } as Desk
    }
    return null
  } catch (error) {
    console.error("Error fetching desk:", error)
    return null
  }
})

// Kullanıcı için check-in'leri getir
export const getCheckInsByUser = cache(async (userId: string): Promise<CheckIn[]> => {
  try {
    const q = query(
      checkInsRef, 
      where("userId", "==", userId),
      orderBy("checkInTime", "desc")
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        checkInTime: data.checkInTime.toDate().toISOString(),
        checkOutTime: data.checkOutTime ? data.checkOutTime.toDate().toISOString() : undefined,
        breakStartTime: data.breakStartTime ? data.breakStartTime.toDate().toISOString() : undefined,
        breakEndTime: data.breakEndTime ? data.breakEndTime.toDate().toISOString() : undefined
      } as CheckIn
    })
  } catch (error) {
    console.error("Error fetching check-ins:", error)
    return []
  }
})

// Kullanıcı için aktif check-in getir
export const getActiveCheckIn = cache(async (userId: string): Promise<CheckIn | null> => {
  try {
    const q = query(
      checkInsRef, 
      where("userId", "==", userId),
      where("status", "==", "active"),
      limit(1)
    )
    
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    const data = doc.data()
    
    return {
      id: doc.id,
      ...data,
      checkInTime: data.checkInTime.toDate().toISOString(),
      checkOutTime: data.checkOutTime ? data.checkOutTime.toDate().toISOString() : undefined,
      breakStartTime: data.breakStartTime ? data.breakStartTime.toDate().toISOString() : undefined,
      breakEndTime: data.breakEndTime ? data.breakEndTime.toDate().toISOString() : undefined
    } as CheckIn
  } catch (error) {
    console.error("Error fetching active check-in:", error)
    return null
  }
})

// ID'ye göre kullanıcı getir
export const getUserById = cache(async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(usersRef, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User
    }
    return null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
})

// Öğrenci numarasına göre kullanıcı getir
export async function getUserByStudentId(studentId: string): Promise<User | null> {
  try {
    console.log("getUserByStudentId çağrıldı:", studentId);
    const q = query(usersRef, where("studentNumber", "==", studentId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("Kullanıcı bulunamadı");
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    console.log("Kullanıcı verileri:", data);
    
    return {
      id: doc.id,
      studentNumber: data.studentNumber || '',
      fullName: data.fullName || '',
      email: data.email || '',
      isActive: data.isActive || false,
      createdAt: data.createdAt,
      lastLogin: data.lastLogin
    };
  } catch (error) {
    console.error("Öğrenci ID ile kullanıcı getirme hatası:", error);
    return null;
  }
}
