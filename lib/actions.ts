"use server"

import { revalidatePath } from "next/cache"
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  increment, 
  serverTimestamp, 
  Timestamp,
  setDoc 
} from "firebase/firestore"
import { db } from "./firebase"
import type { DensityLevel, Location, Desk, CheckIn } from "./types"
import { getLocationById, getDeskById, getActiveCheckIn } from "./data"

// Firestore koleksiyon referansları
const locationsRef = collection(db, "locations")
const logsRef = collection(db, "logs")
const desksRef = collection(db, "desks")
const checkInsRef = collection(db, "checkIns")
const usersRef = collection(db, "users")

export async function submitDensityReport(locationId: string, densityLevel: DensityLevel) {
  try {
    // Lokasyon belgesini güncelle
    const locationRef = doc(locationsRef, locationId)
    await updateDoc(locationRef, {
      currentDensity: densityLevel,
      lastUpdated: serverTimestamp()
    })

    // Yeni log ekle
    await addDoc(logsRef, {
      locationId,
      densityLevel,
      timestamp: serverTimestamp(),
      source: "user"
    })

    // Yolları yeniden doğrula
    revalidatePath("/")
    revalidatePath("/locations")
    revalidatePath(`/locations/${locationId}`)
    revalidatePath("/contribute")

    return { success: true }
  } catch (error) {
    console.error("Error submitting density report:", error)
    throw new Error("Failed to submit density report")
  }
}

export async function checkInToDesk(userId: string, deskId: string, locationId: string) {
  try {
    // Kullanıcının aktif bir check-in'i var mı kontrol et
    const activeCheckIn = await getActiveCheckIn(userId)
    if (activeCheckIn) {
      throw new Error("Zaten aktif bir oturumunuz var. Lütfen önce çıkış yapın.")
    }

    // Masa mevcut mu ve müsait mi kontrol et
    const desk = await getDeskById(deskId)
    if (!desk) {
      throw new Error("Masa bulunamadı")
    }

    if (desk.status !== "available") {
      throw new Error("Bu masa şu anda müsait değil")
    }

    // Lokasyon adını al
    const location = await getLocationById(locationId)
    if (!location) {
      throw new Error("Konum bulunamadı")
    }

    // Masa durumunu güncelle
    const deskRef = doc(desksRef, deskId)
    await updateDoc(deskRef, {
      status: "occupied",
      lastUpdated: serverTimestamp()
    })

    // Yeni check-in oluştur
    const newCheckIn = await addDoc(checkInsRef, {
      userId,
      deskId,
      locationId,
      locationName: location.name,
      checkInTime: serverTimestamp(),
      status: "active"
    })

    // Lokasyon müsait koltuk sayısını güncelle
    const locationRef = doc(locationsRef, locationId)
    await updateDoc(locationRef, {
      availableSeats: increment(-1),
      lastUpdated: serverTimestamp()
    })

    // Yolları yeniden doğrula
    revalidatePath("/dashboard")
    revalidatePath("/locations")
    revalidatePath(`/locations/${locationId}`)

    // Check-in verilerini getir
    const checkInDoc = await getDoc(newCheckIn)
    const checkInData = checkInDoc.data()
    
    return {
      id: newCheckIn.id,
      ...checkInData,
      checkInTime: checkInData?.checkInTime.toDate().toISOString()
    }
  } catch (error) {
    console.error("Error checking in:", error)
    throw error
  }
}

export async function checkOut(userId: string, checkInId: string) {
  try {
    // Check-in belgesini al
    const checkInRef = doc(checkInsRef, checkInId)
    const checkInDoc = await getDoc(checkInRef)
    
    if (!checkInDoc.exists()) {
      throw new Error("Check-in not found")
    }
    
    const checkInData = checkInDoc.data()
    if (checkInData.userId !== userId) {
      throw new Error("Unauthorized")
    }
    
    if (checkInData.status !== "active") {
      throw new Error("This check-in is not active")
    }

    // Check-in'i güncelle
    await updateDoc(checkInRef, {
      checkOutTime: serverTimestamp(),
      status: "completed"
    })

    // Masa durumunu güncelle
    const deskRef = doc(desksRef, checkInData.deskId)
    await updateDoc(deskRef, {
      status: "available",
      lastUpdated: serverTimestamp()
    })

    // Lokasyon müsait koltuk sayısını güncelle
    const locationRef = doc(locationsRef, checkInData.locationId)
    await updateDoc(locationRef, {
      availableSeats: increment(1),
      lastUpdated: serverTimestamp()
    })

    // Yolları yeniden doğrula
    revalidatePath("/dashboard")
    revalidatePath("/locations")
    revalidatePath(`/locations/${checkInData.locationId}`)

    return { success: true }
  } catch (error) {
    console.error("Error checking out:", error)
    throw error
  }
}

export async function startBreak(userId: string, checkInId: string, breakType: "lunch" | "regular") {
  try {
    // Check-in belgesini al
    const checkInRef = doc(checkInsRef, checkInId)
    const checkInDoc = await getDoc(checkInRef)
    
    if (!checkInDoc.exists()) {
      throw new Error("Check-in not found")
    }
    
    const checkInData = checkInDoc.data()
    if (checkInData.userId !== userId) {
      throw new Error("Unauthorized")
    }
    
    if (checkInData.status !== "active") {
      throw new Error("This check-in is not active")
    }
    
    if (checkInData.breakStartTime && !checkInData.breakEndTime) {
      throw new Error("You already have an active break")
    }

    // Check-in'i güncelle
    await updateDoc(checkInRef, {
      breakStartTime: serverTimestamp(),
      breakType
    })

    // Yolları yeniden doğrula
    revalidatePath("/dashboard")

    // Güncellenmiş check-in'i getir
    const updatedCheckInDoc = await getDoc(checkInRef)
    const updatedData = updatedCheckInDoc.data()
    
    return {
      id: checkInId,
      ...updatedData,
      checkInTime: updatedData.checkInTime.toDate().toISOString(),
      breakStartTime: updatedData.breakStartTime.toDate().toISOString()
    }
  } catch (error) {
    console.error("Error starting break:", error)
    throw error
  }
}

export async function endBreak(userId: string, checkInId: string) {
  try {
    // Check-in belgesini al
    const checkInRef = doc(checkInsRef, checkInId)
    const checkInDoc = await getDoc(checkInRef)
    
    if (!checkInDoc.exists()) {
      throw new Error("Check-in not found")
    }
    
    const checkInData = checkInDoc.data()
    if (checkInData.userId !== userId) {
      throw new Error("Unauthorized")
    }
    
    if (checkInData.status !== "active") {
      throw new Error("This check-in is not active")
    }
    
    if (!checkInData.breakStartTime || checkInData.breakEndTime) {
      throw new Error("You don't have an active break")
    }

    // Check-in'i güncelle
    await updateDoc(checkInRef, {
      breakEndTime: serverTimestamp()
    })

    // Yolları yeniden doğrula
    revalidatePath("/dashboard")

    // Güncellenmiş check-in'i getir
    const updatedCheckInDoc = await getDoc(checkInRef)
    const updatedData = updatedCheckInDoc.data()
    
    return {
      id: checkInId,
      ...updatedData,
      checkInTime: updatedData.checkInTime.toDate().toISOString(),
      breakStartTime: updatedData.breakStartTime.toDate().toISOString(),
      breakEndTime: updatedData.breakEndTime.toDate().toISOString()
    }
  } catch (error) {
    console.error("Error ending break:", error)
    throw error
  }
}

export async function getUserCheckIns(userId: string) {
  try {
    // Aktif check-in'i al
    const activeCheckIn = await getActiveCheckIn(userId)
    
    // Tamamlanmış check-in'leri al
    const q = query(
      checkInsRef, 
      where("userId", "==", userId),
      where("status", "==", "completed")
    )
    
    const snapshot = await getDocs(q)
    const history = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        checkInTime: data.checkInTime.toDate().toISOString(),
        checkOutTime: data.checkOutTime.toDate().toISOString(),
        breakStartTime: data.breakStartTime ? data.breakStartTime.toDate().toISOString() : undefined,
        breakEndTime: data.breakEndTime ? data.breakEndTime.toDate().toISOString() : undefined
      }
    }).sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())

    return {
      activeCheckIn,
      history,
    }
  } catch (error) {
    console.error("Error getting user check-ins:", error)
    throw error
  }
}

// lib/actions.ts

export async function createUserProfile(
  userId: string,
  { studentNumber, email, fullName, password }: { studentNumber: string; email: string; fullName: string; password?: string }
) {
  try {
    console.log("createUserProfile çağrıldı:", userId, { studentNumber, email, fullName });
    
    await setDoc(doc(usersRef, userId), {
      studentNumber,
      email,
      fullName,
      password: password || "", // Gerçek bir projede şifre böyle saklanmamalı!
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true
    });
    
    console.log("Kullanıcı profili oluşturuldu");
    return { success: true };
  } catch (error) {
    console.error("Kullanıcı profili oluşturma hatası:", error);
    throw error;
  }
}
