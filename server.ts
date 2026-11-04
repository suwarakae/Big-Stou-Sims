import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI OCR Endpoint for extracting student information from uploaded photos/documents
app.post('/api/ai/scan-student', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const prompt = `คุณคือผู้เชี่ยวชาญด้านงานทะเบียนนักศึกษา มหาวิทยาลัยสุโขทัยธรรมาธิราช (มสธ.) ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง
กรุณาวิเคราะห์ภาพเอกสารนี้อย่างละเอียด (อาจเป็น บัตรนักศึกษา มสธ., ใบเสร็จลงทะเบียนเรียน, ใบรับรองการเป็นนักศึกษา, แบบฟอร์มสมัครเรียน, บัตรประชาชน, หรือเอกสารราชการ)
และดึงข้อมูลนักศึกษาออกมาเป็น JSON ตาม Schema ที่กำหนด:

1. studentId: รหัสนักศึกษา 10 หลัก (หากในภาพมีให้ดึงมาเฉพาะตัวเลข 10 ตัว เช่น 6630014521)
2. title: คำนำหน้า (นาย, นาง, นางสาว, ว่าที่ ร.ต., ดร., อื่นๆ)
3. firstName: ชื่อจริงภาษาไทย (ไม่รวมคำนำหน้า)
4. lastName: นามสกุลภาษาไทย
5. faculty: สาขาวิชาของ มสธ. (เช่น สาขาวิชาวิทยาการจัดการ, สาขาวิชานิติศาสตร์, สาขาวิชารัฐศาสตร์, สาขาวิชาศึกษาศาสตร์, สาขาวิชาวิทยาศาสตร์และเทคโนโลยี, สาขาวิชาพยาบาลศาสตร์, สาขาวิชาสาธารณสุขศาสตร์, สาขาวิชาเกษตรศาสตร์และสหกรณ์, สาขาวิชานิเทศศาสตร์, สาขาวิชาศิลปศาสตร์, สาขาวิชาเศรษฐศาสตร์, สาขาวิชามนุษยนิเวศศาสตร์)
6. major: แขนงวิชา/วิชาเอก
7. stouCenter: ค่าคงที่ให้ใส่ 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง'
8. phone: เบอร์โทรศัพท์ (ตัวเลข 10 หลัก เช่น 0812345678)
9. email: อีเมล
10. address: ที่อยู่ บ้านเลขที่ ซอย ถนน หมู่บ้าน
11. subdistrict: ตำบล/แขวง
12. district: อำเภอ/เขต
13. province: จังหวัด (เช่น ลำปาง, เชียงใหม่, แพร่, น่าน, เชียงราย หรือจังหวัดอื่น)
14. postalCode: รหัสไปรษณีย์ 5 หลัก
15. academicYear: ปีการศึกษาที่เข้าศึกษา (พ.ศ. เช่น 2566, 2567)
16. status: สถานภาพ ('กำลังศึกษา', 'สำเร็จการศึกษา', 'พักการเรียน', 'รักษาสถานภาพ')
17. notes: ข้อมูลเพิ่มเติมที่ตรวจพบในเอกสาร`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentId: { type: Type.STRING, description: '10-digit student ID' },
            title: { type: Type.STRING, description: 'Prefix title (นาย, นาง, นางสาว etc.)' },
            firstName: { type: Type.STRING, description: 'First name' },
            lastName: { type: Type.STRING, description: 'Last name' },
            faculty: { type: Type.STRING, description: 'STOU faculty/school name' },
            major: { type: Type.STRING, description: 'Major or field of study' },
            stouCenter: { type: Type.STRING, description: 'STOU Lampang Center' },
            phone: { type: Type.STRING, description: '10-digit phone number' },
            email: { type: Type.STRING, description: 'Email address' },
            address: { type: Type.STRING, description: 'Street address' },
            subdistrict: { type: Type.STRING, description: 'Subdistrict/Tambon' },
            district: { type: Type.STRING, description: 'District/Amphoe' },
            province: { type: Type.STRING, description: 'Province' },
            postalCode: { type: Type.STRING, description: '5-digit postal code' },
            academicYear: { type: Type.INTEGER, description: 'Academic admission year in BE (e.g. 2567)' },
            status: { type: Type.STRING, description: 'Status (กำลังศึกษา, สำเร็จการศึกษา etc.)' },
            notes: { type: Type.STRING, description: 'Extracted notes or additional info' },
          },
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error scanning document with Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'เกิดข้อผิดพลาดในการประมวลผลภาพเอกสาร',
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
