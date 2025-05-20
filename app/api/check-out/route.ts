import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, checkInId } = body;

    if (!userId || !checkInId) {
      return NextResponse.json({ error: 'userId ve checkInId parametreleri gerekli' }, { status: 400 });
    }

    // Check-in dokümanını al
    const checkInRef = doc(db, 'checkIns', checkInId);
    const checkInDoc = await getDoc(checkInRef);
    
    if (!checkInDoc.exists()) {
      return NextResponse.json({ error: 'Check-in bulunamadı' }, { status: 404 });
    }
    
    const checkInData = checkInDoc.data();
    
    // Kullanıcı kontrolü
    if (checkInData.userId !== userId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 403 });
    }
    
    // Check-in durumu kontrolü
    if (checkInData.status !== 'active') {
      return NextResponse.json({ error: 'Bu check-in zaten tamamlanmış' }, { status: 400 });
    }

    // Check-in'i güncelle
    await updateDoc(checkInRef, {
      checkOutTime: serverTimestamp(),
      status: 'completed'
    });

    // Eğer masa varsa, masayı da güncelle
    if (checkInData.deskId) {
      const deskRef = doc(db, 'desks', checkInData.deskId);
      const deskDoc = await getDoc(deskRef);
      
      if (deskDoc.exists()) {
        await updateDoc(deskRef, {
          status: 'available',
          lastUpdated: serverTimestamp()
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Check-out başarılı'
    });
  } catch (error) {
    console.error('Check-out işlemi sırasında hata:', error);
    return NextResponse.json({ error: 'Check-out yapılamadı' }, { status: 500 });
  }
} 