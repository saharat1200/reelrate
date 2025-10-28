import { NextRequest, NextResponse } from 'next/server';
import { Translate } from '@google-cloud/translate/build/src/v2';

// Initialize Google Translate client
let translate: Translate | null = null;

const initTranslate = () => {
  if (!translate) {
    try {
      translate = new Translate({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    } catch (error) {
      console.warn('Google Translate API not configured properly:', error);
    }
  }
  return translate;
};

// Cache for translated text
const translationCache = new Map<string, string>();

// Enhanced anime terms translation with more comprehensive coverage
const animeTerms: { [key: string]: string } = {
  // Basic anime terms
  'anime': 'อนิเมะ',
  'manga': 'มังงะ',
  'episode': 'ตอน',
  'episodes': 'ตอน',
  'season': 'ซีซัน',
  'seasons': 'ซีซัน',
  'character': 'ตัวละคร',
  'characters': 'ตัวละคร',
  'protagonist': 'ตัวเอก',
  'antagonist': 'ตัวร้าย',
  'hero': 'ฮีโร่',
  'villain': 'วายร้าย',
  
  // Genres
  'action': 'แอ็คชั่น',
  'adventure': 'ผจญภัย',
  'comedy': 'ตลก',
  'drama': 'ดราม่า',
  'fantasy': 'แฟนตาซี',
  'horror': 'สยองขวัญ',
  'mystery': 'ลึกลับ',
  'romance': 'โรแมนซ์',
  'sci-fi': 'ไซไฟ',
  'science fiction': 'นิยายวิทยาศาสตร์',
  'thriller': 'ระทึกขวัญ',
  'supernatural': 'เหนือธรรมชาติ',
  'slice of life': 'ชีวิตประจำวัน',
  'sports': 'กีฬา',
  'mecha': 'เมคค่า',
  'shounen': 'โชเน็น',
  'shoujo': 'โชโจ',
  'seinen': 'เซเน็น',
  'josei': 'โจเซ',
  
  // Status terms
  'ongoing': 'กำลังออนแอร์',
  'completed': 'จบแล้ว',
  'upcoming': 'กำลังจะมา',
  'airing': 'กำลังออนแอร์',
  'finished': 'จบแล้ว',
  'not yet aired': 'ยังไม่ออนแอร์',
  
  // Common words
  'school': 'โรงเรียน',
  'academy': 'สถาบัน',
  'university': 'มหาวิทยาลัย',
  'magic': 'เวทมนตร์',
  'magical': 'เวทย์มนตร์',
  'battle': 'การต่อสู้',
  'fight': 'ต่อสู้',
  'war': 'สงคราม',
  'peace': 'สันติภาพ',
  'friendship': 'มิตรภาพ',
  'love': 'ความรัก',
  'family': 'ครอบครัว',
  'power': 'พลัง',
  'powers': 'พลัง',
  'world': 'โลก',
  'story': 'เรื่องราว',
  'guild': 'กิลด์',
  'tournament': 'ทัวร์นาเมนต์',
  'demon': 'ปีศาจ',
  'demons': 'ปีศาจ',
  'monster': 'สัตว์ประหลาด',
  'monsters': 'สัตว์ประหลาด',
  'dragon': 'มังกร',
  'dragons': 'มังกร',
  'ninja': 'นินจา',
  'samurai': 'ซามูไร',
  'sword': 'ดาบ',
  'swords': 'ดาบ',
  'magic sword': 'ดาบวิเศษ',
  
  // Time and ratings
  'year': 'ปี',
  'years': 'ปี',
  'rating': 'เรตติ้ง',
  'score': 'คะแนน',
  'rank': 'อันดับ',
  'popularity': 'ความนิยม',
  'members': 'สมาชิก',
  'favorites': 'รายการโปรด',
  
  // Production terms
  'studio': 'สตูดิโอ',
  'producer': 'ผู้ผลิต',
  'director': 'ผู้กำกับ',
  'author': 'ผู้แต่ง',
  'original': 'ต้นฉบับ',
  'adaptation': 'ดัดแปลง',
  'sequel': 'ภาคต่อ',
  'prequel': 'ภาคก่อน',
  'spin-off': 'สปินออฟ',
  'movie': 'ภาพยนตร์',
  'film': 'ภาพยนตร์',
  'ova': 'โอวีเอ',
  'special': 'ตอนพิเศษ'
};

function applyAnimeTerms(text: string): string {
  let result = text;
  for (const [english, thai] of Object.entries(animeTerms)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, thai);
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage = 'th' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `${text}_${targetLanguage}`;
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({ 
        translatedText: translationCache.get(cacheKey),
        cached: true 
      });
    }

    const translateClient = initTranslate();

    try {
      if (translateClient) {
        // Use Google Translate API
        const [translation] = await translateClient.translate(text, targetLanguage);
        
        // Apply anime-specific terms
        const finalTranslation = applyAnimeTerms(translation);
        
        // Cache the result
        translationCache.set(cacheKey, finalTranslation);
        
        return NextResponse.json({ 
          translatedText: finalTranslation,
          cached: false,
          method: 'google_translate'
        });
      } else {
        throw new Error('Google Translate not configured');
      }
    } catch (translateError) {
      console.error('Google Translate API error:', translateError);
      
      // Fallback: Apply only anime terms replacement
      const fallbackTranslation = applyAnimeTerms(text);
      
      // Cache fallback result
      translationCache.set(cacheKey, fallbackTranslation);
      
      return NextResponse.json({ 
        translatedText: fallbackTranslation,
        fallback: true,
        method: 'fallback_terms',
        error: 'Translation service unavailable, using fallback'
      });
    }
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}