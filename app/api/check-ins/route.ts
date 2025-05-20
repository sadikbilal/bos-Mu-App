import { NextRequest, NextResponse } from 'next/server';
import { getCheckInsByUser } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'userId parametresi gerekli' }, { status: 400 });
    }

    try {
      // Eğer aktif check-in'leri istiyorsa
      if (status === 'active') {
        const checkInsRef = collection(db, 'checkIns');
        const q = query(checkInsRef, 
          where('userId', '==', userId),
          where('status', '==', 'active')
        );
        
        const snapshot = await getDocs(q);
        const activeCheckIns = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        return NextResponse.json(activeCheckIns);
      }
      
      // Tüm check-in'leri getir
      const checkIns = await getCheckInsByUser(userId);
      return NextResponse.json(checkIns);
    } catch (error) {
      console.error('Veri servisi hatası:', error);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Check-in\'ler alınırken hata:', error);
    return NextResponse.json({ error: 'Check-in\'ler alınamadı' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, locationId, deskId } = body;

    if (!userId || !locationId) {
      return NextResponse.json({ error: 'userId ve locationId parametreleri gerekli' }, { status: 400 });
    }

    // Yeni check-in oluştur
    const checkInsRef = collection(db, 'checkIns');
    const newCheckIn = {
      userId,
      locationId,
      ...(deskId && { deskId }),
      checkInTime: serverTimestamp(),
      status: 'active'
    };

    const docRef = await addDoc(checkInsRef, newCheckIn);
    
    return NextResponse.json({ 
      id: docRef.id,
      ...newCheckIn,
      checkInTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Check-in oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Check-in oluşturulamadı' }, { status: 500 });
  }
} 