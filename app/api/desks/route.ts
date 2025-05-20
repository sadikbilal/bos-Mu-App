import { NextRequest, NextResponse } from 'next/server';
import { getDesksByLocation } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Desk } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json({ error: 'locationId parametresi gerekli' }, { status: 400 });
    }

    try {
      // Öncelikle data.ts içindeki fonksiyonu kullanmayı dene
      const desks = await getDesksByLocation(locationId);
      return NextResponse.json(desks);
    } catch (error) {
      console.error('Veri servisi hatası, alternatif metoda geçiliyor:', error);
      
      // Plan B: doğrudan JSON dosyasından oku
      const desksData = require('@/data/desks.json');
      const filteredDesks = desksData.filter((desk: any) => desk.locationId === locationId);
      
      return NextResponse.json(filteredDesks);
    }
  } catch (error) {
    console.error('Masalar alınırken hata:', error);
    return NextResponse.json({ error: 'Masalar alınamadı' }, { status: 500 });
  }
} 