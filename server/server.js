require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const OpenAI = require('openai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = 'my_super_secret_key_123';
const verificationCodes = {}; 

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.perplexity.ai'
});

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

function sanitizeText(text) {
  const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\b[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}\b/g;
  let cleaned = text.replace(emailRegex, "[REDACTED EMAIL]");
  cleaned = cleaned.replace(phoneRegex, "[REDACTED PHONE]");
  return cleaned;
}

async function run() {
  try {
    await client.connect();
    console.log("✅ DB Connected!");
    const db = client.db("MockMateDB");
    const usersCollection = db.collection("users");

    // 1. Request Verification Code (Cleaned & Fixed)
    app.post('/request-code', async (req, res) => {
      const { email } = req.body;
      
      // 1. التحقق: هل الإيميل موجود مسبقاً؟
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "EMAIL_EXISTS" });
      }

      // 2. توليد الكود وحفظه
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      verificationCodes[email] = code;

      // 3. إعداد المرسل
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
      });

      const mailOptions = {
        from: `MockMate Support <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 MockMate Code',
        text: `Your verification code is: ${code}`
      };

      try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Code sent!" });
      } catch (error) {
        console.log(`⚠️ Email failed logic. Code: ${code}`);
        // إرسال رد وهمي في حال فشل الإيميل الحقيقي (لأغراض العرض)
        res.json({ message: "Code sent (Simulation)" });
      }
    });

    // 2. Register
    app.post('/register', async (req, res) => {
      const { email, password, code } = req.body;
      if (verificationCodes[email] !== code) return res.status(400).json({ message: "Invalid Code" });
      
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      await usersCollection.insertOne({ email, password: hashedPassword, createdAt: new Date() });
      delete verificationCodes[email];
      res.json({ message: "Registered successfully!" });
    });

    // 3. Login
    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      const user = await usersCollection.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: "Logged in", token, email: user.email });
    });

    // 4. Change Password
    app.post('/change-password', async (req, res) => {
      const { email, oldPassword, newPassword } = req.body;
      const user = await usersCollection.findOne({ email });
      if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        return res.status(400).json({ message: "Incorrect old password" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await usersCollection.updateOne({ email }, { $set: { password: hashedPassword } });
      res.json({ message: "Password updated!" });
    });

    // 8. طلب كود استعادة كلمة المرور (Forgot Password) 🆕
    app.post('/request-reset-code', async (req, res) => {
      const { email } = req.body;
      
      // هنا العكس: يجب أن يكون المستخدم موجوداً!
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "EMAIL_NOT_FOUND" });
      }

      const code = Math.floor(10000 + Math.random() * 90000).toString();
      verificationCodes[email] = code;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false }
      });

      const mailOptions = {
        from: `MockMate Support <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔑 Reset Password Code',
        text: `Use this code to reset your password: ${code}`
      };

      try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Code sent!" });
      } catch (error) {
        console.log(`Reset code simulation: ${code}`);
        res.json({ message: "Code sent (Simulation)" });
      }
    });

    // 9. تنفيذ استعادة كلمة المرور (Reset Password) 🆕
    app.post('/reset-password', async (req, res) => {
      const { email, code, newPassword } = req.body;

      // 1. التحقق من الكود
      if (verificationCodes[email] !== code) {
        return res.status(400).json({ message: "Invalid Code" });
      }

      // 2. تشفير كلمة المرور الجديدة وحفظها
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await usersCollection.updateOne({ email }, { $set: { password: hashedPassword } });
      
      // 3. مسح الكود
      delete verificationCodes[email];
      
      res.json({ message: "Password reset successfully!" });
    });

    // 5. Upload CV (AI)
    app.post('/upload-cv', upload.single('file'), async (req, res) => {
      try {
        const lang = req.body.lang || 'ar'; 
        
        if (!req.file) return res.status(400).json({ reply: "No file uploaded" });
        const data = await pdfParse(req.file.buffer);
        const safeText = sanitizeText(data.text);

        const systemPrompt = lang === 'en' 
          ? "You are an expert hiring manager. Read the candidate's CV (PII redacted). Welcome them professionally and ask the first relevant technical or behavioral question based on their skills. Keep it concise."
          : "أنت مدير توظيف خبير. اقرأ السيرة الذاتية (البيانات الحساسة محجوبة). رحب بالمرشح واسأله سؤالاً تقنياً أو سلوكياً دقيقاً بناءً على مهاراته. كن مختصراً.";

        const completion = await openai.chat.completions.create({
          model: "sonar-pro",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `CV Content:\n${safeText}` }
          ]
        });
        res.json({ reply: completion.choices[0].message.content });
      } catch (e) { res.status(500).json({ reply: "Error processing file" }); }
    });

    // 6. Chat (AI & Fallback Logic) 🧠✨
    app.post('/chat', async (req, res) => {
      const { message, history, lang } = req.body;
      
      try {
        // محاولة الاتصال بالذكاء الاصطناعي أولاً
        const systemPrompt = (lang === 'en')
          ? "You are a professional hiring manager conducting an interview. Continue the conversation naturally based on the candidate's last response. Keep your questions focused and short."
          : "أنت مدير توظيف محترف تجري مقابلة عمل. أكمل المحادثة بشكل طبيعي بناءً على إجابة المرشح. اجعل أسئلتك مركزة وقصيرة.";

        const completion = await openai.chat.completions.create({
          model: "sonar-pro",
          messages: [
            { role: "system", content: systemPrompt },
            ...(history || []),
            { role: "user", content: message }
          ]
        });

        res.json({ reply: completion.choices[0].message.content });

      } catch (e) {
        console.error("⚠️ AI Error, switching to manual mode:", e.message);
        
        // 👇👇 خطة الطوارئ (الردود الجاهزة) لضمان استمرار المحادثة 👇👇
        let fallbackReply = "";
        const msgLower = message.toLowerCase();

        if (lang === 'en') {
           if (msgLower.includes("hello") || msgLower.includes("hi")) fallbackReply = "Welcome back! Ready for the next question?";
           else if (msgLower.includes("name")) fallbackReply = "I am MockMate AI, your interview coach.";
           else fallbackReply = "That's an interesting point. Can you give me a specific example from your experience?";
        } else {
           if (msgLower.includes("مرحبا") || msgLower.includes("هلا") || msgLower.includes("السلام")) fallbackReply = "أهلاً بك مجدداً! هل أنت مستعد للسؤال التالي؟";
           else if (msgLower.includes("اسمك") || msgLower.includes("من انت")) fallbackReply = "أنا MockMate، مدربك الشخصي للمقابلات.";
           else fallbackReply = "نقطة مثيرة للاهتمام. هل يمكنك إعطائي مثالاً عملياً من تجربتك السابقة؟";
        }

        res.json({ reply: fallbackReply });
      }
    });
    // 7. End Interview (Report)
    app.post('/end-interview', async (req, res) => {
      const { history, lang } = req.body;
      try {
        const systemPrompt = (lang === 'en')
          ? "You are an expert evaluator. Analyze the interview. Provide a structured report with: 1. Score (out of 10), 2. Strengths, 3. Areas for Improvement, 4. Golden Advice. Use 2nd person perspective ('You did...')."
          : "أنت خبير تقييم. حلل المقابلة وقدم تقريراً يحتوي على: 1. التقييم (من 10)، 2. نقاط القوة، 3. نقاط التحسين، 4. نصيحة ذهبية. تحدث بصيغة المخاطب.";

        const completion = await openai.chat.completions.create({
          model: "sonar-pro",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(history) }
          ]
        });
        res.json({ report: completion.choices[0].message.content });
      } catch (e) { res.status(500).json({ report: "Error generating report" }); }
    });

  } catch (e) { console.error(e); }
}
run().catch(console.dir);

app.listen(port, () => { console.log(`🚀 Server running on ${port}`); });