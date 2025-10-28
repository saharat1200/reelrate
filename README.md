# 🎬 ReelRate - Movie & Anime Review Platform

ReelRate เป็นแพลตฟอร์มรีวิวหนังและอนิเมะที่ทันสมัย ให้ผู้ใช้สามารถค้นพบ รีวิว และให้คะแนนหนังและอนิเมะโปรดของตนเองได้

## ✨ คุณสมบัติหลัก

### 🎥 ระบบหนัง
- ค้นหาและเรียกดูหนังยอดนิยม หนังที่กำลังฉาย และหนังที่จะออกใหม่
- ดูรายละเอียดหนังพร้อมข้อมูลครบถ้วนจาก TMDB
- ระบบรีวิวและให้คะแนนหนัง
- เพิ่มหนังเข้ารายการโปรด

### 🎌 ระบบอนิเมะ
- ค้นหาและเรียกดูอนิเมะยอดนิยม อนิเมะที่กำลังออนแอร์ และอนิเมะที่จะออกใหม่
- ดูรายละเอียดอนิเมะพร้อมข้อมูลจาก MyAnimeList
- ระบบรีวิวและให้คะแนนอนิเมะ
- เพิ่มอนิเมะเข้ารายการโปรด

### 👤 ระบบผู้ใช้
- สมัครสมาชิกและเข้าสู่ระบบด้วย Supabase Auth
- โปรไฟล์ผู้ใช้พร้อมสถิติการใช้งาน
- ระบบแจ้งเตือน
- ระบบแอดมิน

### 🌐 คุณสมบัติเพิ่มเติม
- รองรับหลายภาษา (ไทย/อังกฤษ)
- Progressive Web App (PWA) - ติดตั้งเป็นแอปได้
- Responsive Design - ใช้งานได้ทุกอุปกรณ์
- Dark/Light Mode
- ระบบแคช
- Service Worker สำหรับการใช้งานออฟไลน์

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **Next.js 16** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **next-intl** - Internationalization
- **next-themes** - Theme Management

### Backend & Database
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Real-time subscriptions
  - Storage
  - Row Level Security (RLS)

### External APIs
- **TMDB API** - ข้อมูลหนัง
- **Jikan API** - ข้อมูลอนิเมะจาก MyAnimeList

## 🚀 การติดตั้งและใช้งาน

### ข้อกำหนดเบื้องต้น
- Node.js 18+ 
- npm หรือ yarn
- บัญชี Supabase
- TMDB API Key

### การติดตั้ง

1. Clone repository
```bash
git clone <repository-url>
cd reelrate
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. ตั้งค่า environment variables
สร้างไฟล์ `.env.local` และเพิ่มค่าต่อไปนี้:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_JIKAN_API_BASE_URL=https://api.jikan.moe/v4
```

4. ตั้งค่าฐานข้อมูล Supabase
รันไฟล์ SQL ใน Supabase SQL Editor:
- `database-schema.sql` - สร้างตารางและ RLS policies
- `supabase-setup.sql` - ตั้งค่าเพิ่มเติม

5. รันโปรเจค
```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## 📁 โครงสร้างโปรเจค

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Multi-language routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   ├── reviews/          # Review components
│   └── ...
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility libraries
│   ├── api.ts           # API functions
│   ├── supabase.ts      # Supabase client
│   └── ...
└── i18n/                # Internationalization
```

## 🗄️ ฐานข้อมูล

### ตารางหลัก
- **profiles** - ข้อมูลผู้ใช้
- **movies** - ข้อมูลหนังและอนิเมะ
- **reviews** - รีวิวและคะแนน
- **favorites** - รายการโปรด
- **review_likes** - การกดไลค์รีวิว
- **comments** - ความคิดเห็น
- **notifications** - การแจ้งเตือน

## 🔧 การพัฒนา

### คำสั่งที่สำคัญ
```bash
npm run dev          # รันโหมดพัฒนา
npm run build        # Build สำหรับ production
npm run start        # รัน production build
npm run lint         # ตรวจสอบ code style
```

### การเพิ่มภาษาใหม่
1. เพิ่มไฟล์ภาษาใน `messages/`
2. อัพเดท `src/i18n/routing.ts`
3. เพิ่ม locale ใน configuration

## 📚 API Credits & References

### 🎬 TMDB (The Movie Database)
- **Website**: https://www.themoviedb.org/
- **API Documentation**: https://developers.themoviedb.org/3
- **Usage**: ข้อมูลหนัง, โปสเตอร์, รูปภาพ, วิดีโอตัวอย่าง
- **License**: CC BY-NC 4.0

### 🎌 Jikan API (MyAnimeList Unofficial API)
- **Website**: https://jikan.moe/
- **API Documentation**: https://docs.api.jikan.moe/
- **Data Source**: MyAnimeList (https://myanimelist.net/)
- **Usage**: ข้อมูลอนิเมะ, คะแนน, รูปภาพ, ข้อมูลตัวละคร
- **License**: MIT License

### 🔐 Supabase
- **Website**: https://supabase.com/
- **Documentation**: https://supabase.com/docs
- **Usage**: Authentication, Database, Storage, Real-time
- **License**: Apache 2.0

### 🎨 Lucide Icons
- **Website**: https://lucide.dev/
- **Usage**: Icons throughout the application
- **License**: ISC License

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อผ่าน:
- GitHub Issues
- Email: [your-email@example.com]

---

Made with ❤️ by ReelRate Team
