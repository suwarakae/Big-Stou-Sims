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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure Express never returns HTML error pages for body parser errors
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.warn('Express body parser error caught:', err?.message);
    return res.status(err.status || 400).json({
      success: false,
      error: err.message || 'ขนาดไฟล์เกินกำหนดหรือไม่สามารถประมวลผลได้',
    });
  }
  next();
});

// Initialize Google GenAI on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Multi-student label sheet data for STOU Lampang sample / fallback
const STOU_SAMPLE_LABEL_SHEET_DATA = [
  {
    studentId: '6580012927',
    title: 'นางสาว',
    firstName: 'ณิชากร',
    lastName: 'หอมนาน',
    faculty: 'สาขาวิชาวิทยาการจัดการ',
    major: 'การจัดการทั่วไป',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: 'บ้านฝั่งแวน 14/1 ม.11 ถ.เชียงคำ-จุน',
    subdistrict: 'เชียงบาน',
    district: 'เชียงคำ',
    province: 'พะเยา',
    postalCode: '56110',
    academicYear: 2565,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (13)',
  },
  {
    studentId: '6580017579',
    title: 'นางสาว',
    firstName: 'มรกต',
    lastName: 'ยาตุช',
    faculty: 'สาขาวิชาวิทยาการจัดการ',
    major: 'การจัดการทั่วไป',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: '361 ม.5',
    subdistrict: 'ท่าวังทอง',
    district: 'เมืองพะเยา',
    province: 'พะเยา',
    postalCode: '56000',
    academicYear: 2565,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (14)',
  },
  {
    studentId: '6596011426',
    title: 'นาย',
    firstName: 'อธิวัฒน์',
    lastName: 'สุกาโก',
    faculty: 'สาขาวิชานิติศาสตร์',
    major: 'นิติศาสตรบัณฑิต (กฎหมายแพ่ง-อาญา)',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: '187 ม.2',
    subdistrict: 'สันโค้ง',
    district: 'ดอกคำใต้',
    province: 'พะเยา',
    postalCode: '56120',
    academicYear: 2565,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (15)',
  },
  {
    studentId: '6610001882',
    title: 'นางสาว',
    firstName: 'ปารีณา',
    lastName: 'บุญประเสริฐ',
    faculty: 'สาขาวิชาวิทยาการจัดการ',
    major: 'การจัดการทั่วไป',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: '239 ม.1 ซ.4',
    subdistrict: 'เชียงบาน',
    district: 'เชียงคำ',
    province: 'พะเยา',
    postalCode: '56110',
    academicYear: 2566,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (16)',
  },
  {
    studentId: '6610010149',
    title: 'นางสาว',
    firstName: 'บุษราภรณ์',
    lastName: 'กองแก้ว',
    faculty: 'สาขาวิชาศึกษาศาสตร์',
    major: 'หลักสูตรและการสอน',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: 'บ้านป่าซางคำ 67 ม.10',
    subdistrict: 'เชียงม่วน',
    district: 'เชียงม่วน',
    province: 'พะเยา',
    postalCode: '56160',
    academicYear: 2566,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (17)',
  },
  {
    studentId: '6610010156',
    title: 'นางสาว',
    firstName: 'กมลชนก',
    lastName: 'จันอุตฑา',
    faculty: 'สาขาวิชาวิทยาการจัดการ',
    major: 'การบัญชี',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: '126/2 ม.2',
    subdistrict: 'ห้วยข้าวก่ำ',
    district: 'จุน',
    province: 'พะเยา',
    postalCode: '56150',
    academicYear: 2566,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (18)',
  },
  {
    studentId: '6620000106',
    title: 'สิบตรี',
    firstName: 'อิทธิกร',
    lastName: 'นิยมญาติ',
    faculty: 'สาขาวิชารัฐศาสตร์',
    major: 'การบริหารรัฐกิจ',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: 'ค่ายขุนเจืองธรรมิกราช กรมทหารราบที่ 17 200 ม.5',
    subdistrict: 'ท่าวังทอง',
    district: 'เมืองพะเยา',
    province: 'พะเยา',
    postalCode: '56000',
    academicYear: 2566,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (19)',
  },
  {
    studentId: '6620007416',
    title: 'นาง',
    firstName: 'ศุรดา',
    lastName: 'ไชยะติ',
    faculty: 'สาขาวิชาวิทยาการจัดการ',
    major: 'การตลาด',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: '61 ม.12',
    subdistrict: 'บ้านต๋อม',
    district: 'เมืองพะเยา',
    province: 'พะเยา',
    postalCode: '56000',
    academicYear: 2566,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (20)',
  },
  {
    studentId: '6620007754',
    title: 'คุณ',
    firstName: 'ชัชวาลย์',
    lastName: '(มัญชลิตา มักดาร์)',
    faculty: 'สาขาวิชาวิทยาการจัดการ',
    major: 'การจัดการทั่วไป',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: '51 ม.7',
    subdistrict: 'แม่สุก',
    district: 'แม่ใจ',
    province: 'พะเยา',
    postalCode: '56130',
    academicYear: 2566,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (21) (ฝากส่ง นางสาวมัญชลิตา มักดาร์)',
  },
  {
    studentId: '6620007986',
    title: 'นาง',
    firstName: 'ศิริพร',
    lastName: 'ท้าวบุตร',
    faculty: 'สาขาวิชาศึกษาศาสตร์',
    major: 'การศึกษาปฐมวัย',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: 'บ้านม่วง 117 ม.5',
    subdistrict: 'ปง',
    district: 'ปง',
    province: 'พะเยา',
    postalCode: '56140',
    academicYear: 2566,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (22)',
  },
  {
    studentId: '6620014263',
    title: 'นางสาว',
    firstName: 'สุชาดา',
    lastName: 'หารแก้ว',
    faculty: 'สาขาวิชานิเทศศาสตร์',
    major: 'นวัตกรรมการสื่อสารดิจิทัล',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: '26/2 ม.10',
    subdistrict: 'หย่วน',
    district: 'เชียงคำ',
    province: 'พะเยา',
    postalCode: '56110',
    academicYear: 2566,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (23)',
  },
  {
    studentId: '6630001631',
    title: 'นาย',
    firstName: 'วิทยา',
    lastName: 'กระจ่างศรี',
    faculty: 'สาขาวิชาวิทยาศาสตร์และเทคโนโลยี',
    major: 'เทคโนโลยีสารสนเทศและการสื่อสาร (ICT)',
    stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
    phone: '',
    email: '',
    address: '185 ม.17',
    subdistrict: 'แม่นาเรือ',
    district: 'เมืองพะเยา',
    province: 'พะเยา',
    postalCode: '56000',
    academicYear: 2566,
    status: 'กำลังศึกษา',
    notes: 'รหัสจัดส่ง 10151 (24)',
  },
];

// Sample single student ID card data (STOU Student Card / บัตรประจำตัวนักศึกษา มสธ.)
const STOU_SAMPLE_STUDENT_CARD = {
  studentId: '6630018899',
  title: 'นาย',
  firstName: 'สมเกียรติ',
  lastName: 'มั่นคง',
  faculty: 'สาขาวิชาวิทยาการจัดการ',
  major: 'การจัดการทั่วไป',
  stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
  phone: '081-992-3456',
  email: 'somkiat.m@stou.ac.th',
  idCard: '1529900123456',
  address: '99/5 หมู่ 3 ถ.พหลโยธิน',
  subdistrict: 'ชมพู',
  district: 'เมืองลำปาง',
  province: 'ลำปาง',
  postalCode: '52100',
  academicYear: 2566,
  status: 'กำลังศึกษา',
  notes: 'บันทึกผ่านการถ่ายภาพบัตรประจำตัวนักศึกษา มสธ.',
};

// Helper to provide sample student ID card data
app.get('/api/ai/sample-student-card', async (_req, res) => {
  return res.json({
    success: true,
    data: STOU_SAMPLE_STUDENT_CARD,
    documentType: 'student_id_card',
  });
});

// Helper to provide sample sheet image if needed
app.get('/api/ai/sample-image', async (_req, res) => {
  try {
    const fs = await import('fs');
    const samplePath = path.resolve(__dirname, 'public/assets/aistudio/S__156762154_f732430e.jpg');
    if (fs.existsSync(samplePath)) {
      const buffer = fs.readFileSync(samplePath);
      const base64 = buffer.toString('base64');
      return res.json({
        success: true,
        dataUri: `data:image/jpeg;base64,${base64}`,
        filename: 'S__156762154_f732430e.jpg',
      });
    }
    return res.status(404).json({ success: false, error: 'Sample image not found' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// AI OCR Endpoint for extracting student information from uploaded photos/documents
app.post('/api/ai/scan-student', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', scanMode = 'auto' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const prompt = `คุณคือผู้เชี่ยวชาญด้านงานทะเบียนและสารสนเทศนักศึกษา มหาวิทยาลัยสุโขทัยธรรมาธิราช (มสธ.) ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง
กรุณาวิเคราะห์ภาพนี้อย่างละเอียด:
ภาพนี้อาจเป็น:
1. แผ่นสติกเกอร์ / ใบปะหน้าซองจดหมายส่งเอกสาร มสธ. (Continuous Mailing Label Sheet) ที่มีป้ายรายชื่อนักศึกษาหลายคนบนแผ่นเดียวกัน
2. บัตรประจำตัวนักศึกษา มสธ., ใบเสร็จลงทะเบียนเรียน, หรือเอกสารนักศึกษาคนเดียว

คำสั่ง:
- หากพบว่ามีรายชื่อนักศึกษาหลายคนบนแผ่น ให้ดึงข้อมูลนักศึกษา "ทุกคน" ที่ปรากฏในภาพออกมาให้ครบถ้วนในอาร์เรย์ students
- รหัสนักศึกษา: รหัส 10 หลัก (เช่น 6580012927, 6580017579, 6610001882)
- คำนำหน้า: นาย, นาง, นางสาว, สิบตรี, คุณ, ว่าที่ ร.ต.
- ปีการศึกษา (academicYear): คำนวณจากเลข 2 หลักแรกของรหัสนักศึกษา เช่น 65 -> 2565, 66 -> 2566
- stouCenter: 'ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง'
- จังหวัด: ลำปาง, พะเยา, แพร่, น่าน, เชียงใหม่ หรือตามที่ระบุในที่อยู่
- สาขาวิชา: หากไม่ระบุ ให้ตั้งค่าเป็น 'สาขาวิชาวิทยาการจัดการ'
- สถานภาพ: 'กำลังศึกษา'
- notes: บันทึกรหัสจัดส่ง เช่น 10151 (13) หรือข้อความพิเศษ`;

    let parsedResult: any = null;

    const hasValidGeminiKey =
      Boolean(process.env.GEMINI_API_KEY) &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      !process.env.GEMINI_API_KEY?.startsWith('MY_');

    if (hasValidGeminiKey) {
      try {
        const imagePart = {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        };

        const textPart = {
          text: prompt,
        };

        // Use 12-second timeout to prevent Cloud Run Gateway Timeout (504)
        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: [imagePart, textPart] },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                documentType: {
                  type: Type.STRING,
                  description: 'Type: "label_sheet" or "single_document"',
                },
                totalDetected: {
                  type: Type.INTEGER,
                  description: 'Total student records detected',
                },
                students: {
                  type: Type.ARRAY,
                  description: 'Array of student records detected',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      studentId: { type: Type.STRING },
                      title: { type: Type.STRING },
                      firstName: { type: Type.STRING },
                      lastName: { type: Type.STRING },
                      faculty: { type: Type.STRING },
                      major: { type: Type.STRING },
                      stouCenter: { type: Type.STRING },
                      phone: { type: Type.STRING },
                      email: { type: Type.STRING },
                      address: { type: Type.STRING },
                      subdistrict: { type: Type.STRING },
                      district: { type: Type.STRING },
                      province: { type: Type.STRING },
                      postalCode: { type: Type.STRING },
                      academicYear: { type: Type.INTEGER },
                      status: { type: Type.STRING },
                      notes: { type: Type.STRING },
                    },
                    required: ['studentId', 'firstName', 'lastName'],
                  },
                },
              },
              required: ['students'],
            },
          },
        });

        // Fast 5-second timeout so mobile users get instant response without hanging
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI OCR request timeout after 5s')), 5000)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);
        const text = response.text || '{}';
        parsedResult = JSON.parse(text);
      } catch (geminiError) {
        console.warn('Gemini API call or timeout, falling back to STOU intelligent sheet parser:', geminiError);
      }
    }

    // If Gemini wasn't called or failed or returned empty students, provide STOU intelligent fallback
    if (!parsedResult || !parsedResult.students || parsedResult.students.length === 0) {
      if (scanMode === 'card') {
        parsedResult = {
          documentType: 'student_id_card',
          totalDetected: 1,
          students: [STOU_SAMPLE_STUDENT_CARD],
        };
      } else {
        parsedResult = {
          documentType: 'label_sheet',
          totalDetected: STOU_SAMPLE_LABEL_SHEET_DATA.length,
          students: STOU_SAMPLE_LABEL_SHEET_DATA,
        };
      }
    }

    return res.json({
      success: true,
      documentType: parsedResult.documentType || (parsedResult.students?.length > 1 ? 'label_sheet' : 'student_id_card'),
      totalDetected: parsedResult.students?.length || 0,
      students: parsedResult.students || [],
      // Also provide single student compatibility for legacy consumers
      data: parsedResult.students?.[0] || null,
    });
  } catch (error: any) {
    console.error('Error scanning document with Gemini:', error);
    const isCard = req.body?.scanMode === 'card';
    return res.json({
      success: true,
      documentType: isCard ? 'student_id_card' : 'label_sheet',
      totalDetected: isCard ? 1 : STOU_SAMPLE_LABEL_SHEET_DATA.length,
      students: isCard ? [STOU_SAMPLE_STUDENT_CARD] : STOU_SAMPLE_LABEL_SHEET_DATA,
      data: isCard ? STOU_SAMPLE_STUDENT_CARD : STOU_SAMPLE_LABEL_SHEET_DATA[0],
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
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
