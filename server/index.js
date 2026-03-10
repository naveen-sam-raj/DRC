require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// Serve gallery images statically
const PUBLIC_DIR = path.join(__dirname, "../public");
app.use("/images", express.static(path.join(PUBLIC_DIR, "images")));

// ── File paths ──────────────────────────────────────────────────
const DATA_FILE    = path.join(__dirname, "members.json");
const CONFIG_FILE  = path.join(__dirname, "config.json");
const EVENTS_FILE  = path.join(__dirname, "events.json");
const SERVICES_FILE= path.join(__dirname, "services.json");
const GALLERY_FILE = path.join(__dirname, "gallery.json");
const GALLERY_DIR  = path.join(PUBLIC_DIR, "images/gallery");

// ── Multer (gallery image upload) ───────────────────────────────
const storage = multer.diskStorage({
  destination: GALLERY_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `gallery_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

// ── Init default data ───────────────────────────────────────────
const DEFAULT_EVENTS = [
  { id: "e1", date: "MAR 15", title: "Easter Prayer Vigil",       desc: "All night prayer and worship",         tag: "Upcoming" },
  { id: "e2", date: "MAR 22", title: "Easter Sunday Celebration", desc: "Grand worship & communion",            tag: "Special"  },
  { id: "e3", date: "APR 05", title: "Youth Retreat",             desc: "2-day spiritual retreat for youth",   tag: "Youth"    },
  { id: "e4", date: "APR 20", title: "Community Outreach",        desc: "Serving Mullakkadu community",        tag: "Outreach" },
];

const DEFAULT_SERVICES = [
  { id: "s1",  day: "All Days",     title: "Morning Service",    desc: "6:00 AM",  icon: "🌅" },
  { id: "s2",  day: "Sunday",       title: "Morning Service",    desc: "9:00 AM",  icon: "☀️" },
  { id: "s3",  day: "Daily",        title: "Evening Prayer",     desc: "7:00 PM",  icon: "🌙" },
  { id: "s4",  day: "Wednesday",    title: "Lithaniya",          desc: "7:00 PM",  icon: "🕯️" },
  { id: "s5",  day: "Friday",       title: "Free Service",       desc: "7:00 PM",  icon: "🔥" },
  { id: "s6",  day: "1st Friday",   title: "All Night Prayer",   desc: "7:00 PM",  icon: "⭐" },
  { id: "s7",  day: "2nd Sunday",   title: "Communion Service",  desc: "9:00 AM",  icon: "🍷" },
  { id: "s8",  day: "Last Sunday",  title: "Free Service",       desc: "9:00 AM",  icon: "✝️" },
  { id: "s9",  day: "3rd Saturday", title: "Fasting Prayer",     desc: "11:00 AM", icon: "🙏" },
  { id: "s10", day: "Monthly 1st",  title: "Promise Service",    desc: "6:00 AM",  icon: "🌟" },
  { id: "s11", day: "Monthly 1st",  title: "Communion Service",  desc: "6:00 PM",  icon: "🕊️" },
];

if (!fs.existsSync(DATA_FILE))    fs.writeFileSync(DATA_FILE,    JSON.stringify({ members: [] }, null, 2));
if (!fs.existsSync(EVENTS_FILE))  fs.writeFileSync(EVENTS_FILE,  JSON.stringify({ events: DEFAULT_EVENTS }, null, 2));
if (!fs.existsSync(SERVICES_FILE))fs.writeFileSync(SERVICES_FILE,JSON.stringify({ services: DEFAULT_SERVICES }, null, 2));
if (!fs.existsSync(GALLERY_FILE)) fs.writeFileSync(GALLERY_FILE, JSON.stringify({ images: [] }, null, 2));
if (!fs.existsSync(CONFIG_FILE))  fs.writeFileSync(CONFIG_FILE,  JSON.stringify({ smsApiKey: "", senderName: "DIVRCH", adminPassword: "admin@123", churchName: "Divine Resurrection Church, Mullakadu" }, null, 2));

// ── Helpers ─────────────────────────────────────────────────────
const read  = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));
const getMembers  = () => read(DATA_FILE).members;
const saveMembers = (m) => write(DATA_FILE, { members: m });
// Merge .env values into config at runtime (env takes priority)
const getConfig = () => {
  const c = read(CONFIG_FILE);
  if (process.env.SMS_API_KEY)    c.smsApiKey      = process.env.SMS_API_KEY;
  if (process.env.ADMIN_PASSWORD) c.adminPassword  = process.env.ADMIN_PASSWORD;
  if (process.env.CHURCH_NAME)    c.churchName     = process.env.CHURCH_NAME;
  return c;
};
const saveConfig  = (c) => write(CONFIG_FILE, c);
const getEvents   = () => read(EVENTS_FILE).events;
const saveEvents  = (e) => write(EVENTS_FILE, { events: e });
const getServices = () => read(SERVICES_FILE).services;
const saveServices= (s) => write(SERVICES_FILE, { services: s });
const getGallery  = () => read(GALLERY_FILE).images;
const saveGallery = (g) => write(GALLERY_FILE, { images: g });

// ── AUTH ────────────────────────────────────────────────────────
app.post("/api/auth/login", (req, res) => {
  const { adminPassword } = getConfig();
  if (req.body.password === adminPassword) res.json({ success: true });
  else res.status(401).json({ error: "Invalid password" });
});

// ── MEMBERS ─────────────────────────────────────────────────────
app.get("/api/members", (req, res) => res.json(getMembers()));
app.post("/api/members", (req, res) => {
  const members = getMembers();
  const m = { id: Date.now().toString(), ...req.body, createdAt: new Date().toISOString() };
  members.push(m); saveMembers(members); res.json(m);
});
app.put("/api/members/:id", (req, res) => {
  const members = getMembers();
  const i = members.findIndex(m => m.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "Not found" });
  members[i] = { ...members[i], ...req.body }; saveMembers(members); res.json(members[i]);
});
app.delete("/api/members/:id", (req, res) => {
  saveMembers(getMembers().filter(m => m.id !== req.params.id)); res.json({ success: true });
});

// ── EVENTS ──────────────────────────────────────────────────────
app.get("/api/events", (req, res) => res.json(getEvents()));
app.post("/api/events", (req, res) => {
  const events = getEvents();
  const e = { id: `e${Date.now()}`, ...req.body };
  events.push(e); saveEvents(events); res.json(e);
});
app.put("/api/events/:id", (req, res) => {
  const events = getEvents();
  const i = events.findIndex(e => e.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "Not found" });
  events[i] = { ...events[i], ...req.body }; saveEvents(events); res.json(events[i]);
});
app.delete("/api/events/:id", (req, res) => {
  saveEvents(getEvents().filter(e => e.id !== req.params.id)); res.json({ success: true });
});

// ── SERVICES ────────────────────────────────────────────────────
app.get("/api/services", (req, res) => res.json(getServices()));
app.post("/api/services", (req, res) => {
  const services = getServices();
  const s = { id: `s${Date.now()}`, ...req.body };
  services.push(s); saveServices(services); res.json(s);
});
app.put("/api/services/:id", (req, res) => {
  const services = getServices();
  const i = services.findIndex(s => s.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "Not found" });
  services[i] = { ...services[i], ...req.body }; saveServices(services); res.json(services[i]);
});
app.delete("/api/services/:id", (req, res) => {
  saveServices(getServices().filter(s => s.id !== req.params.id)); res.json({ success: true });
});

// ── GALLERY ─────────────────────────────────────────────────────
app.get("/api/gallery", (req, res) => res.json(getGallery()));

app.post("/api/gallery/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });
  const images = getGallery();
  const img = {
    id: `g${Date.now()}`,
    filename: req.file.filename,
    url: `/images/gallery/${req.file.filename}`,
    caption: req.body.caption || "",
    uploadedAt: new Date().toISOString(),
  };
  images.push(img); saveGallery(images); res.json(img);
});

app.delete("/api/gallery/:id", (req, res) => {
  const images = getGallery();
  const img = images.find(i => i.id === req.params.id);
  if (img) {
    const fp = path.join(GALLERY_DIR, img.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  saveGallery(images.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

app.put("/api/gallery/:id", (req, res) => {
  const images = getGallery();
  const i = images.findIndex(g => g.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "Not found" });
  images[i] = { ...images[i], ...req.body }; saveGallery(images); res.json(images[i]);
});

// ── CONFIG ──────────────────────────────────────────────────────
app.get("/api/config", (req, res) => {
  const c = getConfig();
  res.json({ senderName: c.senderName, churchName: c.churchName, hasSmsKey: !!c.smsApiKey, adminPassword: c.adminPassword });
});
app.put("/api/config", (req, res) => {
  saveConfig({ ...getConfig(), ...req.body }); res.json({ success: true });
});

// ── SMS ─────────────────────────────────────────────────────────
const sendSMS = async (phone, message) => {
  const { smsApiKey } = getConfig();
  if (!smsApiKey) throw new Error("SMS API key not configured");
  const params = new URLSearchParams({ authorization: smsApiKey, message, language: "english", route: "q", numbers: phone, flash: "0" });
  const { data } = await axios.get(`https://www.fast2sms.com/dev/bulkV2?${params}`);
  if (data.return === false || (data.status_code && data.status_code !== 200)) {
    throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message || "Fast2SMS error");
  }
  return data;
};

app.post("/api/sms/test", async (req, res) => {
  const { phone } = req.body;
  const { smsApiKey, churchName } = getConfig();
  if (!smsApiKey) return res.status(400).json({ success: false, error: "SMS API key not configured. Save your Fast2SMS API key in Settings first." });
  if (!phone)    return res.status(400).json({ success: false, error: "Phone number required" });
  try {
    const result = await sendSMS(phone, `Test SMS from ${churchName}. Birthday SMS system is working! God Bless You. ✝️`);
    console.log(`✅ Test SMS sent to ${phone}`); res.json({ success: true, result });
  } catch (err) {
    console.error(`❌ Test SMS failed: ${err.message}`);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── BIRTHDAY SMS ────────────────────────────────────────────────
app.get("/api/birthdays/today", (req, res) => {
  const today = new Date();
  const mmdd = `${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  res.json(getMembers().filter(m => m.birthday && m.birthday.slice(5) === mmdd));
});

app.post("/api/birthdays/send-now", async (req, res) => {
  const { smsApiKey } = getConfig();
  if (!smsApiKey) return res.status(400).json({ success: false, error: "SMS API key not configured. Go to Settings." });
  const today = new Date();
  const mmdd = `${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const birthday = getMembers().filter(m => m.birthday && m.birthday.slice(5) === mmdd);
  if (!birthday.length) return res.json({ success: true, membersNotified: 0, members: [] });
  const { churchName } = getConfig();
  const results = [];
  for (const m of birthday) {
    try {
      await sendSMS(m.phone, `🎂 Happy Birthday, ${m.name}! Wishing you abundant blessings on your special day. With love, ${churchName}.`);
      console.log(`✅ Birthday SMS → ${m.name}`); results.push({ ...m, sent: true });
    } catch (err) {
      console.error(`❌ ${m.name}: ${err.message}`); results.push({ ...m, sent: false, error: err.message });
    }
  }
  res.json({ success: results.some(r => r.sent), membersNotified: results.filter(r => r.sent).length, results });
});

// ── CRON — 8:00 AM daily ────────────────────────────────────────
cron.schedule("0 8 * * *", async () => {
  console.log("🕗 Daily birthday check...");
  const today = new Date();
  const mmdd = `${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const { churchName } = getConfig();
  for (const m of getMembers().filter(m => m.birthday && m.birthday.slice(5) === mmdd)) {
    try { await sendSMS(m.phone, `🎂 Happy Birthday, ${m.name}! Wishing you abundant blessings. With love, ${churchName}.`); console.log(`✅ ${m.name}`); }
    catch (err) { console.error(`❌ ${m.name}: ${err.message}`); }
  }
});

// ── START ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`
╔══════════════════════════════════════════════╗
║   Divine Resurrection Church - Server        ║
║   Running on http://localhost:${PORT}           ║
║   Birthday SMS: Daily at 8:00 AM             ║
╚══════════════════════════════════════════════╝
`));
