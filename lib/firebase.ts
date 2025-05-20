// Firebase yapılandırması ve yardımcı fonksiyonlar
import { initializeApp } from "firebase/app"
import { getFirestore, collection, doc, setDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { addDoc } from "firebase/firestore"
import { Timestamp } from "firebase/firestore"

// Firebase yapılandırma bilgileri
// NOT: Bu bilgileri .env dosyasında saklamanız ve client tarafında
// NEXT_PUBLIC_ öneki ile kullanmanız önerilir
const firebaseConfig = {
  apiKey: "",
  authDomain: "bosmu-hackathon.firebaseapp.com",
  projectId: "bosmu-hackathon",
  storageBucket: "bosmu-hackathon.firebasestorage.app",
  messagingSenderId: "604250194094",
  appId: "1:604250194094:web:729e7ecf63b8df3c8dad3f",
  measurementId: "G-57RENQB8H1"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig)

// Firestore ve Auth servislerini dışa aktar
export const db = getFirestore(app)
export const auth = getAuth(app)

// Firestore collection referansları
export const usersRef = collection(db, 'users')
export const locationsRef = collection(db, 'locations')
export const tablesRef = collection(db, 'tables')
export const checkInsRef = collection(db, 'checkIns')
export const penaltiesRef = collection(db, 'penalties')

// Auth yardımcı fonksiyonları
export const signIn = async (email: string, password: string) => {
  console.log("Giriş yapılıyor:", email);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Giriş başarılı:", result.user.uid);
    return result;
  } catch (error) {
    console.error("Firebase Auth giriş hatası:", error);
    throw error;
  }
}

export const createUser = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password)
}

export const signOutUser = async () => {
  return firebaseSignOut(auth)
}

// Kullanıcı işlemleri
export const createUserProfile = async (
  userId: string,
  userData: {
    studentNumber: string,
    email: string,
    fullName: string
  }
) => {
  return setDoc(doc(usersRef, userId), {
    ...userData,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    isActive: true
  })
}

// Lokasyon işlemleri
export const createLocation = async (locationData: {
  name: string,
  type: string,
  totalCapacity: number,
  qrCode: string
}) => {
  return addDoc(locationsRef, {
    ...locationData,
    currentOccupancy: 0
  })
}

// Masa işlemleri
export const createTable = async (tableData: {
  locationId: string,
  tableNumber: number
}) => {
  return addDoc(tablesRef, {
    ...tableData,
    isOccupied: false,
    currentUser: null,
    occupiedAt: null,
    breakEndsAt: null,
    breakType: null,
    status: 'available'
  })
}

// Giriş/Çıkış işlemleri
export const createCheckIn = async (checkInData: {
  userId: string,
  locationId: string,
  tableId?: string
}) => {
  return addDoc(checkInsRef, {
    ...checkInData,
    checkInTime: serverTimestamp(),
    checkOutTime: null,
    breakStartTime: null,
    breakEndTime: null,
    breakType: null,
    status: 'active'
  })
}

// Mola işlemleri
export const startBreak = async (checkInId: string, breakType: 'normal' | 'food') => {
  const breakDuration = breakType === 'normal' ? 20 : 90 // dakika cinsinden
  const breakEndTime = new Date()
  breakEndTime.setMinutes(breakEndTime.getMinutes() + breakDuration)

  return updateDoc(doc(checkInsRef, checkInId), {
    breakStartTime: serverTimestamp(),
    breakEndTime: Timestamp.fromDate(breakEndTime),
    breakType,
    status: 'break'
  })
}

// Ceza işlemleri
export const createPenalty = async (penaltyData: {
  userId: string,
  tableId: string,
  reason: string
}) => {
  const penaltyDuration = 24 // saat cinsinden
  const endTime = new Date()
  endTime.setHours(endTime.getHours() + penaltyDuration)

  return addDoc(penaltiesRef, {
    ...penaltyData,
    startTime: serverTimestamp(),
    endTime: Timestamp.fromDate(endTime),
    status: 'active'
  })
}

// Yoğunluk güncelleme
export const updateLocationOccupancy = async (locationId: string, shouldIncrement: boolean) => {
  const locationRef = doc(locationsRef, locationId)
  return updateDoc(locationRef, {
    currentOccupancy: increment(shouldIncrement ? 1 : -1)
  })
}

export default app
