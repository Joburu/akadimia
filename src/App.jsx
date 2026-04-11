import{useState,useEffect,useRef,createContext,useContext}from"react";
import ReactMarkdown from"react-markdown";
import remarkMath from"remark-math";
import rehypeKatex from"rehype-katex";
import{supabase}from"./supabase.js";
import{askClaude,signIn,signUp,signOut,getProfile,getPendingUsers,updateUserStatus}from"./api.js";
import Landing from"./Landing.jsx";
import{AreaChart,Area,BarChart,Bar,RadarChart,Radar,PolarGrid,PolarAngleAxis,XAxis,YAxis,ResponsiveContainer,Tooltip}from"recharts";

/* AKADIMIA v4.2  ·  "Ujuzi Bila Mipaka"  ·  Knowledge Without Limits */

const rgba=(hex,a=1)=>{const h=hex.replace("#","");return`rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};

const THEMES={
  navy:{id:"navy",name:"Akademia Blue",emoji:"🌊",bg0:"#060915",bg1:"#0B0F1F",bg2:"#101626",bg3:"#161D33",bg4:"#1C2440",bg5:"#22294D",ac:"#D4A843",acL:"#ECC462",blue:"#3B82F6",teal:"#0D9488",purple:"#7C3AED",red:"#EF4444",green:"#16A34A",amber:"#D97706",cyan:"#0891B2",t1:"#F0F2FA",t2:"#8892B0",t3:"#3E4A6A",bd:"#18203E"},
  savanna:{id:"savanna",name:"Savanna Dusk",emoji:"🌅",bg0:"#100A04",bg1:"#180E06",bg2:"#1F1208",bg3:"#281609",bg4:"#321C0C",bg5:"#3C210F",ac:"#E8823A",acL:"#F4A462",blue:"#60A5FA",teal:"#34D399",purple:"#A78BFA",red:"#F87171",green:"#22C55E",amber:"#FBBF24",cyan:"#22D3EE",t1:"#FDF3E7",t2:"#B8946A",t3:"#6B4A2A",bd:"#3A1F0A"},
  forest:{id:"forest",name:"Msitu Forest",emoji:"🌿",bg0:"#030D07",bg1:"#061209",bg2:"#08180C",bg3:"#0B1F10",bg4:"#0E2715",bg5:"#12301B",ac:"#4ADE80",acL:"#86EFAC",blue:"#60A5FA",teal:"#2DD4BF",purple:"#C084FC",red:"#F87171",green:"#4ADE80",amber:"#FCD34D",cyan:"#22D3EE",t1:"#F0FDF4",t2:"#6EE7B7",t3:"#1B5E3B",bd:"#0D2E16"},
  dusk:{id:"dusk",name:"Usiku Dusk",emoji:"🌙",bg0:"#07030F",bg1:"#0D0618",bg2:"#120821",bg3:"#180A2C",bg4:"#1E0C38",bg5:"#260E46",ac:"#A855F7",acL:"#C084FC",blue:"#60A5FA",teal:"#2DD4BF",purple:"#EC4899",red:"#F87171",green:"#34D399",amber:"#FCD34D",cyan:"#22D3EE",t1:"#F5F0FF",t2:"#9F7ECA",t3:"#4B3075",bd:"#220C42"},
  ocean:{id:"ocean",name:"Bahari Ocean",emoji:"🐋",bg0:"#030B12",bg1:"#061119",bg2:"#091822",bg3:"#0D1F2D",bg4:"#112638",bg5:"#152E43",ac:"#06B6D4",acL:"#22D3EE",blue:"#3B82F6",teal:"#0D9488",purple:"#7C3AED",red:"#F87171",green:"#22C55E",amber:"#FCD34D",cyan:"#67E8F9",t1:"#E0F7FA",t2:"#7CB9C8",t3:"#1C4A5A",bd:"#0E2435"},
  light:{id:"light",name:"Pearl White",emoji:"☀️",bg0:"#F8F9FC",bg1:"#FFFFFF",bg2:"#F1F3F9",bg3:"#E8ECF4",bg4:"#DDE3EF",bg5:"#D0D8EB",ac:"#2563EB",acL:"#3B82F6",blue:"#1D4ED8",teal:"#0D9488",purple:"#7C3AED",red:"#DC2626",green:"#16A34A",amber:"#D97706",cyan:"#0891B2",t1:"#0F172A",t2:"#475569",t3:"#94A3B8",bd:"#CBD5E1"},
  rose:{id:"rose",name:"Rose Gold",emoji:"🌸",bg0:"#1A0A0F",bg1:"#240D15",bg2:"#2E101B",bg3:"#3A1422",bg4:"#46192A",bg5:"#531E33",ac:"#FB7185",acL:"#FDA4AF",blue:"#60A5FA",teal:"#2DD4BF",purple:"#C084FC",red:"#F43F5E",green:"#4ADE80",amber:"#FCD34D",cyan:"#22D3EE",t1:"#FFF1F2",t2:"#FCA5A5",t3:"#7F1D1D",bd:"#4C1524"},
  slate:{id:"slate",name:"Arctic Slate",emoji:"❄️",bg0:"#0C1222",bg1:"#111827",bg2:"#1F2937",bg3:"#374151",bg4:"#4B5563",bg5:"#6B7280",ac:"#38BDF8",acL:"#7DD3FC",blue:"#3B82F6",teal:"#14B8A6",purple:"#8B5CF6",red:"#EF4444",green:"#22C55E",amber:"#F59E0B",cyan:"#06B6D4",t1:"#F9FAFB",t2:"#9CA3AF",t3:"#4B5563",bd:"#374151"},
  emerald:{id:"emerald",name:"Emerald City",emoji:"💚",bg0:"#021207",bg1:"#03180A",bg2:"#041F0D",bg3:"#062910",bg4:"#083314",bg5:"#0A3E18",ac:"#10B981",acL:"#34D399",blue:"#60A5FA",teal:"#2DD4BF",purple:"#A78BFA",red:"#F87171",green:"#10B981",amber:"#FCD34D",cyan:"#22D3EE",t1:"#ECFDF5",t2:"#6EE7B7",t3:"#065F46",bd:"#064E3B"},
  kenya:{id:"kenya",name:"Kenyan Sunset",emoji:"🇰🇪",bg0:"#1A0A00",bg1:"#221200",bg2:"#2C1800",bg3:"#3A2000",bg4:"#4A2800",bg5:"#5C3200",ac:"#CE1126",acL:"#E8304A",blue:"#006600",teal:"#228B22",purple:"#8B4513",red:"#CE1126",green:"#006600",amber:"#FFD700",cyan:"#228B22",t1:"#FFF8F0",t2:"#D4956A",t3:"#8B5E3C",bd:"#5C3200"},
};

const LANGS={en:{flag:"🇬🇧",name:"English"},sw:{flag:"🇰🇪",name:"Kiswahili"},luo:{flag:"🌊",name:"Dholuo"},kik:{flag:"🏔",name:"Gikuyu"},luh:{flag:"🌾",name:"Luhya"},kal:{flag:"⛰",name:"Kalenjin"},som:{flag:"🌙",name:"Af Soomaali"},fr:{flag:"🇫🇷",name:"Français"},ar:{flag:"🇸🇦",name:"العربية"},zh:{flag:"🇨🇳",name:"中文"},ja:{flag:"🇯🇵",name:"日本語"},es:{flag:"🇪🇸",name:"Español"},zu:{flag:"🇿🇦",name:"IsiZulu"}};

const LS={
  en:{welcome:"Welcome back",dashboard:"Dashboard",courses:"Courses",exams:"Exams",assignments:"Assignments",research:"Research",ai:"AI Tutor",calendar:"Calendar",meetings:"Meetings",opps:"Opportunities",analytics:"Analytics",tools:"Tools Hub",transcript:"Transcript",peers:"Peers",classroom:"My Classroom",admin:"Admin",settings:"Settings",signIn:"Sign In",register:"Register",pending:"Pending Approval",fieldSelect:"Choose Your Field",approve:"Approve",reject:"Reject",pendingApprovals:"Pending Approvals",online:"Online",offline:"Offline",send:"Send",ask:"Ask EduBot anything..."},
  sw:{welcome:"Karibu tena",dashboard:"Dashibodi",courses:"Kozi",exams:"Mitihani",assignments:"Kazi",research:"Utafiti",ai:"Msaidizi AI",calendar:"Kalenda",meetings:"Mikutano",opps:"Fursa",analytics:"Uchambuzi",tools:"Zana",transcript:"Rekodi",peers:"Wanafunzi",classroom:"Darasa Langu",admin:"Msimamizi",settings:"Mipangilio",signIn:"Ingia",register:"Jisajili",pending:"Inasubiri Idhini",fieldSelect:"Chagua Taaluma",approve:"Idhini",reject:"Kataa",pendingApprovals:"Wanasubiri",online:"Mtandaoni",offline:"Nje ya Mtandao",send:"Tuma",ask:"Uliza chochote..."},
  luo:{welcome:"Chopi kendo",dashboard:"Ongechore",courses:"Somo",exams:"Sicha",assignments:"Tich",research:"Penjo",ai:"Jatij AI",calendar:"Agend",meetings:"Chokruok",opps:"Thuolo",analytics:"Changruok",tools:"Gik",transcript:"Rekod",peers:"Osiepe",classroom:"Punde ma Akia",admin:"Jatelo",settings:"Genruok",signIn:"Donj",register:"Ndik",pending:"Koro Yie",fieldSelect:"Yie Somo Mari",approve:"Yie",reject:"Kwer",pendingApprovals:"Koro Yie",online:"E Intaneti",offline:"Oko mar Intaneti",send:"Or",ask:"Penj EduBot gimoro..."},
  kik:{welcome:"Nĩwega gũcooka",dashboard:"Dashibodi",courses:"Mĩsomo",exams:"Maĩtĩo",assignments:"Wĩra",research:"Ũhoro wa Ũtaaro",ai:"Mũteithia wa AI",calendar:"Kalanda",meetings:"Mĩtĩnge",opps:"Mĩkaro",analytics:"Ũtooro",tools:"Mathĩ",transcript:"Rekodi",peers:"Andũ Ariũ",classroom:"Kĩhingo Gĩakwa",admin:"Ũtungati",settings:"Mĩstatoro",signIn:"Injira",register:"Ĩhĩta",pending:"Rĩga Ũteithio",fieldSelect:"Chagua Mũhĩriga",approve:"Tĩkia",reject:"Kana",pendingApprovals:"Arĩa Magĩtĩirie",online:"Mũtaro",offline:"Ndĩ na Mũtaro",send:"Tuma",ask:"Ũria EduBot..."},
  luh:{welcome:"Mulembe, Wafwene",dashboard:"Dashibodi",courses:"Izifunzo",exams:"Izizamo",assignments:"Omukozi",research:"Obunyosi",ai:"Omufwatsi wa AI",calendar:"Kalenda",meetings:"Emigaano",opps:"Emyanya",analytics:"Obuteekateeka",tools:"Ebikolesebwa",transcript:"Rekodi",peers:"Abawe",classroom:"Ekibiina Kyange",admin:"Omutawala",settings:"Ebiteekwa",signIn:"Ingira",register:"Ehandikha",pending:"Liindila Ilihala",fieldSelect:"Sala Isomo Lyako",approve:"Lihala",reject:"Kana",pendingApprovals:"Abaliindila",online:"Mu Intaneti",offline:"Tali Mu Intaneti",send:"Tuma",ask:"Buuza EduBot..."},
  kal:{welcome:"Chamgei, Koech",dashboard:"Dashibodi",courses:"Chepkwony",exams:"Chechei",assignments:"Ngechek",research:"Kibwobwek",ai:"Mwai wa AI",calendar:"Kalenda",meetings:"Kabwobwek",opps:"Chetinwek",analytics:"Koboiyot",tools:"Osiywek",transcript:"Rekodi",peers:"Chepkogik",classroom:"Lepwon Kole",admin:"Koboiyotnik",settings:"Koboiyowet",signIn:"Nyor",register:"Isoiyot",pending:"Nyor Koboiyot",fieldSelect:"Chob Chepkwony",approve:"Koboiyot",reject:"Muche",pendingApprovals:"Chepnyor",online:"Kora Internet",offline:"Mochi Internet",send:"Tum",ask:"Penjo EduBot..."},
  som:{welcome:"Ku soo dhawoow",dashboard:"Bogga Guud",courses:"Koorsooyin",exams:"Imtixaanno",assignments:"Hawlo",research:"Cilmi-baadhis",ai:"Kaaliye AI",calendar:"Kalandarka",meetings:"Shirarka",opps:"Fursadaha",analytics:"Falanqaynta",tools:"Qaladaadka",transcript:"Diiwaanka",peers:"Saaxiibada",classroom:"Fasalkaygii",admin:"Maamulaha",settings:"Dejinta",signIn:"Gal",register:"Diiwaan geli",pending:"Sugaya Oggolaanshaha",fieldSelect:"Dooro Cilmiga",approve:"Oggolow",reject:"Diiyi",pendingApprovals:"Sugayaan",online:"Online",offline:"Offline",send:"Dir",ask:"Weydii EduBot wax..."},
  fr:{welcome:"Bon retour",dashboard:"Tableau de bord",courses:"Cours",exams:"Examens",assignments:"Devoirs",research:"Recherche",ai:"Tuteur IA",calendar:"Calendrier",meetings:"Réunions",opps:"Opportunités",analytics:"Analytique",tools:"Outils",transcript:"Relevé de notes",peers:"Pairs",classroom:"Ma salle",admin:"Admin",settings:"Paramètres",signIn:"Se connecter",register:"S'inscrire",pending:"En attente",fieldSelect:"Choisir un domaine",approve:"Approuver",reject:"Rejeter",pendingApprovals:"En attente",online:"En ligne",offline:"Hors ligne",send:"Envoyer",ask:"Demandez à EduBot..."},
  ar:{welcome:"مرحباً بعودتك",dashboard:"لوحة التحكم",courses:"المقررات",exams:"الامتحانات",assignments:"الواجبات",research:"البحث",ai:"المعلم الذكي",calendar:"التقويم",meetings:"الاجتماعات",opps:"الفرص",analytics:"التحليلات",tools:"الأدوات",transcript:"السجل الأكاديمي",peers:"الأقران",classroom:"فصلي",admin:"الإدارة",settings:"الإعدادات",signIn:"تسجيل الدخول",register:"التسجيل",pending:"في انتظار الموافقة",fieldSelect:"اختر تخصصك",approve:"موافقة",reject:"رفض",pendingApprovals:"في الانتظار",online:"متصل",offline:"غير متصل",send:"إرسال",ask:"اسأل EduBot..."},
  zh:{welcome:"欢迎回来",dashboard:"仪表板",courses:"课程",exams:"考试",assignments:"作业",research:"研究",ai:"AI辅导",calendar:"日历",meetings:"会议",opps:"机会",analytics:"分析",tools:"工具",transcript:"成绩单",peers:"同学",classroom:"我的课堂",admin:"管理",settings:"设置",signIn:"登录",register:"注册",pending:"待审批",fieldSelect:"选择专业",approve:"批准",reject:"拒绝",pendingApprovals:"待审批",online:"在线",offline:"离线",send:"发送",ask:"向EduBot提问..."},
  ja:{welcome:"お帰りなさい",dashboard:"ダッシュボード",courses:"コース",exams:"試験",assignments:"課題",research:"研究",ai:"AIチューター",calendar:"カレンダー",meetings:"ミーティング",opps:"機会",analytics:"分析",tools:"ツール",transcript:"成績証明書",peers:"仲間",classroom:"マイクラス",admin:"管理",settings:"設定",signIn:"サインイン",register:"登録",pending:"承認待ち",fieldSelect:"分野を選択",approve:"承認",reject:"拒否",pendingApprovals:"承認待ち",online:"オンライン",offline:"オフライン",send:"送信",ask:"EduBotに質問..."},
  es:{welcome:"Bienvenido de nuevo",dashboard:"Panel",courses:"Cursos",exams:"Exámenes",assignments:"Tareas",research:"Investigación",ai:"Tutor IA",calendar:"Calendario",meetings:"Reuniones",opps:"Oportunidades",analytics:"Análisis",tools:"Herramientas",transcript:"Expediente",peers:"Compañeros",classroom:"Mi aula",admin:"Admin",settings:"Configuración",signIn:"Iniciar sesión",register:"Registrarse",pending:"Pendiente",fieldSelect:"Elegir campo",approve:"Aprobar",reject:"Rechazar",pendingApprovals:"Pendientes",online:"En línea",offline:"Sin conexión",send:"Enviar",ask:"Pregunta a EduBot..."},
  zu:{welcome:"Wamukelekile futhi",dashboard:"Ibhodi",courses:"Izifundo",exams:"Izivivinyo",assignments:"Imisebenzi",research:"Ucwaningo",ai:"Umfundisi we-AI",calendar:"Ikhalenda",meetings:"Izihlangano",opps:"Amathuba",analytics:"Ukuhlaziya",tools:"Amathuluzi",transcript:"Irekhodi",peers:"Izintanga",classroom:"Ikilasi Lami",admin:"Umlawuli",settings:"Izilungiselelo",signIn:"Ngena",register:"Bhalisa",pending:"Ilindile",fieldSelect:"Khetha inkundla",approve:"Vuma",reject:"Nqaba",pendingApprovals:"Balindile",online:"Ku-intanethi",offline:"Ngaphandle kwe-intanethi",send:"Thumela",ask:"Buza u-EduBot..."},
};
const LS_STUB={welcome:"Karibu",dashboard:"Dashboard",courses:"Courses",exams:"Exams",assignments:"Assignments",research:"Research",ai:"AI",calendar:"Calendar",meetings:"Meetings",opps:"Opportunities",analytics:"Analytics",tools:"Tools",transcript:"Transcript",peers:"Peers",classroom:"Classroom",admin:"Admin",settings:"Settings",signIn:"Sign In",register:"Register",pending:"Pending",fieldSelect:"Choose Field",approve:"Approve",reject:"Reject",pendingApprovals:"Pending",online:"Online",offline:"Offline",send:"Send",ask:"Ask..."};



async function checkAndLogUsage(supabase, userId, feature, limit) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const {data} = await supabase.from("ai_usage").select("id").eq("user_id",userId).eq("feature",feature).gte("used_at",today.toISOString());
  const count = data?.length || 0;
  if(count >= limit) return false;
  await supabase.from("ai_usage").insert({user_id:userId, feature});
  return true;
}

async function callAI(prompt, maxTokens=1000) {
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_KEY;
  const groqKey = import.meta.env.VITE_GROQ_KEY;
  if (anthropicKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {"Content-Type":"application/json","x-api-key":anthropicKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:maxTokens,messages:[{role:"user",content:prompt}]})
      });
      const d = await res.json();
      if (d.content) return d.content.filter(c=>c.type==="text").map(c=>c.text).join("");
    } catch(e) { console.log("Anthropic failed, trying Groq:", e); }
  }
  if (groqKey) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {"Content-Type":"application/json","Authorization":"Bearer "+groqKey},
      body: JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:maxTokens,messages:[{role:"user",content:prompt}]})
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content || "No response";
  }
  return "AI service unavailable.";
}

async function callGemini(prompt, maxTokens=1000) {
  const geminiKey = import.meta.env.VITE_GEMINI_KEY;
  const groqKey = import.meta.env.VITE_GROQ_KEY;
  if (geminiKey) {
    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+geminiKey, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:maxTokens}})
      });
      if(res.status===429){console.log("Gemini rate limited, falling back to Groq");}
      else{
        const d = await res.json();
        const text=d.candidates?.[0]?.content?.parts?.[0]?.text;
        if(text) return text;
      }
    } catch(e) { console.log("Gemini failed, trying Groq:", e); }
  }
  if (groqKey) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {"Content-Type":"application/json","Authorization":"Bearer "+groqKey},
      body: JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:maxTokens,messages:[{role:"user",content:prompt}]})
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content || "No response";
  }
  return "AI service unavailable.";
}

const FIELDS={
  actuarial:   {id:"actuarial",   name:"Actuarial Science",   icon:"📊",color:"#D4A843",group:"Sciences",   desc:"Risk, insurance & financial modelling"},
  medicine:    {id:"medicine",    name:"Medicine & Surgery",   icon:"🩺",color:"#EF4444",group:"Health",     desc:"Clinical medicine, surgery & health sciences",tools:["SPSS","STATA","R","NVivo","Epi Info"]},
  law:         {id:"law",         name:"Law",                  icon:"⚖️",color:"#7C3AED",group:"Social Sci.",desc:"Legal studies, jurisprudence & constitutional law",tools:["Zotero","LexisNexis","Westlaw","SPSS","NVivo"]},
  engineering: {id:"engineering", name:"Engineering",          icon:"⚙️",color:"#3B82F6",group:"Technology", desc:"Civil, electrical, mechanical & structural",tools:["AutoCAD","MATLAB","Python","SolidWorks","SAP2000"]},
  compsci:     {id:"compsci",     name:"Computer Science",     icon:"💻",color:"#0D9488",group:"Technology", desc:"Algorithms, AI, systems & software development",tools:["Python","Git","SQL","Docker","JavaScript"]},
  business:    {id:"business",    name:"Business & Commerce",  icon:"💼",color:"#F59E0B",group:"Social Sci.",desc:"Accounting, finance, marketing & strategy",tools:["Excel","SPSS","STATA","Python","R"]},
  education:   {id:"education",   name:"Education",            icon:"✏️",color:"#10B981",group:"Social Sci.",desc:"Pedagogy, curriculum & educational psychology",tools:["SPSS","NVivo","STATA","Zotero","Atlas.ti"]},
  agriculture: {id:"agriculture", name:"Agriculture",          icon:"🌾",color:"#84CC16",group:"Sciences",   desc:"Crop science, soil science & agribusiness",tools:["R","STATA","SAS","Python","GIS"]},
  nursing:     {id:"nursing",     name:"Nursing & Midwifery",  icon:"💊",color:"#EC4899",group:"Health",     desc:"Clinical nursing, pharmacology & maternal health",tools:["SPSS","STATA","NVivo","Zotero","Epi Info"]},
  architecture:{id:"architecture",name:"Architecture",         icon:"🏛️",color:"#6366F1",group:"Technology", desc:"Design, structural analysis & urban planning",tools:["AutoCAD","SketchUp","Revit","Rhino","MATLAB"]},
  puremaths:   {id:"puremaths",   name:"Pure Mathematics",     icon:"∞",  color:"#8B5CF6",group:"Sciences",   desc:"Abstract algebra, analysis, topology & number theory",tools:["Python","MATLAB","LaTeX","Wolfram Alpha","Sage"]},
  appliedmaths:{id:"appliedmaths",name:"Applied Mathematics",  icon:"📐", color:"#06B6D4",group:"Sciences",   desc:"Mathematical modelling, ODEs, numerical methods",tools:["MATLAB","Python","R","LaTeX","Mathematica"]},
  appstats:    {id:"appstats",    name:"Applied Statistics",   icon:"📈", color:"#F97316",group:"Sciences",   desc:"Statistical inference, data analysis & biostatistics",tools:["R","Python","STATA","SPSS","SAS"]},
  entrepreneurship:{id:"entrepreneurship",name:"Entrepreneurship",icon:"🚀",color:"#EAB308",group:"Social Sci.",desc:"Startup ecosystems, innovation & business development",tools:["Excel","Python","Canva","SPSS","WordPress"]},
  publichealth:{id:"publichealth",name:"Public Health",        icon:"🏥", color:"#14B8A6",group:"Health",     desc:"Epidemiology, health policy & community health",tools:["R","SPSS","STATA","Epi Info","NVivo"]},
  economics:   {id:"economics",   name:"Economics",            icon:"💹", color:"#A855F7",group:"Social Sci.",desc:"Micro/macro economics, econometrics & development",tools:["STATA","R","Python","EViews","Excel"]},
  pharmacy:    {id:"pharmacy",    name:"Pharmacy",             icon:"💉", color:"#F43F5E",group:"Health",     desc:"Pharmacology, clinical pharmacy & drug development",tools:["SPSS","R","STATA","Zotero","NVivo"]},
  psychology:  {id:"psychology",  name:"Psychology",           icon:"🧠", color:"#8B5CF6",group:"Social Sci.",desc:"Behavioural science, counselling & neuropsychology",tools:["SPSS","R","NVivo","Atlas.ti","Zotero"]},
  envscience:  {id:"envscience",  name:"Environmental Science",icon:"🌍", color:"#22C55E",group:"Sciences",   desc:"Climate change, ecology & environmental management",tools:["R","GIS","Python","STATA","QGIS"]},
  socialwork:  {id:"socialwork",  name:"Social Work",          icon:"🤝", color:"#F472B6",group:"Social Sci.",desc:"Community development, counselling & social policy"},
  communication:{id:"communication",name:"Communication",      icon:"📡", color:"#60A5FA",group:"Social Sci.",desc:"Media studies, journalism & public relations"},
  fintech:     {id:"fintech",     name:"Finance & Banking",    icon:"🏦", color:"#34D399",group:"Professional",desc:"Banking, investment, financial analysis & fintech"},
  hrm:         {id:"hrm",        name:"Human Resource Mgmt",  icon:"👔", color:"#A78BFA",group:"Professional",desc:"HR strategy, labour law & organizational behaviour"},
  supplychain: {id:"supplychain",name:"Supply Chain & Logistics",icon:"🚚",color:"#FB923C",group:"Professional",desc:"Procurement, logistics & operations management"},
  ict:         {id:"ict",        name:"ICT & Networking",      icon:"🌐", color:"#22D3EE",group:"Technology", desc:"Networks, cybersecurity & IT infrastructure"},
  electricaleng:{id:"electricaleng",name:"Electrical Engineering",icon:"⚡",color:"#FCD34D",group:"Technology",desc:"Power systems, electronics & control engineering"},
  civileng:    {id:"civileng",   name:"Civil Engineering",     icon:"🏗️", color:"#94A3B8",group:"Technology", desc:"Structural, transport & water resources engineering"},
  tourism:     {id:"tourism",    name:"Tourism & Hospitality", icon:"✈️", color:"#F87171",group:"Social Sci.",desc:"Hotel management, ecotourism & event management"},
  artdesign:   {id:"artdesign",  name:"Art & Design",          icon:"🎨", color:"#C084FC",group:"Creative",   desc:"Fine art, graphic design & visual communication"},
  music:       {id:"music",      name:"Music & Performing Arts",icon:"🎵",color:"#F9A8D4",group:"Creative",   desc:"Music theory, performance & creative arts"},
  theology:    {id:"theology",   name:"Theology & Religion",   icon:"✝️", color:"#A16207",group:"Humanities", desc:"Religious studies, ethics & theology"},
  history:     {id:"history",    name:"History & Political Sci",icon:"📜",color:"#78716C",group:"Humanities", desc:"African history, political theory & governance"},
  tvet_elec:   {id:"tvet_elec",  name:"TVET — Electrical",     icon:"🔌", color:"#FCD34D",group:"TVET",       desc:"Electrical installation, wiring & power systems"},
  tvet_mech:   {id:"tvet_mech",  name:"TVET — Mechanical",     icon:"🔧", color:"#6B7280",group:"TVET",       desc:"Motor vehicle, welding & mechanical engineering"},
  tvet_ict:    {id:"tvet_ict",   name:"TVET — ICT",            icon:"🖥️", color:"#3B82F6",group:"TVET",       desc:"Computer repair, networking & ICT support"},
  tvet_build:  {id:"tvet_build", name:"TVET — Building",       icon:"🧱", color:"#D97706",group:"TVET",       desc:"Masonry, plumbing & building construction"},
  tvet_fashion:{id:"tvet_fashion",name:"TVET — Fashion",       icon:"👗", color:"#EC4899",group:"TVET",       desc:"Garment making, textile design & fashion"},
  tvet_food:   {id:"tvet_food",  name:"TVET — Food & Nutrition",icon:"🍽️",color:"#22C55E",group:"TVET",       desc:"Catering, food production & nutrition"},
  tvet_beauty: {id:"tvet_beauty",name:"TVET — Beauty & Hair",  icon:"💇", color:"#F472B6",group:"TVET",       desc:"Cosmetology, hairdressing & beauty therapy"},
};

const FIELD_DATA={
  actuarial:   {courses:[{code:"SAC 101",name:"Principles of Actuarial Science",y:1,p:88},{code:"SAC 201",name:"Financial Mathematics I",y:2,p:62},{code:"SAS 305",name:"Stochastic Processes I",y:3,p:40},{code:"SAC 406",name:"Risk & Credibility Theory",y:4,p:20}],bodies:["Actuarial Society of Kenya (ASK)","IFoA UK","SOA USA"],tools:["Python","R","STATA","SPSS","LaTeX"],trends:["Climate risk modelling","InsurTech AI","Parametric insurance","EA pension reform"],opps:[
    {type:"job",org:"APA Insurance",title:"Junior Actuarial Analyst",dead:"May 30",link:"https://www.apainsurance.org/careers"},
    {type:"job",org:"Britam Kenya",title:"Actuarial Graduate Trainee",dead:"Jun 15",link:"https://www.britam.com/ke/careers"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF Postgraduate Scholarship 2026",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"DAAD Germany",title:"DAAD In-Country Scholarship",dead:"Jul 15",link:"https://www.daad.de/en"},
    {type:"scholarship",org:"AfDB",title:"AfDB Scholarship Programme",dead:"Jun 1",link:"https://www.afdb.org/scholarships"},
    {type:"grant",org:"NRF Kenya",title:"NRF Research Grant — Risk & Insurance",dead:"Jul 31",link:"https://www.nrf.ac.ke/grants"},
    {type:"grant",org:"IDRC Canada",title:"IDRC Research Award — Africa",dead:"Aug 15",link:"https://www.idrc.ca"},
    {type:"training",org:"IFoA UK",title:"IFoA CM1 Actuarial Mathematics",dead:"May 20",link:"https://www.actuaries.org.uk"},
    {type:"training",org:"SOA USA",title:"SOA Exam P Preparation",dead:"Jun 10",link:"https://www.soa.org"},
    {type:"networking",org:"ASK Kenya",title:"ASK Annual Conference 2026",dead:"Aug 1",link:"https://www.actuarialkenya.org"},
    {type:"networking",org:"IRA Kenya",title:"East Africa Insurance Summit",dead:"Sep 5",link:"https://www.ira.go.ke"}
  ]},
  medicine:    {courses:[{code:"MED 101",name:"Human Anatomy I",y:1,p:75},{code:"MED 102",name:"Human Physiology",y:1,p:68},{code:"MED 201",name:"Pathology & Microbiology",y:2,p:55},{code:"MED 301",name:"Clinical Medicine",y:3,p:48}],bodies:["Kenya Med & Dentists Board","Kenya Medical Association","COSECSA"],tools:["SPSS","STATA","R","NVivo"],trends:["Digital health Kenya","AI diagnostics","Community health workers","Universal Health Coverage"],opps:[
    {type:"job",org:"KNH Nairobi",title:"Medical Intern 2026",dead:"Jun 30",link:"https://www.knh.or.ke"},
    {type:"job",org:"Aga Khan Hospital",title:"Junior Medical Officer",dead:"Jul 15",link:"https://www.agakhanhospitals.org"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF Health Sciences Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"WHO AFRO",title:"WHO AFRO Fellowship 2026",dead:"Jul 1",link:"https://www.afro.who.int"},
    {type:"scholarship",org:"Wellcome Trust",title:"Wellcome Africa Research Award",dead:"Aug 15",link:"https://wellcome.org"},
    {type:"grant",org:"KEMRI",title:"KEMRI Research Grant",dead:"Jul 31",link:"https://www.kemri.org"},
    {type:"grant",org:"NIH Fogarty",title:"NIH Fogarty Global Health Grant",dead:"Sep 1",link:"https://www.fic.nih.gov"},
    {type:"training",org:"Kenya Red Cross",title:"Advanced Life Support (ALS)",dead:"May 30",link:"https://www.redcross.or.ke"},
    {type:"training",org:"COSECSA",title:"COSECSA Surgical Fellowship",dead:"Jun 15",link:"https://www.cosecsa.org"},
    {type:"networking",org:"KMA",title:"Kenya Medical Association Forum",dead:"Aug 20",link:"https://www.kma.co.ke"},
    {type:"networking",org:"AMSEA",title:"Association of Medical Students EA",dead:"Sep 10",link:"https://www.amsea.org"}
  ]},
  law:         {courses:[{code:"LAW 101",name:"Legal Methods & Research",y:1,p:82},{code:"LAW 102",name:"Contract Law",y:1,p:74},{code:"LAW 201",name:"Constitutional & Admin Law",y:2,p:61},{code:"LAW 301",name:"Criminal Law & Procedure",y:3,p:53}],bodies:["Law Society of Kenya (LSK)","East Africa Law Society","Kenya School of Law"],tools:["Zotero","LexisNexis","SPSS","Westlaw"],trends:["Legal tech Kenya","Data protection law","Climate litigation","Constitutional reforms"],opps:[
    {type:"job",org:"Judiciary Kenya",title:"Legal Researcher/Clerk",dead:"Jun 30",link:"https://www.judiciary.go.ke"},
    {type:"job",org:"Kenya Law Reform",title:"Legal Officer — Graduate",dead:"Jul 15",link:"https://www.kenyalaw.org"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF Postgraduate Law Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"EALS",title:"East Africa Law Society Prize",dead:"Jul 20",link:"https://www.eals.org"},
    {type:"scholarship",org:"Rhodes Trust",title:"Rhodes Scholarship — Kenya",dead:"Aug 1",link:"https://www.rhodeshouse.ox.ac.uk"},
    {type:"grant",org:"Ford Foundation",title:"Ford Foundation Legal Research Grant",dead:"Aug 31",link:"https://www.fordfoundation.org"},
    {type:"grant",org:"Open Society",title:"OSF Africa Legal Fellowship",dead:"Sep 15",link:"https://www.opensocietyfoundations.org"},
    {type:"training",org:"LSK Kenya",title:"LSK Moot Court Competition",dead:"May 10",link:"https://www.lsk.or.ke"},
    {type:"training",org:"Kenya School of Law",title:"Advocates Training Programme",dead:"Jun 1",link:"https://www.ksl.ac.ke"},
    {type:"networking",org:"LSK Kenya",title:"LSK Annual Law Conference",dead:"Aug 15",link:"https://www.lsk.or.ke"},
    {type:"networking",org:"EALS",title:"EA Law Society Annual Congress",dead:"Sep 20",link:"https://www.eals.org"}
  ]},
  engineering: {courses:[{code:"ENG 101",name:"Engineering Mathematics",y:1,p:80},{code:"ENG 102",name:"Engineering Mechanics",y:1,p:65},{code:"ENG 201",name:"Thermodynamics",y:2,p:54},{code:"ENG 301",name:"Structural Analysis",y:3,p:44}],bodies:["Engineers Board of Kenya (EBK)","Institution of Engineers Kenya","FIDIC"],tools:["MATLAB","Python","AutoCAD","STATA"],trends:["Green building Kenya","Renewable energy","Smart infrastructure","SGR projects"],opps:[
    {type:"job",org:"Kenya Power & Lighting",title:"Graduate Engineer Trainee",dead:"Jun 30",link:"https://www.kplc.co.ke/careers"},
    {type:"job",org:"Kenya Roads Board",title:"Graduate Civil Engineer",dead:"Jul 15",link:"https://www.krb.go.ke"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF Engineering Research Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"DAAD Germany",title:"DAAD Engineering Scholarship",dead:"Jul 31",link:"https://www.daad.de/en"},
    {type:"scholarship",org:"African Union",title:"AU Engineering Excellence Award",dead:"Aug 15",link:"https://www.au.int"},
    {type:"grant",org:"NRF Kenya",title:"NRF Infrastructure Research Grant",dead:"Jul 31",link:"https://www.nrf.ac.ke/grants"},
    {type:"grant",org:"World Bank",title:"World Bank Infrastructure Grant — EA",dead:"Sep 1",link:"https://www.worldbank.org"},
    {type:"training",org:"Autodesk",title:"AutoCAD Professional Certification",dead:"May 15",link:"https://www.autodesk.com/certification"},
    {type:"training",org:"EBK Kenya",title:"EBK Professional Registration Course",dead:"Jun 10",link:"https://www.ebk.or.ke"},
    {type:"networking",org:"EBK Kenya",title:"East Africa Engineering Expo",dead:"Aug 20",link:"https://www.ebk.or.ke"},
    {type:"networking",org:"IEK Kenya",title:"Institution of Engineers Kenya Gala",dead:"Sep 15",link:"https://www.iek.or.ke"}
  ]},
  compsci:     {courses:[{code:"CS 101",name:"Introduction to Programming",y:1,p:90},{code:"CS 102",name:"Data Structures & Algorithms",y:1,p:72},{code:"CS 201",name:"Operating Systems",y:2,p:60},{code:"CS 301",name:"Database Systems",y:3,p:50}],bodies:["Computer Society of Kenya (CSK)","IEEE Kenya","ISACA"],tools:["Python","Git","SQL","R","Docker"],trends:["Generative AI","Safaricom API economy","Kenya startup ecosystem","Cybersecurity Africa"],opps:[
    {type:"job",org:"Safaricom PLC",title:"Junior Software Developer",dead:"Jun 15",link:"https://www.safaricom.co.ke/careers"},
    {type:"job",org:"Andela Africa",title:"Junior Engineer Program",dead:"Jul 1",link:"https://www.andela.com"},
    {type:"scholarship",org:"Google Africa",title:"Google Generation Scholarship",dead:"Jun 30",link:"https://buildyourfuture.withgoogle.com/scholarships"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF ICT Research Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"Mastercard Found.",title:"Mastercard Foundation Scholars",dead:"Jul 31",link:"https://mastercardfdn.org/scholars"},
    {type:"grant",org:"IDRC Canada",title:"IDRC Digital Africa Research Grant",dead:"Aug 1",link:"https://www.idrc.ca"},
    {type:"grant",org:"Mozilla Foundation",title:"Mozilla Technology Fund",dead:"Aug 31",link:"https://foundation.mozilla.org"},
    {type:"training",org:"Amazon AWS",title:"AWS Cloud Practitioner Certification",dead:"May 31",link:"https://aws.amazon.com/certification"},
    {type:"training",org:"Microsoft",title:"Azure Fundamentals Certification",dead:"Jun 15",link:"https://learn.microsoft.com"},
    {type:"networking",org:"iHub Nairobi",title:"iHub Tech Meetup — Nairobi",dead:"Monthly",link:"https://ihub.co.ke"},
    {type:"networking",org:"ALC Africa",title:"Google Africa Developer Community",dead:"Ongoing",link:"https://gdg.community.dev"}
  ]},
  business:    {courses:[{code:"BUS 101",name:"Principles of Accounting",y:1,p:85},{code:"BUS 102",name:"Microeconomics",y:1,p:70},{code:"BUS 201",name:"Corporate Finance",y:2,p:58},{code:"BUS 301",name:"Strategic Management",y:3,p:48}],bodies:["ICPAK (CPA Kenya)","CFA Institute","ACCA"],tools:["Excel","SPSS","STATA","Python","R"],trends:["M-Pesa ecosystem","ESG investing","African free trade","Nairobi financial hub"],opps:[
    {type:"job",org:"Equity Bank Kenya",title:"Graduate Financial Analyst",dead:"Jun 30",link:"https://www.equitybank.co.ke/careers"},
    {type:"job",org:"KCB Group",title:"Management Trainee Programme",dead:"Jul 15",link:"https://kcbgroup.com/careers"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF Business Research Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"CFA Institute",title:"CFA Institute Scholarship",dead:"Jul 1",link:"https://www.cfainstitute.org/programs/scholarships"},
    {type:"scholarship",org:"ACCA Global",title:"ACCA Access Scholarship",dead:"Jul 31",link:"https://www.accaglobal.com/scholarships"},
    {type:"grant",org:"Tony Elumelu Found.",title:"TEF Entrepreneurship Programme",dead:"Jun 30",link:"https://www.tonyelumelufoundation.org"},
    {type:"grant",org:"KEPSA Kenya",title:"KEPSA SME Research Grant",dead:"Aug 15",link:"https://www.kepsa.or.ke"},
    {type:"training",org:"ACCA Kenya",title:"ACCA Professional Qualification",dead:"May 20",link:"https://www.accaglobal.com"},
    {type:"training",org:"ICPAK Kenya",title:"CPA Kenya Professional Course",dead:"Jun 10",link:"https://www.icpak.com"},
    {type:"networking",org:"KEPSA Kenya",title:"Kenya Business Forum 2026",dead:"Aug 20",link:"https://www.kepsa.or.ke"},
    {type:"networking",org:"NSE Kenya",title:"Nairobi Securities Exchange Investor Forum",dead:"Sep 10",link:"https://www.nse.co.ke"}
  ]},
  education:   {courses:[{code:"EDU 101",name:"Educational Psychology",y:1,p:88},{code:"EDU 102",name:"Curriculum Development",y:1,p:75},{code:"EDU 201",name:"Teaching Methods",y:2,p:65},{code:"EDU 301",name:"Educational Assessment",y:3,p:55}],bodies:["Teachers Service Commission (TSC)","Kenya Examinations Council","UNESCO"],tools:["SPSS","NVivo","STATA","Atlas.ti"],trends:["EdTech Africa","CBC implementation","Digital classrooms","Teacher professionalisation"],opps:[
    {type:"job",org:"TSC Kenya",title:"Graduate Teacher — Secondary",dead:"Jun 30",link:"https://www.tsc.go.ke"},
    {type:"job",org:"Aga Khan Schools",title:"Teacher — Sciences/Maths",dead:"Jul 15",link:"https://www.agakhanschools.org"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF Education Research Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"Mastercard Found.",title:"MCF Teaching Excellence Fellowship",dead:"Jul 20",link:"https://mastercardfdn.org"},
    {type:"scholarship",org:"UNESCO",title:"UNESCO Education Research Fellowship",dead:"Aug 1",link:"https://www.unesco.org/fellowships"},
    {type:"grant",org:"NRF Kenya",title:"NRF Curriculum Research Grant",dead:"Jul 31",link:"https://www.nrf.ac.ke/grants"},
    {type:"grant",org:"USAID Kenya",title:"USAID Education Development Grant",dead:"Aug 31",link:"https://www.usaid.gov/kenya"},
    {type:"training",org:"Kenya Inst. Curriculum",title:"KICD Curriculum Developer Training",dead:"May 30",link:"https://www.kicd.ac.ke"},
    {type:"training",org:"AMI Africa",title:"Montessori Teaching Certificate",dead:"Jun 15",link:"https://www.ami.education"},
    {type:"networking",org:"MoE Kenya",title:"Kenya National Education Forum",dead:"Aug 20",link:"https://www.education.go.ke"},
    {type:"networking",org:"KNUT Kenya",title:"Kenya National Union of Teachers Congress",dead:"Sep 15",link:"https://www.knut.net"}
  ]},
  agriculture: {courses:[{code:"AGR 101",name:"Soil Science & Fertility",y:1,p:82},{code:"AGR 102",name:"Crop Science & Production",y:1,p:70},{code:"AGR 201",name:"Agricultural Economics",y:2,p:60},{code:"AGR 301",name:"Agribusiness Management",y:3,p:50}],bodies:["KALRO","ISA Kenya","FAO"],tools:["R","STATA","SAS","Python","SPSS"],trends:["Climate-smart agriculture","Precision farming Kenya","Youth in agri","AfCFTA food trade"],opps:[
    {type:"job",org:"KALRO Kenya",title:"Research Scientist — Crops",dead:"Jun 30",link:"https://www.kalro.org/careers"},
    {type:"job",org:"Twiga Foods",title:"Agricultural Extension Officer",dead:"Jul 15",link:"https://www.twigafoods.com"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF Agricultural Research Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"AGRA",title:"AGRA Graduate Research Fellowship",dead:"Jul 20",link:"https://www.agra.org"},
    {type:"scholarship",org:"RUFORUM",title:"RUFORUM Graduate Scholarship",dead:"Aug 1",link:"https://www.ruforum.org"},
    {type:"grant",org:"NRF Kenya",title:"NRF Food Security Research Grant",dead:"Jul 31",link:"https://www.nrf.ac.ke/grants"},
    {type:"grant",org:"BMGF",title:"Bill & Melinda Gates Agri Grant",dead:"Sep 1",link:"https://www.gatesfoundation.org"},
    {type:"training",org:"FAO Kenya",title:"Climate-Smart Agriculture Training",dead:"May 31",link:"https://www.fao.org/kenya"},
    {type:"training",org:"CIMMYT Africa",title:"Precision Agriculture Training",dead:"Jun 20",link:"https://www.cimmyt.org"},
    {type:"networking",org:"KENFAP",title:"Kenya Farmers Association Forum",dead:"Aug 15",link:"https://www.kenfap.or.ke"},
    {type:"networking",org:"EAC",title:"East Africa Agri-Business Summit",dead:"Sep 20",link:"https://www.eac.int"}
  ]},
  nursing:     {courses:[{code:"NUR 101",name:"Anatomy for Nurses",y:1,p:80},{code:"NUR 102",name:"Pharmacology",y:1,p:68},{code:"NUR 201",name:"Clinical Nursing Practice",y:2,p:58},{code:"NUR 301",name:"Maternal & Child Health",y:3,p:48}],bodies:["Nursing Council of Kenya (NCK)","Kenya Registered Nurses Assoc.","ICN"],tools:["SPSS","STATA","R","NVivo"],trends:["UHC implementation","Mental health Kenya","Digital health records","Maternal mortality reduction"],opps:[
    {type:"job",org:"KNH Nairobi",title:"Registered Nurse — General",dead:"Jun 30",link:"https://www.knh.or.ke"},
    {type:"job",org:"Aga Khan Hospital",title:"Clinical Nurse Specialist",dead:"Jul 15",link:"https://www.agakhanhospitals.org/careers"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF Health Sciences Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"NCK Kenya",title:"Nursing Council of Kenya Bursary",dead:"Jul 20",link:"https://www.nursingkenya.or.ke"},
    {type:"scholarship",org:"Johnson & Johnson",title:"J&J Nursing Scholarship Africa",dead:"Aug 1",link:"https://www.jnj.com/nursing-scholarship"},
    {type:"grant",org:"USAID Kenya",title:"USAID Maternal Health Research Grant",dead:"Jul 31",link:"https://www.usaid.gov/kenya"},
    {type:"grant",org:"NRF Kenya",title:"NRF Nursing Practice Research Grant",dead:"Aug 31",link:"https://www.nrf.ac.ke/grants"},
    {type:"training",org:"WHO/MoH Kenya",title:"Emergency Obstetric Care Training",dead:"May 31",link:"https://www.health.go.ke"},
    {type:"training",org:"Kenya Red Cross",title:"Critical Care Nursing Certificate",dead:"Jun 15",link:"https://www.redcross.or.ke"},
    {type:"networking",org:"NCK Kenya",title:"Kenya Nursing Summit 2026",dead:"Aug 20",link:"https://www.nursingkenya.or.ke"},
    {type:"networking",org:"ICN",title:"International Council of Nurses Congress",dead:"Sep 10",link:"https://www.icn.ch"}
  ]},
  puremaths:   {courses:[{code:"MTH 101",name:"Real Analysis I",y:1,p:80},{code:"MTH 201",name:"Abstract Algebra",y:2,p:65},{code:"MTH 301",name:"Complex Analysis",y:3,p:55},{code:"MTH 401",name:"Topology",y:4,p:45}],bodies:["Kenya Mathematical Society","African Mathematical Union","London Mathematical Society"],tools:["MATLAB","Python","LaTeX","Mathematica"],trends:["AI & deep learning theory","Cryptography","Quantum computing math","Computational topology"],opps:[{type:"scholarship",org:"NRF Kenya",title:"NRF Mathematics Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},{type:"scholarship",org:"DAAD",title:"DAAD Mathematics Fellowship",dead:"Jul 31",link:"https://www.daad.de"},{type:"job",org:"KRA",title:"Data Analyst Graduate Trainee",dead:"Jun 30",link:"https://www.kra.go.ke"},{type:"training",org:"AIMS Kenya",title:"AIMS Structured Masters Programme",dead:"Aug 1",link:"https://www.aims.ac.ke"}]},
  appliedmaths:{courses:[{code:"AMA 101",name:"Calculus & Analysis",y:1,p:82},{code:"AMA 201",name:"Differential Equations",y:2,p:68},{code:"AMA 301",name:"Numerical Methods",y:3,p:57},{code:"AMA 401",name:"Mathematical Modelling",y:4,p:48}],bodies:["Kenya Mathematical Society","SIAM","African Mathematical Union"],tools:["MATLAB","Python","R","LaTeX","Mathematica"],trends:["Climate modelling","Epidemiological modelling","Financial mathematics","Operations research"],opps:[{type:"scholarship",org:"NRF Kenya",title:"NRF Applied Mathematics Grant",dead:"Jun 30",link:"https://www.nrf.ac.ke"},{type:"scholarship",org:"AIMS",title:"AIMS Pan-Africa Scholarship",dead:"Aug 15",link:"https://www.aims.ac.ke"},{type:"job",org:"KEMRI",title:"Mathematical Modeller",dead:"Jul 15",link:"https://www.kemri.org"},{type:"training",org:"ICTP Africa",title:"ICTP Mathematics Training",dead:"Jul 31",link:"https://www.ictp.it"}]},
  appstats:    {courses:[{code:"STA 101",name:"Introduction to Statistics",y:1,p:85},{code:"STA 201",name:"Probability & Distribution Theory",y:2,p:70},{code:"STA 301",name:"Regression Analysis",y:3,p:60},{code:"STA 401",name:"Multivariate Analysis",y:4,p:50}],bodies:["Kenya National Bureau of Statistics","International Statistical Institute","African Statistical Association"],tools:["R","SPSS","STATA","Python","SAS"],trends:["Big data analytics","Machine learning","Biostatistics","Survey methodology"],opps:[{type:"job",org:"KNBS Kenya",title:"Graduate Statistician",dead:"Jun 30",link:"https://www.knbs.or.ke"},{type:"scholarship",org:"NRF Kenya",title:"NRF Statistics Research Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},{type:"training",org:"ISI",title:"ISI Young Statisticians Workshop",dead:"Aug 1",link:"https://www.isi-web.org"},{type:"job",org:"World Bank",title:"Junior Data Analyst",dead:"Jul 15",link:"https://www.worldbank.org/careers"}]},
  entrepreneurship:{courses:[{code:"ENT 101",name:"Introduction to Entrepreneurship",y:1,p:88},{code:"ENT 201",name:"Business Model Innovation",y:2,p:75},{code:"ENT 301",name:"Startup Financing & Pitching",y:3,p:65},{code:"ENT 401",name:"Growth & Scaling",y:4,p:55}],bodies:["Kenya Private Sector Alliance (KEPSA)"," Kenya ICT Board","Tony Elumelu Foundation"],tools:["Excel","Canva","Google Analytics","Notion","QuickBooks"],trends:["Fintech innovation","AgriTech startups","Green economy","Youth entrepreneurship"],opps:[{type:"grant",org:"Tony Elumelu Found.",title:"TEF Entrepreneurship Programme",dead:"Jun 30",link:"https://www.tonyelumelufoundation.org"},{type:"grant",org:"Mastercard Found.",title:"MCF Young Africa Works",dead:"Jul 31",link:"https://mastercardfdn.org"},{type:"training",org:"iHub Nairobi",title:"Startup Bootcamp",dead:"Ongoing",link:"https://ihub.co.ke"},{type:"networking",org:"KEPSA",title:"Kenya Business Forum",dead:"Aug 20",link:"https://www.kepsa.or.ke"}]},
  publichealth:{courses:[{code:"PH 101",name:"Introduction to Public Health",y:1,p:80},{code:"PH 201",name:"Epidemiology",y:2,p:68},{code:"PH 301",name:"Health Systems & Policy",y:3,p:58},{code:"PH 401",name:"Global Health",y:4,p:50}],bodies:["Kenya Public Health Association","APHEA","East Africa Public Health Alliance"],tools:["SPSS","R","STATA","EpiInfo","ArcGIS"],trends:["One Health approach","Digital health","NCD prevention","Universal Health Coverage"],opps:[{type:"scholarship",org:"NRF Kenya",title:"NRF Public Health Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},{type:"scholarship",org:"WHO AFRO",title:"WHO Public Health Fellowship",dead:"Jul 1",link:"https://www.afro.who.int"},{type:"job",org:"MoH Kenya",title:"Public Health Officer",dead:"Jun 30",link:"https://www.health.go.ke"},{type:"grant",org:"Gates Foundation",title:"Global Health Grant Africa",dead:"Aug 31",link:"https://www.gatesfoundation.org"}]},
  economics:   {courses:[{code:"ECO 101",name:"Principles of Economics",y:1,p:82},{code:"ECO 201",name:"Microeconomics",y:2,p:70},{code:"ECO 301",name:"Macroeconomics",y:3,p:60},{code:"ECO 401",name:"Econometrics",y:4,p:52}],bodies:["Kenya Economic Association","African Economic Research Consortium","East Africa Economics Society"],tools:["R","STATA","EViews","Python","SPSS"],trends:["Digital economy","Green economics","Development finance","Trade policy"],opps:[{type:"scholarship",org:"AERC",title:"AERC Collaborative Masters",dead:"Jun 30",link:"https://www.aercafrica.org"},{type:"scholarship",org:"NRF Kenya",title:"NRF Economics Research Grant",dead:"Jun 30",link:"https://www.nrf.ac.ke"},{type:"job",org:"Central Bank Kenya",title:"Graduate Economist",dead:"Jul 15",link:"https://www.centralbank.go.ke"},{type:"training",org:"World Bank",title:"World Bank Internship Programme",dead:"Oct 31",link:"https://www.worldbank.org/internship"}]},
  pharmacy:    {courses:[{code:"PHA 101",name:"Pharmaceutical Chemistry",y:1,p:78},{code:"PHA 201",name:"Pharmacology I",y:2,p:65},{code:"PHA 301",name:"Clinical Pharmacy",y:3,p:55},{code:"PHA 401",name:"Pharmaceutical Care",y:4,p:48}],bodies:["Pharmacy & Poisons Board Kenya","Kenya Pharmaceutical Association","East Africa Pharmacists Association"],tools:["SPSS","R","ChemDraw","Mendeley"],trends:["Biopharmaceuticals","Precision medicine","Drug regulatory affairs","Community pharmacy"],opps:[{type:"job",org:"KEMSA Kenya",title:"Pharmaceutical Technologist",dead:"Jun 30",link:"https://www.kemsa.co.ke"},{type:"scholarship",org:"NRF Kenya",title:"NRF Pharmaceutical Sciences Grant",dead:"Jun 30",link:"https://www.nrf.ac.ke"},{type:"training",org:"PPB Kenya",title:"Pharmacy Regulatory Training",dead:"Jul 31",link:"https://www.pharmacyboardkenya.org"},{type:"scholarship",org:"Wellcome Trust",title:"Wellcome Africa Research Award",dead:"Aug 15",link:"https://wellcome.org"}]},
  psychology:  {courses:[{code:"PSY 101",name:"Introduction to Psychology",y:1,p:85},{code:"PSY 201",name:"Developmental Psychology",y:2,p:72},{code:"PSY 301",name:"Abnormal Psychology",y:3,p:62},{code:"PSY 401",name:"Counselling Psychology",y:4,p:55}],bodies:["Kenya Counselling Association","Kenya Psychological Association","African Association of Psychology"],tools:["SPSS","NVivo","R","Atlas.ti"],trends:["Mental health tech","Trauma-informed care","School counselling","Corporate wellness"],opps:[{type:"scholarship",org:"NRF Kenya",title:"NRF Psychology Research Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},{type:"job",org:"MOH Kenya",title:"Clinical Psychologist",dead:"Jun 30",link:"https://www.health.go.ke"},{type:"training",org:"KCA Kenya",title:"KCA Counselling Certification",dead:"Ongoing",link:"https://www.kca.co.ke"},{type:"scholarship",org:"DAAD",title:"DAAD Psychology Fellowship",dead:"Jul 31",link:"https://www.daad.de"}]},
  envscience:  {courses:[{code:"ENV 101",name:"Introduction to Environmental Science",y:1,p:80},{code:"ENV 201",name:"Ecology & Biodiversity",y:2,p:68},{code:"ENV 301",name:"Climate Change Science",y:3,p:58},{code:"ENV 401",name:"Environmental Policy & Law",y:4,p:50}],bodies:["NEMA Kenya","Kenya Environment Institute","African Environment Network"],tools:["ArcGIS","R","Python","QGIS","STATA"],trends:["Climate adaptation","Carbon markets","Green finance","Biodiversity conservation"],opps:[{type:"scholarship",org:"NRF Kenya",title:"NRF Environmental Research Grant",dead:"Jun 30",link:"https://www.nrf.ac.ke"},{type:"scholarship",org:"DAAD",title:"DAAD Environmental Sciences Fellowship",dead:"Jul 31",link:"https://www.daad.de"},{type:"job",org:"NEMA Kenya",title:"Environmental Officer",dead:"Jun 30",link:"https://www.nema.go.ke"},{type:"grant",org:"IDRC Canada",title:"IDRC Climate Change Research Grant",dead:"Aug 15",link:"https://www.idrc.ca"}]},
  architecture:{courses:[{code:"ARC 101",name:"Design Fundamentals",y:1,p:85},{code:"ARC 102",name:"Building Technology",y:1,p:72},{code:"ARC 201",name:"Structural Analysis",y:2,p:60},{code:"ARC 301",name:"Urban Design & Planning",y:3,p:50}],bodies:["Architectural Association of Kenya (AAK)","Board of Registration of Architects","RIBA"],tools:["AutoCAD","Revit","SketchUp","Python"],trends:["Affordable housing Kenya","Green architecture","Smart cities Nairobi","BIM adoption Africa"],opps:[
    {type:"job",org:"NCA Kenya",title:"Graduate Architect — Public Works",dead:"Jun 30",link:"https://www.nca.go.ke"},
    {type:"job",org:"Symbion International",title:"Junior Architect",dead:"Jul 15",link:"https://www.symbion.com"},
    {type:"scholarship",org:"NRF Kenya",title:"NRF Built Environment Scholarship",dead:"Jun 30",link:"https://www.nrf.ac.ke"},
    {type:"scholarship",org:"AAK Kenya",title:"AAK Design Excellence Scholarship",dead:"Jul 20",link:"https://www.aak.or.ke"},
    {type:"scholarship",org:"Aga Khan Trust",title:"Aga Khan Architecture Award",dead:"Aug 1",link:"https://www.akdn.org/architecture"},
    {type:"grant",org:"UN-Habitat",title:"UN-Habitat Urban Design Grant",dead:"Jul 31",link:"https://www.unhabitat.org"},
    {type:"grant",org:"NRF Kenya",title:"NRF Housing Research Grant",dead:"Aug 31",link:"https://www.nrf.ac.ke/grants"},
    {type:"training",org:"RIBA UK",title:"RIBA Professional Practice Certificate",dead:"May 31",link:"https://www.architecture.com"},
    {type:"training",org:"Autodesk",title:"Revit BIM Professional Certification",dead:"Jun 15",link:"https://www.autodesk.com/certification"},
    {type:"networking",org:"AAK Kenya",title:"Nairobi Architecture Biennale 2026",dead:"Aug 20",link:"https://www.aak.or.ke"},
    {type:"networking",org:"UIA",title:"International Union of Architects Congress",dead:"Sep 15",link:"https://www.uia-architectes.org"}
  ]},
};

const TOOLS_INFO={
  Python:{color:"#F59E0B",link:"https://colab.research.google.com",site:"Google Colab",desc:"Data analysis, automation and machine learning."},
  R:{color:"#0D9488",link:"https://posit.cloud",site:"Posit Cloud",desc:"Statistical computing — gold standard for research."},
  STATA:{color:"#7C3AED",link:"https://www.stata.com",site:"stata.com",desc:"Powerful statistics for economics and health research."},
  SPSS:{color:"#EC4899",link:"https://www.ibm.com/spss",site:"IBM SPSS",desc:"Survey analysis and quantitative research."},
  LaTeX:{color:"#3B82F6",link:"https://overleaf.com",site:"Overleaf",desc:"Professional typesetting for academic papers."},
  MATLAB:{color:"#F97316",link:"https://matlab.mathworks.com",site:"MATLAB Online",desc:"Numerical computing for engineering and simulation."},
  AutoCAD:{color:"#EF4444",link:"https://web.autocad.com",site:"AutoCAD Web",desc:"CAD software for technical drawing and design."},
  NVivo:{color:"#8B5CF6",link:"https://www.qsrinternational.com",site:"QSR Intl",desc:"Qualitative data analysis software."},
  Git:{color:"#F97316",link:"https://github.com",site:"GitHub",desc:"Version control — essential for software projects."},
  SQL:{color:"#22C55E",link:"https://sqliteonline.com",site:"SQLite Online",desc:"Standard language for database management."},
  Excel:{color:"#16A34A",link:"https://office.com",site:"Excel Online",desc:"Spreadsheet modelling and reporting."},
  Revit:{color:"#EF4444",link:"https://www.autodesk.com",site:"Autodesk",desc:"BIM software for architectural design."},
  SketchUp:{color:"#FBBF24",link:"https://app.sketchup.com",site:"SketchUp",desc:"3D modelling for architecture and urban planning."},
  Zotero:{color:"#CC0000",link:"https://www.zotero.org",site:"zotero.org",desc:"Reference management for citations and bibliography."},
  LexisNexis:{color:"#1E3A8A",link:"https://www.lexisnexis.com",site:"LexisNexis",desc:"Legal research platform for cases and statutes."},
  "Atlas.ti":{color:"#14B8A6",link:"https://atlasti.com",site:"atlasti.com",desc:"Qualitative research software for coding and analysis."},
  Docker:{color:"#3B82F6",link:"https://labs.play-with-docker.com",site:"Play w/ Docker",desc:"Containerisation for deploying applications."},
  SAS:{color:"#004F9D",link:"https://www.sas.com",site:"sas.com",desc:"Advanced analytics for agriculture, health and business."},
  Westlaw:{color:"#DC2626",link:"https://legal.thomsonreuters.com",site:"Westlaw",desc:"Comprehensive legal research database."},
};

const TREND_DATA=[{w:"W1",sc:72},{w:"W2",sc:75},{w:"W3",sc:68},{w:"W4",sc:80},{w:"W5",sc:84},{w:"W6",sc:79},{w:"W7",sc:88},{w:"W8",sc:91}];
const CAL_EVENTS=[
  {d:3,type:"exam",label:"Mid-Semester Exam",time:"9:00 AM",col:"#EF4444"},
  {d:7,type:"assignment",label:"Assignment 2 Due",time:"11:59 PM",col:"#D97706"},

  {d:14,type:"class",label:"Online Lecture",time:"8:00 AM",col:"#0D9488"},
  {d:17,type:"deadline",label:"Research Draft Due",time:"5:00 PM",col:"#7C3AED"},
  {d:21,type:"exam",label:"CAT 2",time:"2:00 PM",col:"#EF4444"},
  {d:25,type:"class",label:"Industry Talk",time:"10:00 AM",col:"#16A34A"},
  {d:28,type:"deadline",label:"Portfolio Submission",time:"11:59 PM",col:"#D97706"},
];
const MEETINGS=[

  {id:2,title:"Research Supervision",host:"Prof. Wanjiku",date:"Mar 22",time:"2:00 PM",dur:"45min",platform:"meet",att:3,rec:false,type:"research"},

  {id:4,title:"Industry Webinar",host:"Guest Speaker",date:"Mar 25",time:"10:00 AM",dur:"2h",platform:"zoom",att:150,rec:true,type:"industry"},
];
const PENDING_REGS=[



  {id:104,name:"Dr. Njoroge P.",email:"p.njoroge@staff.buc.ke",field:"engineering",date:"Mar 19",sid:"BUC/STAFF/7",role:"lecturer"},
  {id:105,name:"Aisha Mohamed",email:"a.mohamed@student.buc.ke",field:"compsci",date:"Mar 20",sid:"BUC/CS/2026/019",role:"student"},
];

const ThemeCtx=createContext("navy"),LangCtx=createContext("en");
const useT=()=>THEMES[useContext(ThemeCtx)];
const useLang=()=>{const l=useContext(LangCtx);return k=>(LS[l]||LS.en)[k]||LS.en[k]||k;};

const loadFonts=()=>{
  if(document.getElementById("ak-f"))return;
  const lk=document.createElement("link");
  lk.id="ak-f";lk.rel="stylesheet";
  lk.href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap";
  document.head.appendChild(lk);
};

const sx=T=>({
  card:{background:T.bg2,border:`1px solid ${T.bd}`,borderRadius:12,padding:"1.25rem"},
  acCard:{background:`linear-gradient(135deg,${rgba(T.ac,0.14)},${rgba(T.ac,0.04)})`,border:`1px solid ${rgba(T.ac,0.28)}`,borderRadius:12,padding:"1.25rem"},
  input:{width:"100%",background:T.bg1,border:`1px solid ${T.bd}`,borderRadius:8,padding:"9px 13px",color:T.t1,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"},
  btnP:{background:`linear-gradient(135deg,${T.ac},${T.acL})`,color:"#0D1226",border:"none",borderRadius:8,padding:"9px 20px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  btnS:{background:"transparent",color:T.ac,border:`1px solid ${rgba(T.ac,0.35)}`,borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  btnD:{background:"transparent",color:T.red,border:`1px solid ${rgba(T.red,0.4)}`,borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  tag:c=>({background:`${c}22`,color:c,border:`1px solid ${c}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,letterSpacing:0.4,whiteSpace:"nowrap",display:"inline-block"}),
  lbl:{fontSize:11,color:T.t3,display:"block",marginBottom:5,letterSpacing:0.6,fontWeight:600},
  h1:{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600,color:T.t1,margin:"0 0 0.35rem"},
  sub:{color:T.t2,fontSize:13,margin:"0 0 1.5rem"},
});


const Prog=({val,color})=>{
  const T=useT();
  return (
    <div style={{height:4,background:T.bg4,borderRadius:2}}>
      <div style={{width:`${Math.min(val,100)}%`,height:"100%",background:color||T.ac,borderRadius:2,transition:"width 0.4s"}}/>
    </div>
  );
};
const Pill=({text,color})=>{const T=useT();return <span style={sx(T).tag(color||T.ac)}>{text}</span>;};
const Av=({name,size=36,bg})=>{
  const T=useT();const c=bg||T.purple;
  const ini=name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{width:size,height:size,background:`linear-gradient(135deg,${c},${c}88)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color:"#fff",flexShrink:0}}>
      {ini}
    </div>
  );
};
const StatCard=({label,value,sub,color,icon})=>{
  const T=useT();
  return (
    <div style={{...sx(T).card,borderTop:`3px solid ${color}`}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <div style={{fontSize:11,color:T.t3,letterSpacing:0.5}}>{label.toUpperCase()}</div>
        {icon&&<span style={{fontSize:18}}>{icon}</span>}
      </div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,color,margin:"6px 0 2px"}}>{value}</div>
      <div style={{fontSize:11,color:T.t2}}>{sub}</div>
    </div>
  );
};
const Toast=({n})=>{
  const T=useT();
  if(!n)return null;
  const ok=n.type==="success";
  return (
    <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:ok?rgba(T.green,0.18):rgba(T.red,0.18),border:`1px solid ${ok?T.green:T.red}55`,color:ok?T.green:T.red,borderRadius:10,padding:"11px 18px",fontSize:13,fontWeight:500}}>
      {ok?"✓  ":"✗  "}{n.msg}
    </div>
  );
};

const FieldSelector=({selected,onSelect})=>{
  const T=useT();
  const groups=[...new Set(Object.values(FIELDS).map(f=>f.group))];
  return (
    <div>
      {groups.map(grp=>(
        <div key={grp} style={{marginBottom:"1rem"}}>
          <div style={{fontSize:10,color:T.t3,letterSpacing:0.8,marginBottom:8,fontWeight:600}}>{grp.toUpperCase()}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {Object.values(FIELDS).filter(f=>f.group===grp).map(f=>{
              const sel=selected===f.id;
              return (
                <div key={f.id} onClick={()=>onSelect(f.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,border:`1px solid ${sel?f.color:T.bd}`,background:sel?rgba(f.color,0.15):T.bg3,cursor:"pointer"}}>
                  <span style={{fontSize:20}}>{f.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:sel?600:400,color:sel?f.color:T.t1}}>{f.name}</div>
                    <div style={{fontSize:10,color:T.t3}}>{f.desc.slice(0,36)}...</div>
                  </div>
                  {sel&&<span style={{color:f.color}}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const AuthScreen=({onLogin,onRealLogin,onRealSignUp,lang,setLang,themeId,setThemeId})=>{
  const T=useT();const t=useLang();const s=sx(T);
  const [tab,setTab]=useState("login"),[step,setStep]=useState(1),[loading,setLoading]=useState(false),[authErr,setAuthErr]=useState(""),[forgotMode,setForgotMode]=useState(false),[forgotEmail,setForgotEmail]=useState(""),[forgotMsg,setForgotMsg]=useState("");
  const [yearLvl,setYearLvl]=useState(""),[progLevel,setProgLevel]=useState("undergraduate");
  const [email,setEmail]=useState(""),[pass,setPass]=useState(""),[cpass,setCpass]=useState("");
  const [name,setName]=useState(""),[sid,setSid]=useState(""),[role,setRole]=useState("student");
  const [field,setField]=useState("actuarial"),[err,setErr]=useState(""),[done,setDone]=useState(false);
  useEffect(()=>{loadFonts();},[]);
  const next=()=>{
    if(!name.trim()){setErr("Full name required.");return;}
    if(!email.includes("@")||!email.includes(".")||email.indexOf("@")<1){setErr("Valid institutional email required.");return;}
    if(!sid.trim()){setErr("Student/Staff ID required.");return;}
    if(pass.length<8){setErr("Password must be at least 8 characters.");return;}
    if(pass!==cpass){setErr("Passwords do not match.");return;}
    setErr("");setStep(2);
  };
  if(done)return(
    <div style={{minHeight:"100vh",background:T.bg0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",color:T.t1}}>
      <div style={{width:460,textAlign:"center",padding:"0 1rem"}}>
        <div style={{fontSize:52,marginBottom:"1rem"}}>⏳</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:T.ac,marginBottom:"0.75rem"}}>{t("pending")}</h2>
        <p style={{fontSize:13,color:T.t2,lineHeight:1.75,marginBottom:"1.25rem"}}>
          Your registration for <strong style={{color:T.t1}}>{(FIELDS[field]&&FIELDS[field].name)}</strong> has been submitted.
          An administrator will review and approve your account within 24 hours.
          You will be notified at <strong style={{color:T.ac}}>{email}</strong>.
        </p>
        <div style={{background:T.bg2,border:`1px solid ${T.bd}`,borderRadius:12,padding:"1rem",marginBottom:"1.25rem",fontSize:12,color:T.t3,textAlign:"left",lineHeight:2}}>
          <div>🔐 AES-256 encrypted in transit and at rest</div>
          <div>📧 Verification email sent</div>
          <div>🕐 Approval typically within 24 hours</div>
          <div>🛡 Admin notified of your registration</div>
        </div>
        <button onClick={()=>{setDone(false);setStep(1);setTab("login");}} style={{...s.btnS,fontSize:12}}>Back to Sign In</button>
      </div>
    </div>
  );
  const langOpts=Object.entries(LANGS);
  const themeOpts=Object.values(THEMES);
  const roleOpts=[["student","Student"],["lecturer","Lecturer / Teaching Staff"],["researcher","Researcher"]];

  return(
    <div style={{minHeight:"100vh",background:T.bg0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",color:T.t1,position:"relative",overflow:"hidden"}}>
      <svg style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",opacity:0.025,pointerEvents:"none"}}>
        <defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0L0 0 0 60" fill="none" stroke={T.ac} strokeWidth="0.5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>
      <div style={{position:"fixed",top:16,right:16,display:"flex",gap:8,zIndex:10}}>
        <select value={lang} onChange={e=>setLang(e.target.value)} style={{...s.input,width:"auto",fontSize:11,padding:"5px 8px",background:T.bg2}}>
          {langOpts.map(pair=><option key={pair[0]} value={pair[0]}>{pair[1].flag} {pair[1].name}</option>)}
        </select>
        <select value={themeId} onChange={e=>setThemeId(e.target.value)} style={{...s.input,width:"auto",fontSize:11,padding:"5px 8px",background:T.bg2}}>
          {themeOpts.map(th=><option key={th.id} value={th.id}>{th.emoji} {th.name}</option>)}
        </select>
      </div>
      <div style={{width:tab==="register"&&step===2?700:480,position:"relative",zIndex:1,maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:4}}>
              <img src="/logo2.png" alt="AKADIMIA" style={{height:130,width:130,objectFit:"contain"}}/>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:36,color:T.t1,letterSpacing:5}}>AKADIMIA</div>
                <div style={{fontSize:11,color:T.ac,fontStyle:"italic",letterSpacing:1.5,marginBottom:2}}>Ujuzi Bila Mipaka</div>
                <div style={{fontSize:11,color:T.t3,letterSpacing:0.5}}>Every Field. Every Student. One Platform.</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{background:T.bg2,border:`1px solid ${T.bd}`,borderRadius:18,padding:"2rem",boxShadow:"0 32px 80px rgba(0,0,0,0.7)"}}>
          <div style={{display:"flex",background:T.bg1,borderRadius:10,padding:4,marginBottom:"1.5rem"}}>
            {[["login",t("signIn")],["register",t("register")]].map(pair=>(
              <button key={pair[0]} onClick={()=>{setTab(pair[0]);setErr("");setStep(1);}} style={{flex:1,padding:"8px",borderRadius:7,border:"none",background:tab===pair[0]?T.bg3:"transparent",color:tab===pair[0]?T.t1:T.t2,fontSize:13,fontWeight:tab===pair[0]?600:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>
                {pair[1]}
              </button>
            ))}
          </div>
          {err&&<div style={{background:rgba(T.red,0.12),border:`1px solid ${rgba(T.red,0.4)}`,color:T.red,borderRadius:8,padding:"9px 13px",fontSize:12,marginBottom:"1rem"}}>{err}</div>}{authErr&&<div style={{background:rgba(T.red,0.12),border:`1px solid ${rgba(T.red,0.4)}`,color:T.red,borderRadius:8,padding:"9px 13px",fontSize:12,marginBottom:"1rem"}}>{authErr}</div>}
          {tab==="login"&&(
            <div>
              <div style={{marginBottom:"0.85rem"}}>
                <label style={s.lbl}>INSTITUTIONAL EMAIL</label>
                <input style={s.input} type="email" placeholder="you@student.buc.edu.ke" value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
              <div style={{marginBottom:"1.4rem"}}>
                <label style={s.lbl}>PASSWORD</label>
                <input style={s.input} type="password" placeholder="..." value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&onRealLogin&&email&&pass){setLoading(true);setAuthErr("");onRealLogin(email,pass).then(err=>{setLoading(false);if(err)setAuthErr(err);});}}}/>
              </div>
              <button onClick={async()=>{if(onRealLogin&&email&&pass){setLoading(true);setAuthErr("");const err=await onRealLogin(email,pass);setLoading(false);if(err)setAuthErr(err);}else{setAuthErr("Please enter your email and password.");}}} style={{...s.btnP,width:"100%",padding:"12px",fontSize:14,borderRadius:10,marginBottom:14}}>
                {t("signIn")} →
              </button>

              <p style={{textAlign:"center",marginTop:"0.9rem",fontSize:12,color:T.t3}}>
                <span style={{color:T.ac,cursor:"pointer"}} onClick={()=>setForgotMode(true)}>Forgot password?</span> · End-to-end encrypted
              </p>
            </div>
          )}
          {tab==="register"&&step===1&&(
            <div>
              <div style={{fontSize:12,color:T.ac,marginBottom:"1rem",fontWeight:500}}>Step 1 of 2 — Personal Information</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"0.75rem"}}>
                <div><label style={s.lbl}>FULL NAME</label><input style={s.input} placeholder="e.g. David Kamau" value={name} onChange={e=>setName(e.target.value)}/></div>
                <div><label style={s.lbl}>STUDENT / STAFF ID</label><input style={s.input} placeholder="BUC/XXX/2026/001" value={sid} onChange={e=>setSid(e.target.value)}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"0.75rem"}}>
                <div><label style={s.lbl}>YEAR / LEVEL</label>
                  <select style={s.input} value={yearLvl} onChange={e=>setYearLvl(e.target.value)}>
                    <option value="">Select year...</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Masters Sem 1">Masters Sem 1</option>
                    <option value="Masters Sem 2">Masters Sem 2</option>
                    <option value="PhD Year 1">PhD Year 1</option>
                    <option value="PhD Year 2">PhD Year 2</option>
                    <option value="PhD Year 3+">PhD Year 3+</option>
                  </select>
                </div>
                <div><label style={s.lbl}>PROGRAMME LEVEL</label>
                  <select style={s.input} value={progLevel} onChange={e=>setProgLevel(e.target.value)}>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="masters">Masters</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom:"0.75rem"}}>
                <label style={s.lbl}>INSTITUTIONAL EMAIL</label>
                <input style={s.input} type="email" placeholder="you@student.buc.edu.ke" value={email} onChange={e=>setEmail(e.target.value)}/>
                <span style={{fontSize:11,color:T.t3,marginTop:4,display:"block"}}>Institutional emails only. Account requires admin approval.</span>
              </div>
              <div style={{marginBottom:"0.75rem"}}>
                <label style={s.lbl}>ROLE</label>
                <select style={s.input} value={role} onChange={e=>setRole(e.target.value)}>
                  {roleOpts.map(pair=><option key={pair[0]} value={pair[0]}>{pair[1]}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1.25rem"}}>
                <div><label style={s.lbl}>PASSWORD</label><input style={s.input} type="password" placeholder="Min. 8 characters" value={pass} onChange={e=>setPass(e.target.value)}/></div>
                <div><label style={s.lbl}>CONFIRM PASSWORD</label><input style={s.input} type="password" placeholder="Repeat password" value={cpass} onChange={e=>setCpass(e.target.value)}/></div>
              </div>
              <button onClick={next} style={{...s.btnP,width:"100%",padding:"12px",fontSize:14,borderRadius:10}}>Continue: Choose Field →</button>
            </div>
          )}
          {tab==="register"&&step===2&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
                <div style={{fontSize:12,color:T.ac,fontWeight:500}}>Step 2 of 2 — {t("fieldSelect")}</div>
                <button onClick={()=>setStep(1)} style={{...s.btnS,fontSize:11,padding:"4px 10px"}}>Back</button>
              </div>
              <FieldSelector selected={field} onSelect={setField}/>
              <button onClick={async()=>{if(onRealSignUp){setLoading(true);setErr("");const e=await onRealSignUp(email,pass,{full_name:name,student_id:sid,role,field,year_level:yearLvl,programme_level:progLevel});setLoading(false);if(e){setErr(e);}else{setDone(true);}}else{setDone(true);}}} style={{...s.btnP,width:"100%",padding:"12px",fontSize:14,borderRadius:10,marginTop:"1rem"}} disabled={loading}>{loading?"Submitting...":"Submit Registration →"}</button>
              <p style={{fontSize:11,color:T.t3,textAlign:"center",marginTop:"0.75rem",lineHeight:1.65}}>
                Registration reviewed by an administrator before activation. Email confirmation sent on approval.
              </p>
            </div>
          )}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:"1.5rem",marginTop:"1.5rem",flexWrap:"wrap"}}>
          {["🔒 AES-256","🛡 Approval Required","✓ GDPR Compliant","⚡ 99.9% Uptime"].map(b=><span key={b} style={{fontSize:11,color:T.t3}}>{b}</span>)}
        </div>
      </div>
      {forgotMode&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#1a1f2e",borderRadius:16,width:"100%",maxWidth:420,padding:"2rem",margin:"1rem",border:"1px solid #2a3040"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#ffffff",marginBottom:8}}>Reset Password</div>
            <div style={{fontSize:12,color:"#aaa",marginBottom:"1rem"}}>Enter your email and we will send a reset link.</div>
            {forgotMsg?(
              <div style={{background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.3)",color:"#22c55e",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:"1rem"}}>{forgotMsg}</div>
            ):(
              <input style={{...s.input,marginBottom:"1rem"}} placeholder="Your email address" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)}/>
            )}
            <div style={{display:"flex",gap:8}}>
              {!forgotMsg&&<button onClick={async()=>{
                if(!forgotEmail.includes("@")){setForgotMsg("Please enter a valid email.");return;}
                setLoading(true);
                const {supabase}=await import("./supabase.js");
                const {error}=await supabase.auth.resetPasswordForEmail(forgotEmail,{redirectTo:"https://www.akadimia.co.ke"});
                setLoading(false);
                if(error){setForgotMsg("Error: "+error.message);}
                else{setForgotMsg("Reset link sent! Check your inbox.");}
              }} style={{...s.btnP,flex:1}} disabled={loading}>{loading?"Sending...":"Send Reset Link"}</button>}
              <button onClick={()=>{setForgotMode(false);setForgotEmail("");setForgotMsg("");}} style={{...s.btnS,flex:1}}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NAV_BASE=[{id:"dashboard",icon:"⊞"},{id:"classroom",icon:"🏫"},{id:"ai",icon:"🤖"},{id:"courses",icon:"📚"},{id:"programme",icon:"🎓"},{id:"tools",icon:"⚙"},{id:"peers",icon:"👥"},{id:"innovation",icon:"💡"},{id:"events",icon:"📣"},{id:"services",icon:"🏛"},{id:"exams",icon:"✏"},{id:"research",icon:"🔬"},{id:"calendar",icon:"📅"},{id:"meetings",icon:"📹"},{id:"opps",icon:"🌐"},{id:"analytics",icon:"📊"},{id:"transcript",icon:"🗂"}];

const Sidebar=({tab,setTab,open,role,userName,userField,offline,setOffline,onLogout})=>{
  const T=useT();const t=useLang();const fld=FIELDS[userField];const s=sx(T);
  const L={dashboard:t("dashboard"),courses:t("courses"),exams:t("exams"),assignments:t("assignments"),research:t("research"),ai:t("ai"),calendar:t("calendar"),meetings:t("meetings"),opps:t("opps"),analytics:t("analytics"),tools:t("tools"),transcript:t("transcript"),peers:t("peers"),classroom:t("classroom"),admin:t("admin"),settings:t("settings"),innovation:"Innovation Hub",programme:"Programme",classroom:"My Classroom",events:"Events",services:"Services"};
  const nav=[...NAV_BASE,...(role==="admin"?[{id:"admin",icon:"🛡"}]:[]),{id:"settings",icon:"⚙"}];
  return(
    <div style={{width:open?256:0,minWidth:open?256:0,background:T.bg1,borderRight:`1px solid ${T.bd}`,display:"flex",flexDirection:"column",transition:"width 0.3s",overflow:"hidden",flexShrink:0}}>
      <div style={{padding:"1.1rem 1rem",borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",gap:10}}>
        <img src="/logo2.png" alt="AKADIMIA" style={{height:44,width:44,objectFit:"contain",flexShrink:0,display:"block"}}/>
        {open&&<div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}><div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14,color:T.t1,letterSpacing:2}}>AKADIMIA</div><div style={{fontSize:9,color:T.ac,fontStyle:"italic",marginTop:1}}>Ujuzi Bila Mipaka</div></div>}
      </div>
      {open&&fld&&(
        <div style={{padding:"0.5rem 0.75rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:7,background:rgba(fld.color,0.15),border:`1px solid ${rgba(fld.color,0.3)}`}}>
            <span style={{fontSize:13}}>{fld.icon}</span>
            <span style={{fontSize:11,color:fld.color,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{fld.name}</span>
          </div>
        </div>
      )}
      {open&&(
        <div style={{padding:"0 0.75rem 0.5rem"}}>
          <div onClick={()=>setOffline(!offline)} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 10px",borderRadius:7,background:offline?rgba(T.amber,0.14):rgba(T.green,0.12),border:`1px solid ${offline?rgba(T.amber,0.3):rgba(T.green,0.25)}`,cursor:"pointer"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:offline?T.amber:T.green}}/>
            <span style={{fontSize:11,color:offline?T.amber:T.green,fontWeight:500}}>{offline?t("offline"):t("online")}</span>
          </div>
        </div>
      )}
      <nav style={{flex:1,overflowY:"auto",padding:"0.3rem 0.5rem"}}>
        {nav.map(item=>{
          const active=tab===item.id;
          return(
            <button key={item.id} onClick={()=>setTab(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,border:"none",marginBottom:1,background:active?`linear-gradient(135deg,${rgba(T.ac,0.18)},${rgba(T.ac,0.07)})`:"transparent",color:active?T.ac:T.t2,fontSize:12,fontWeight:active?600:400,cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif",borderLeft:active?`2px solid ${T.ac}`:"2px solid transparent",transition:"all 0.15s"}}>
              <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
              {open&&<span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{L[item.id]||item.id}</span>}
            </button>
          );
        })}
      </nav>
      {open&&(
        <div style={{padding:"0.85rem",borderTop:`1px solid ${T.bd}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Av name={userName||"U"} size={30} bg={T.purple}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:500,color:T.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{userName}</div>
              <div style={{fontSize:10,color:T.t3,textTransform:"capitalize"}}>{role}</div>
            </div>
            <button onClick={onLogout} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:14,padding:2}}>X</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Topbar=({toggle,tab,lang,setLang,themeId,setThemeId,notifs,setNotifs})=>{
  const [showNotifs,setShowNotifs]=useState(false);
  const T=useT();const t=useLang();
  const L={dashboard:t("dashboard"),courses:t("courses"),exams:t("exams"),assignments:t("assignments"),research:t("research"),ai:t("ai"),calendar:t("calendar"),meetings:t("meetings"),opps:t("opps"),analytics:t("analytics"),tools:t("tools"),transcript:t("transcript"),peers:t("peers"),classroom:t("classroom"),admin:t("admin"),settings:t("settings"),innovation:"Innovation Hub",programme:"Programme",classroom:"My Classroom",events:"Events",services:"Services"};
  const langOpts=Object.entries(LANGS);
  const themeOpts=Object.values(THEMES);
  return(
    <div style={{background:T.bg1,borderBottom:`1px solid ${T.bd}`,padding:"0.6rem 1.25rem",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
      <button onClick={toggle} style={{background:"none",border:"none",color:T.t2,cursor:"pointer",fontSize:18,padding:4,lineHeight:1}}>|||</button>
      <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:T.t2,fontWeight:500}}>{L[tab]||"AKADIMIA"}</span>
      <div style={{flex:1,position:"relative",maxWidth:380}}>
        <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.t3}}>S</span>
        <input placeholder="Search courses, resources, people..." style={{background:T.bg2,border:`1px solid ${T.bd}`,borderRadius:8,padding:"7px 12px 7px 30px",color:T.t1,fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none",width:"100%",boxSizing:"border-box"}}/>
      </div>
      <div style={{flex:1}}/>
      <button onClick={()=>document.dispatchEvent(new CustomEvent('openFeedback'))} style={{background:"none",border:"1px solid "+rgba(T.ac,0.4),borderRadius:7,padding:"5px 12px",color:T.ac,fontSize:11,cursor:"pointer",fontWeight:600,marginRight:4}}>💬 Feedback</button>
      <select value={lang} onChange={e=>{setLang(e.target.value);localStorage.setItem('ak_lang',e.target.value);}} style={{background:T.bg2,border:`1px solid ${T.bd}`,borderRadius:7,padding:"5px 8px",color:T.t2,fontSize:11,cursor:"pointer",outline:"none"}}>
        {langOpts.map(pair=><option key={pair[0]} value={pair[0]}>{pair[1].flag}</option>)}
      </select>
      <select value={themeId} onChange={e=>setThemeId(e.target.value)} style={{background:T.bg2,border:`1px solid ${T.bd}`,borderRadius:7,padding:"5px 8px",color:T.t2,fontSize:11,cursor:"pointer",outline:"none"}}>
        {themeOpts.map(th=><option key={th.id} value={th.id}>{th.emoji}</option>)}
      </select>
      <div style={{position:"relative"}}>
        <button onClick={()=>setShowNotifs(n=>!n)} style={{background:T.bg2,border:`1px solid ${T.bd}`,borderRadius:8,padding:"5px 9px",color:T.t2,cursor:"pointer",fontSize:14}}>🔔</button>
        {notifs.length>0&&<div style={{position:"absolute",top:-3,right:-3,width:15,height:15,background:T.red,borderRadius:"50%",fontSize:9,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{notifs.length}</div>}
        {showNotifs&&(
          <div style={{position:"absolute",top:36,right:0,width:300,background:T.bg1,border:`1px solid ${T.bd}`,borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",zIndex:100,overflow:"hidden"}}>
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.bd}`,fontSize:12,fontWeight:600,color:T.t1,display:"flex",justifyContent:"space-between"}}>
              <span>Notifications</span>
              <button onClick={()=>{setNotifs([]);setShowNotifs(false);}} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:11}}>Clear all</button>
            </div>
            {notifs.length===0?(
              <div style={{padding:"1.5rem",textAlign:"center",color:T.t3,fontSize:12}}>No new notifications</div>
            ):(
              <div style={{maxHeight:300,overflowY:"auto"}}>
                {notifs.map((n,i)=>(
                  <div key={i} style={{padding:"10px 14px",borderBottom:`1px solid ${T.bd}`,display:"flex",gap:10,alignItems:"flex-start"}}>
                    <span style={{fontSize:16,flexShrink:0}}>{n.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:T.t1,fontWeight:500}}>{n.title}</div>
                      <div style={{fontSize:11,color:T.t3}}>{n.body}</div>
                      <div style={{fontSize:10,color:T.t3,marginTop:2}}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardView=({setTab,userName,userField})=>{
  const T=useT();const t=useLang();const s=sx(T);
  const fld=FIELDS[userField]||FIELDS.actuarial;
  const cs=((FIELD_DATA[userField]&&FIELD_DATA[userField].courses)||[]).slice(0,4);
  const [assignments,setAssignments]=useState([]);
  const [materials,setMaterials]=useState([]);
  const [todayMeetings,setTodayMeetings]=useState([]);
  const [news,setNews]=useState([]);
  const [stocks,setStocks]=useState([]);
  const [newsLoading,setNewsLoading]=useState(false);
  const showStocks=["actuarial","business","economics","appstats","appliedmaths","puremaths","entrepreneurship"].includes(userField);

  useEffect(()=>{
    const load=async()=>{
      const {supabase}=await import("./supabase.js");
      const {data:asgn}=await supabase.from("assignments").select("*").eq("field",userField).order("created_at",{ascending:false}).limit(5);
      const {data:mats}=await supabase.from("course_materials").select("*").eq("field",userField).order("created_at",{ascending:false}).limit(3);
      const {data:mtgs}=await supabase.from("meetings").select("*").order("scheduled_at",{ascending:true});
      const today=new Date();
      const todayStr=today.toDateString();
      const todayM=(mtgs||[]).filter(m=>new Date(m.scheduled_at).toDateString()===todayStr);
      setAssignments(asgn||[]);
      setMaterials(mats||[]);
      setTodayMeetings(todayM);
    };
    load();
  },[userField]);

  useEffect(()=>{
    const loadNews=async()=>{
      setNewsLoading(true);
      try{
        const fieldName=(fld&&fld.name)||userField;
        const today=new Date().toLocaleDateString("en-KE",{day:"numeric",month:"long",year:"numeric"});
        const res=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
          body:JSON.stringify({
            model:"claude-haiku-4-5-20251001",
            max_tokens:1000,
            tools:[{type:"web_search_20250305",name:"web_search"}],
            messages:[{role:"user",content:`Today is ${today}. Search for 4 current news stories relevant to ${fieldName} students in Kenya and East Africa. ${showStocks?"Also find current NSE (Nairobi Securities Exchange) top stock prices today.":""} Return ONLY a JSON object with two arrays: "news" (each item: headline, summary 1 sentence, source, url) and "stocks" (each item: symbol, name, price, change, changePercent - use real NSE data if available, otherwise skip). No markdown.`}]
          })
        });
        const d=await res.json();
        let text="";
        if(d.content){for(const b of d.content){if(b.type==="text")text+=b.text;}}
        const clean=text.replace(/```json|```/g,"").trim();
        const jsonStart=clean.indexOf("{");const jsonEnd=clean.lastIndexOf("}");
        if(jsonStart>=0&&jsonEnd>jsonStart){
          const parsed=JSON.parse(clean.slice(jsonStart,jsonEnd+1));
          setNews(parsed.news||[]);
          setStocks(parsed.stocks||[]);
        }
      }catch(e){console.error(e);}
      setNewsLoading(false);
    };
    loadNews();
  },[userField]);

  const upcoming=assignments.filter(a=>a.due_date&&new Date(a.due_date)>=new Date()).sort((a,b)=>new Date(a.due_date)-new Date(b.due_date)).slice(0,3);
  const overdue=assignments.filter(a=>a.due_date&&new Date(a.due_date)<new Date());
  const schedule=[];
  const perfData=[{w:"W1",sc:67},{w:"W2",sc:72},{w:"W3",sc:69},{w:"W4",sc:74},{w:"W5",sc:78},{w:"W6",sc:75},{w:"W7",sc:82},{w:"W8",sc:88}];

  return(
    <div>
      <h1 style={s.h1}>{t("welcome")}, {userName.split(" ")[0]}</h1>
      <p style={s.sub}><span style={{...s.tag(fld.color),marginRight:8}}>{fld.icon} {fld.name}</span>Semester 1, 2026 · AKADIMIA</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.25rem"}}>
        <StatCard label="Assignments" value={upcoming.length} sub={upcoming.length===0?"All done":"Due soon"} color={upcoming.length>0?T.amber:T.green} icon="📋"/>
        <StatCard label="Active Courses" value={cs.length} sub="This semester" color={T.blue} icon="📚"/>
        <StatCard label="Pending Tasks" value={upcoming.length+overdue.length} sub="Assignments due" color={upcoming.length+overdue.length>0?T.amber:T.green} icon="📋"/>
        <StatCard label="New Materials" value={materials.length} sub="Recently uploaded" color={T.purple} icon="📂"/>
      </div>

      {showStocks&&(
        <div style={{...s.card,marginBottom:"1.25rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:600,color:T.t1}}>📈 NSE Market Today</div>
            <span style={{fontSize:10,color:T.t3}}>Nairobi Securities Exchange · Live</span>
          </div>
          {newsLoading?(
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[1,2,3,4].map(i=><div key={i} style={{height:70,background:T.bg3,borderRadius:8}}/>)}
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
              {stocks.map((st,i)=>{
                const up=parseFloat(st.changePercent)>=0;
                return(
                  <div key={i} style={{background:T.bg3,borderRadius:8,padding:"8px 10px",borderLeft:`3px solid ${up?T.green:T.red}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.t1}}>{st.symbol}</div>
                    <div style={{fontSize:10,color:T.t3,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st.name}</div>
                    <div style={{fontSize:13,fontWeight:600,color:T.t1}}>KES {st.price}</div>
                    <div style={{fontSize:10,color:up?T.green:T.red}}>{up?"▲":"▼"} {st.changePercent}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1.25rem"}}>
        <div style={s.card}>
          <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:"0.85rem"}}>Performance Trend</div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={perfData}>
              <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.ac} stopOpacity={0.3}/><stop offset="95%" stopColor={T.ac} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="w" tick={{fontSize:9,fill:T.t3}} axisLine={false} tickLine={false}/>
              <YAxis domain={[50,100]} tick={{fontSize:9,fill:T.t3}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:T.bg2,border:`1px solid ${T.bd}`,borderRadius:6,fontSize:11}} labelStyle={{color:T.t2}}/>
              <Area type="monotone" dataKey="sc" stroke={T.ac} fill="url(#pg)" strokeWidth={2} dot={{fill:T.ac,r:3}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.85rem"}}>
            <div style={{fontSize:13,fontWeight:600,color:T.t1}}>Recent Materials</div>
            <button onClick={()=>setTab("courses")} style={{...s.btnS,fontSize:10,padding:"3px 8px"}}>View All</button>
          </div>
          {materials.length===0?(
            <div style={{fontSize:12,color:T.t3,textAlign:"center",padding:"1rem"}}>No materials uploaded yet</div>
          ):(
            materials.map((m,i)=>{
              const icon=m.file_type&&m.file_type.includes("pdf")?"📕":m.file_type&&m.file_type.includes("video")?"🎬":m.file_type&&m.file_type.includes("audio")?"🎧":"📄";
              return(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:i<materials.length-1?`1px solid ${T.bd}`:"none"}}>
                  <span style={{fontSize:16}}>{icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:T.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</div>
                    <div style={{fontSize:10,color:T.t3}}>{m.course_code} · {new Date(m.created_at).toLocaleDateString()}</div>
                  </div>
                  <a href={m.file_url} target="_blank" rel="noreferrer" style={{fontSize:10,color:T.ac,textDecoration:"none",flexShrink:0}}>Open →</a>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:"1.25rem"}}>
        <div style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:T.t1}}>Upcoming Assignments</div>
            <button onClick={()=>setTab("assignments")} style={{...s.btnS,fontSize:10,padding:"3px 8px"}}>View All</button>
          </div>
          {upcoming.length===0?(
            <div style={{fontSize:12,color:T.t3,textAlign:"center",padding:"1rem"}}>No upcoming assignments</div>
          ):(
            upcoming.map((a,i)=>{
              const daysLeft=Math.ceil((new Date(a.due_date)-new Date())/(1000*60*60*24));
              const label=daysLeft===0?"Today":daysLeft===1?"Tomorrow":daysLeft<0?"Overdue":"In "+daysLeft+" days";
              const color=daysLeft<0?T.red:daysLeft<=2?T.amber:T.green;
              return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.bd}`}}>
                  <div>
                    <div style={{fontSize:12,color:T.t1}}>{a.title}</div>
                    <div style={{fontSize:10,color:T.t3}}>{a.course_code}</div>
                  </div>
                  <Pill text={label} color={color}/>
                </div>
              );
            })
          )}
          {overdue.length>0&&<div style={{fontSize:11,color:T.red,marginTop:8}}>⚠ {overdue.length} overdue assignment{overdue.length>1?"s":""}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={s.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:600,color:T.t1}}>Today's Classes</div>
              <button onClick={()=>setTab("meetings")} style={{...s.btnS,fontSize:10,padding:"2px 8px"}}>View All</button>
            </div>
            {todayMeetings.length===0?(
              <div style={{fontSize:11,color:T.t3,textAlign:"center",padding:"0.75rem"}}>No classes scheduled today</div>
            ):(
              todayMeetings.map((m,i)=>{
                const dt=new Date(m.scheduled_at);
                return(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:7}}>
                    <span style={{fontSize:10,color:T.t3,width:50,flexShrink:0}}>{dt.toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"})}</span>
                    <div style={{width:3,height:26,background:T.ac,borderRadius:2}}/>
                    <span style={{fontSize:11,color:T.t1,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</span>
                  </div>
                );
              })
            )}
          </div>
          <div style={s.acCard}>
            <div style={{fontSize:10,color:T.ac,letterSpacing:0.8,marginBottom:6}}>AI SUGGESTION</div>
            <p style={{fontSize:12,color:T.t1,lineHeight:1.65,margin:"0 0 10px"}}>Consider joining <strong style={{color:T.ac}}>{(FIELD_DATA[userField]&&FIELD_DATA[userField].bodies&&FIELD_DATA[userField].bodies[0])||fld.name+" body"}</strong> this semester.</p>
            <button onClick={()=>setTab("transcript")} style={{...s.btnS,fontSize:11,padding:"5px 12px"}}>View Career Plan</button>
          </div>
        </div>
      </div>



      <div style={s.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:600,color:T.t1}}>🌍 Current Affairs — {fld.name}</div>
          {newsLoading&&<span style={{fontSize:11,color:T.t3}}>Loading...</span>}
        </div>
        {newsLoading?(
          <div style={{display:"grid",gap:8}}>
            {[1,2,3].map(i=><div key={i} style={{height:60,background:T.bg3,borderRadius:8,animation:"pulse 1.5s infinite"}}/>)}
          </div>
        ):news.length===0?(
          <div style={{fontSize:12,color:T.t3,textAlign:"center",padding:"1rem"}}>Loading current affairs...</div>
        ):(
          <div style={{display:"grid",gap:10}}>
            {news.map((n,i)=>(
              <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<news.length-1?`1px solid ${T.bd}`:"none"}}>
                <div style={{width:4,background:T.ac,borderRadius:2,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:T.t1,marginBottom:4,lineHeight:1.4}}>{n.headline}</div>
                  <div style={{fontSize:11,color:T.t2,lineHeight:1.5,marginBottom:4}}>{n.summary}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:10,color:T.t3}}>{n.source}</span>
                    {n.url&&n.url.startsWith("http")&&<a href={n.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:T.ac,textDecoration:"none"}}>Read more →</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
const CoursesView=({userField,role,userName})=>{
  const T=useT();const t=useLang();const s=sx(T);
  const [open,setOpen]=useState(null);
  const [materials,setMaterials]=useState([]);
  const [uploading,setUploading]=useState(false);
  const [showUpload,setShowUpload]=useState(false);
  const [uploadTitle,setUploadTitle]=useState("");
  const [uploadDesc,setUploadDesc]=useState("");
  const [uploadCourse,setUploadCourse]=useState("");
  const [uploadFile,setUploadFile]=useState(null);
  const [uploadErr,setUploadErr]=useState("");
  const [uploadLink,setUploadLink]=useState("");
  const [uploadPasscode,setUploadPasscode]=useState("");
  const [uploadLevel,setUploadLevel]=useState("undergraduate");
  const [uploadYear,setUploadYear]=useState("");
  const [editId,setEditId]=useState(null);
  const [editTitle,setEditTitle]=useState("");
  const [editDesc,setEditDesc]=useState("");
  const [editLink,setEditLink]=useState("");
  const [editPasscode,setEditPasscode]=useState("");
  const [editLevel,setEditLevel]=useState("undergraduate");
  const [editYear,setEditYear]=useState("");
  const fileRef=useRef(null);
  const videoRef=useRef(null);
  const audioRef=useRef(null);
  const [uploadVideo,setUploadVideo]=useState(null);
  const [uploadAudio,setUploadAudio]=useState(null);
  const courses=(FIELD_DATA[userField]&&FIELD_DATA[userField].courses)||[];
  const fld=FIELDS[userField];
  const isLec=role==="lecturer"||role==="admin";

  useEffect(()=>{
    import("./materials.js").then(({getMaterials})=>{
      getMaterials(userField).then(data=>setMaterials(data));
    });
  },[userField]);

  const handleUpload=async()=>{
    if(!uploadTitle||!uploadCourse){setUploadErr("Please enter a title and course code.");return;}
    if(!uploadFile&&!uploadVideo&&!uploadAudio&&!uploadLink){setUploadErr("Please attach at least one file or paste a link.");return;}
    setUploading(true);setUploadErr("");
    const {uploadMaterial,saveLinkMaterial}=await import("./materials.js");
    let result={success:true};
    if(uploadFile){
      result=await uploadMaterial(uploadFile,uploadCourse,userField,uploadTitle+" (Notes)",uploadDesc,userName||"Lecturer",uploadPasscode,uploadLink,uploadLevel,uploadYear);
      if(result.error){setUploadErr(result.error);setUploading(false);return;}
    }
    if(uploadVideo){
      result=await uploadMaterial(uploadVideo,uploadCourse,userField,uploadTitle+" (Video)",uploadDesc,userName||"Lecturer",uploadPasscode,"",uploadLevel,uploadYear);
      if(result.error){setUploadErr(result.error);setUploading(false);return;}
    }
    if(uploadAudio){
      result=await uploadMaterial(uploadAudio,uploadCourse,userField,uploadTitle+" (Audio)",uploadDesc,userName||"Lecturer",uploadPasscode,"",uploadLevel,uploadYear);
      if(result.error){setUploadErr(result.error);setUploading(false);return;}
    }
    if(uploadLink&&!uploadFile){
      result=await saveLinkMaterial(uploadLink,uploadCourse,userField,uploadTitle,uploadDesc,userName||"Lecturer",uploadPasscode,uploadLevel,uploadYear);
      if(result.error){setUploadErr(result.error);setUploading(false);return;}
    }
    setUploading(false);
    if(result.error){setUploadErr(result.error);return;}
    const {getMaterials}=await import("./materials.js");
    const updated=await getMaterials(userField);
    setMaterials(updated);
    setShowUpload(false);setUploadTitle("");setUploadDesc("");setUploadFile(null);setUploadVideo(null);setUploadAudio(null);setUploadCourse("");setUploadLink("");setUploadPasscode("");setUploadLevel("undergraduate");setUploadYear("");
  };

  const courseMaterials=(code)=>materials.filter(m=>m.course_code===code);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div>
          <h1 style={s.h1}>{t("courses")}</h1>
          <p style={s.sub}><span style={{...s.tag(fld?.color||T.ac),marginRight:8}}>{fld?.icon} {fld?.name}</span>Notes · Recordings · Past papers</p>
        </div>
        {isLec&&<button onClick={()=>setShowUpload(!showUpload)} style={s.btnP}>+ Upload Material</button>}
      </div>
      {isLec&&showUpload&&(
        <div style={{...s.card,marginBottom:"1.25rem",border:`1px solid ${rgba(T.ac,0.3)}`}}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Upload Course Material</div>
          {uploadErr&&<div style={{color:T.red,fontSize:12,marginBottom:8}}>{uploadErr}</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} placeholder="e.g. Week 3 Lecture Notes" value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)}/></div>
            <div><label style={s.lbl}>COURSE CODE</label>
              <input style={s.input} placeholder="e.g. SAC 101 or type any code" value={uploadCourse} onChange={e=>setUploadCourse(e.target.value)} list="course-list"/>
              <datalist id="course-list">{courses.map(c=><option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}</datalist>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>PROGRAMME LEVEL</label>
              <select style={s.input} value={uploadLevel} onChange={e=>setUploadLevel(e.target.value)}>
                <option value="undergraduate">Undergraduate</option>
                <option value="masters">Masters (Postgraduate)</option>
                <option value="phd">PhD (Doctoral)</option>
              </select>
            </div>
            <div><label style={s.lbl}>YEAR / SEMESTER</label>
              <select style={s.input} value={uploadYear} onChange={e=>setUploadYear(e.target.value)}>
                <option value="">Select...</option>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="Masters Sem 1">Masters Sem 1</option>
                <option value="Masters Sem 2">Masters Sem 2</option>
                <option value="PhD Year 1">PhD Year 1</option>
                <option value="PhD Year 2">PhD Year 2</option>
                <option value="PhD Year 3+">PhD Year 3+</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:"1rem"}}><label style={s.lbl}>DESCRIPTION (optional)</label><input style={s.input} placeholder="Brief description of this week's content..." value={uploadDesc} onChange={e=>setUploadDesc(e.target.value)}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
            <div style={{...s.card,background:T.bg3,padding:"0.85rem"}}>
              <div style={{fontSize:11,color:T.ac,fontWeight:700,marginBottom:8}}>📄 DOCUMENT / SLIDES / NOTES</div>
              <div onClick={()=>fileRef.current&&fileRef.current.click()} style={{border:`2px dashed ${uploadFile?T.green:T.bd}`,borderRadius:8,padding:"0.75rem",textAlign:"center",cursor:"pointer",color:uploadFile?T.green:T.t3,fontSize:12,marginBottom:6}}>
                {uploadFile?"✓ "+uploadFile.name+" ("+(uploadFile.size/1024/1024).toFixed(1)+"MB)":"Click to attach PDF, Word or PowerPoint"}
              </div>
              <input ref={fileRef} type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg" onChange={e=>setUploadFile(e.target.files[0]||null)}/>
              {uploadFile&&<button onClick={()=>setUploadFile(null)} style={{...s.btnD,fontSize:10,padding:"3px 8px",width:"100%"}}>Remove file</button>}
            </div>
            <div style={{...s.card,background:T.bg3,padding:"0.85rem"}}>
              <div style={{fontSize:11,color:T.purple,fontWeight:700,marginBottom:8}}>🎬 VIDEO FILE (MP4, WEBM)</div>
              <div onClick={()=>videoRef.current&&videoRef.current.click()} style={{border:`2px dashed ${uploadVideo?T.purple:T.bd}`,borderRadius:8,padding:"0.75rem",textAlign:"center",cursor:"pointer",color:uploadVideo?T.purple:T.t3,fontSize:12,marginBottom:6}}>
                {uploadVideo?"✓ "+uploadVideo.name+" ("+(uploadVideo.size/1024/1024).toFixed(1)+"MB)":"Click to attach video (max 2GB)"}
              </div>
              <input ref={videoRef} type="file" style={{display:"none"}} accept=".mp4,.webm,.mov,.avi,.mpeg,.mpg,video/*" onChange={e=>setUploadVideo(e.target.files[0]||null)}/>
              {uploadVideo&&<button onClick={()=>setUploadVideo(null)} style={{...s.btnD,fontSize:10,padding:"3px 8px",width:"100%"}}>Remove video</button>}
            </div>
            <div style={{...s.card,background:T.bg3,padding:"0.85rem"}}>
              <div style={{fontSize:11,color:T.teal,fontWeight:700,marginBottom:8}}>🎧 AUDIO FILE (MP3, M4A)</div>
              <div onClick={()=>audioRef.current&&audioRef.current.click()} style={{border:`2px dashed ${uploadAudio?T.teal:T.bd}`,borderRadius:8,padding:"0.75rem",textAlign:"center",cursor:"pointer",color:uploadAudio?T.teal:T.t3,fontSize:12,marginBottom:6}}>
                {uploadAudio?"✓ "+uploadAudio.name+" ("+(uploadAudio.size/1024/1024).toFixed(1)+"MB)":"Click to attach audio recording"}
              </div>
              <input ref={audioRef} type="file" style={{display:"none"}} accept=".mp3,.m4a,.wav,.aac" onChange={e=>setUploadAudio(e.target.files[0]||null)}/>
              {uploadAudio&&<button onClick={()=>setUploadAudio(null)} style={{...s.btnD,fontSize:10,padding:"3px 8px",width:"100%"}}>Remove audio</button>}
            </div>
            <div style={{...s.card,background:T.bg3,padding:"0.85rem"}}>
              <div style={{fontSize:11,color:T.blue,fontWeight:700,marginBottom:8}}>🔗 EXTERNAL LINK (Zoom, YouTube, Drive)</div>
              <input style={{...s.input,marginBottom:6}} placeholder="https://..." value={uploadLink} onChange={e=>setUploadLink(e.target.value)}/>
              <input style={{...s.input,fontSize:12}} placeholder="Passcode (if required)" value={uploadPasscode} onChange={e=>setUploadPasscode(e.target.value)}/>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={handleUpload} style={s.btnP} disabled={uploading}>{uploading?"Uploading...":"Upload All →"}</button>
            <button onClick={()=>setShowUpload(false)} style={s.btnS}>Cancel</button>
          </div>
        </div>
      )}
      {materials.length===0?(
        <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
          <div style={{fontSize:40,marginBottom:12}}>📚</div>
          <div style={{fontSize:14,color:T.t2,marginBottom:8}}>No materials uploaded yet.</div>
          {isLec&&<div style={{fontSize:12,color:T.t3}}>Click "+ Upload Material" to add lecture notes, recordings or links.</div>}
        </div>
      ):(()=>{
        const levelOrder=["undergraduate","masters","phd"];
        const levelLabel={"undergraduate":"🎓 Undergraduate","masters":"📘 Masters (Postgraduate)","phd":"🔬 PhD (Doctoral)"};
        const levelColor={"undergraduate":T.ac,"masters":T.purple,"phd":T.teal};
        const grouped={};
        materials.forEach(m=>{
          const lvl=m.programme_level||"undergraduate";
          const yr=m.year_level||"General";
          if(!grouped[lvl])grouped[lvl]={};
          if(!grouped[lvl][yr])grouped[lvl][yr]=[];
          grouped[lvl][yr].push(m);
        });
        return(
        <div style={{display:"grid",gap:20}}>
          {levelOrder.filter(lvl=>grouped[lvl]).map(lvl=>(
            <div key={lvl}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,paddingBottom:8,borderBottom:`2px solid ${rgba(levelColor[lvl],0.4)}`}}>
                <span style={{fontSize:15,fontWeight:700,color:levelColor[lvl]}}>{levelLabel[lvl]}</span>
                <span style={{fontSize:11,color:T.t3,background:rgba(levelColor[lvl],0.12),borderRadius:10,padding:"2px 10px"}}>{Object.values(grouped[lvl]).flat().length} resource{Object.values(grouped[lvl]).flat().length>1?"s":""}</span>
              </div>
              {Object.keys(grouped[lvl]).sort().map(yr=>(
                <div key={yr} style={{marginBottom:16}}>
                  {yr!=="General"&&<div style={{fontSize:11,fontWeight:700,color:T.t2,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>📅 {yr}</div>}
                  <div style={{display:"grid",gap:8}}>
                  {grouped[lvl][yr].map(m=>{
            const isVideo=m.file_type&&(m.file_type.includes("video")||m.file_type.includes("zoom")||m.file_type.includes("loom"));
            const isAudio=m.file_type&&m.file_type.includes("audio");
            const isExternal=m.file_type&&m.file_type.includes("external");
            const isPDF=m.file_type&&m.file_type.includes("pdf");
            const isPPT=m.file_type&&(m.file_type.includes("powerpoint")||m.file_type.includes("presentation"));
            const isDoc=m.file_type&&(m.file_type.includes("word")||m.file_type.includes("document"));
            const icon=isPDF?"📕":isVideo?"🎬":isAudio?"🎧":isExternal?"🔗":isPPT?"📙":isDoc?"📘":"📄";
            const btnLabel=isVideo?"▶ Watch Recording":isAudio?"▶ Listen":isExternal?"🔗 Open Link":isPDF?"📖 View PDF":isPPT?"📊 View Slides":"⬇ Download";
            const typeLabel=isPDF?"PDF":isVideo?"Video":isAudio?"Audio":isExternal?"External Link":isPPT?"Slides":isDoc?"Document":"File";
            return(
              <div key={m.id} style={{...s.card,borderLeft:`3px solid ${isPDF?T.red:isVideo?T.purple:isAudio?T.teal:isExternal?T.blue:isPPT?T.amber:T.t3}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:18}}>{icon}</span>
                      <span style={{fontSize:14,fontWeight:600,color:T.t1}}>{m.title}</span>
                      <span style={{...s.tag(isPDF?T.red:isVideo?T.purple:isAudio?T.teal:isExternal?T.blue:T.amber),fontSize:10}}>{typeLabel}</span>
                    </div>
                    <div style={{fontSize:11,color:T.t3,marginBottom:m.description?4:0}}>
                      {m.course_code&&<span style={{background:rgba(T.ac,0.15),color:T.ac,borderRadius:4,padding:"1px 6px",marginRight:6,fontSize:10,fontWeight:600}}>{m.course_code}</span>}
                      {m.year_level&&<span style={{background:rgba(T.purple,0.15),color:T.purple,borderRadius:4,padding:"1px 6px",marginRight:6,fontSize:10,fontWeight:600}}>{m.year_level}</span>}
                      {m.uploader_name} · {new Date(m.created_at).toLocaleDateString()}
                      {m.file_size>0&&" · "+(m.file_size/1024/1024).toFixed(1)+"MB"}
                    </div>
                    {m.description&&<div style={{fontSize:12,color:T.t2}}>{m.description}</div>}
                    {m.passcode&&<div style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:4,background:rgba(T.amber,0.12),border:`1px solid ${rgba(T.amber,0.3)}`,borderRadius:6,padding:"3px 10px",fontSize:11,color:T.amber}}>🔑 Passcode: <strong>{m.passcode}</strong></div>}
                    {editId===m.id&&(
                      <div style={{marginTop:12,padding:12,background:T.bg4,borderRadius:8,display:"grid",gap:8}} onClick={e=>e.stopPropagation()}>
                        <div style={{fontSize:11,fontWeight:700,color:T.ac,marginBottom:4}}>EDIT MATERIAL</div>
                        <input style={s.input} placeholder="Title" defaultValue={m.title} onChange={e=>setEditTitle(e.target.value)}/>
                        <input style={s.input} placeholder="Description" defaultValue={m.description||""} onChange={e=>setEditDesc(e.target.value)}/>
                        <input style={s.input} placeholder="Recording link (https://...)" defaultValue={m.link_url||""} onChange={e=>setEditLink(e.target.value)}/>
                        <input style={s.input} placeholder="Passcode" defaultValue={m.passcode||""} onChange={e=>setEditPasscode(e.target.value)}/>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          <select style={s.input} defaultValue={m.programme_level||"undergraduate"} onChange={e=>setEditLevel(e.target.value)}>
                            <option value="undergraduate">Undergraduate</option>
                            <option value="masters">Masters</option>
                            <option value="phd">PhD</option>
                          </select>
                          <select style={s.input} defaultValue={m.year_level||""} onChange={e=>setEditYear(e.target.value)}>
                            <option value="">General</option>
                            <option value="Year 1">Year 1</option>
                            <option value="Year 2">Year 2</option>
                            <option value="Year 3">Year 3</option>
                            <option value="Year 4">Year 4</option>
                            <option value="Masters Sem 1">Masters Sem 1</option>
                            <option value="Masters Sem 2">Masters Sem 2</option>
                            <option value="PhD Year 1">PhD Year 1</option>
                            <option value="PhD Year 2">PhD Year 2</option>
                            <option value="PhD Year 3+">PhD Year 3+</option>
                          </select>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={async()=>{
                            const {supabase}=await import("./supabase.js");
                            await supabase.from("course_materials").update({
                              title:editTitle||m.title,
                              description:editDesc!==undefined?editDesc:m.description,
                              link_url:editLink||m.link_url,
                              passcode:editPasscode||m.passcode,
                              programme_level:editLevel||m.programme_level,
                              year_level:editYear||m.year_level
                            }).eq("id",m.id);
                            const {getMaterials}=await import("./materials.js");
                            const updated=await getMaterials(userField);
                            setMaterials(updated);setEditId(null);
                          }} style={{...s.btnP,fontSize:11,padding:"6px 14px"}}>Save Changes</button>
                          <button onClick={()=>setEditId(null)} style={{...s.btnS,fontSize:11,padding:"6px 14px"}}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                    <a href={m.file_url} target="_blank" rel="noreferrer" style={{...s.btnP,fontSize:12,padding:"7px 14px",textDecoration:"none",textAlign:"center"}}>{btnLabel}</a>
                    {m.link_url&&<a href={m.link_url} target="_blank" rel="noreferrer" style={{...s.btnS,fontSize:11,padding:"6px 14px",textDecoration:"none",textAlign:"center",color:T.purple}}>▶ Watch Recording</a>}
                    {isLec&&<button onClick={()=>setEditId(editId===m.id?null:m.id)} style={{...s.btnS,fontSize:11,padding:"5px 10px",textAlign:"center"}}>✏ Edit</button>}{role==="admin"&&<button onClick={async(e)=>{e.stopPropagation();if(window.confirm("Delete this material?")){const {deleteMaterial,getMaterials}=await import("./materials.js");await deleteMaterial(m.id);const updated=await getMaterials(userField);setMaterials(updated);}}} style={{...s.btnD,fontSize:11,padding:"5px 10px",textAlign:"center"}}>✕ Delete</button>}
                  </div>
                </div>
              </div>
            );
          })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        );
      })()}

    </div>
  );
};
const AssignmentsView=({userField,role,userName,addNotif})=>{
  const T=useT();const s=sx(T);
  const [assignments,setAssignments]=useState([]);
  const [submissions,setSubmissions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showCreate,setShowCreate]=useState(false);
  const [editingA,setEditingA]=useState(null);
  const [selected,setSelected]=useState(null);
  const [submitting,setSubmitting]=useState(false);
  const [grading,setGrading]=useState(null);
  const [newA,setNewA]=useState({title:"",description:"",course_code:"",due_date:"",max_marks:100,target_year:"all"});
  const [assignmentFile,setAssignmentFile]=useState(null);
  const [subComment,setSubComment]=useState("");
  const [subFile,setSubFile]=useState(null);
  const [gradeFeedback,setGradeFeedback]=useState("");
  const [gradeMarks,setGradeMarks]=useState("");
  const assignFileRef=useRef(null);
  const fileRef=useRef(null);
  const isLec=role==="lecturer"||role==="admin";

  const [myYearLevel,setMyYearLevel]=useState("");
  const load=async()=>{
    setLoading(true);
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    const {data:profile}=await supabase.from("profiles").select("year_level,role").eq("id",user.id).single();
    const yearLevel=profile?.year_level||"";
    setMyYearLevel(yearLevel);
    const query=supabase.from("assignments").select("*").eq("field",userField).order("created_at",{ascending:false});
    const {data:asgn}=await query;
    const filtered=(asgn||[]).filter(a=>{
      if(isLec) return true;
      if(!a.target_year||a.target_year==="all") return true;
      return a.target_year===yearLevel;
    });
    const {data:subs}=await supabase.from("submissions").select("*").order("submitted_at",{ascending:false});
    setAssignments(filtered);setSubmissions(subs||[]);setLoading(false);
  };
  useEffect(()=>{load();},[userField]);

  const createAssignment=async()=>{
    if(!newA.title||!newA.course_code)return;
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    let fileUrl="";
    if(assignmentFile){
      const path="assignments/"+userField+"/"+Date.now()+"_"+assignmentFile.name.replace(/\s+/g,"_");
      const {data:upData}=await supabase.storage.from("course-materials").upload(path,assignmentFile);
      if(upData){const {data:urlData}=supabase.storage.from("course-materials").getPublicUrl(path);fileUrl=urlData.publicUrl;}
    }
    const {questions:qs,assignment_type,group_size,allow_late,...baseData}=newA;
    const payload={title:baseData.title,course_code:baseData.course_code,description:baseData.description,due_date:baseData.due_date?new Date(baseData.due_date).toISOString():null,max_marks:baseData.max_marks,target_year:baseData.target_year,field:userField,file_url:fileUrl||null,assignment_type:assignment_type||"individual",group_size:group_size||3,allow_late:allow_late||false};
    let insertedA,insertErr;
    if(editingA){({data:insertedA,error:insertErr}=await supabase.from("assignments").update(payload).eq("id",editingA).select());if(insertedA)insertedA=insertedA[0];}
    else{({data:insertedA,error:insertErr}=await supabase.from("assignments").insert({...payload,created_by:user.id}).select().single());}
    if(insertErr){console.error("Assignment insert error:",insertErr);if(addNotif)addNotif("❌","Error","Failed to post assignment: "+insertErr.message);setCreating(false);return;}
    // Save questions separately if any
    if(qs&&qs.length>0&&insertedA){
      await supabase.from("assignment_questions").insert(qs.map(q=>({...q,assignment_id:insertedA.id,field:userField})));
    }
    // Email notification to students
    try{
      let q=supabase.from("profiles").select("*").eq("field",userField).eq("status","approved").eq("role","student");if(newA.target_year&&newA.target_year!=="All"){q=q.eq("year_level",newA.target_year);}const {data:students}=await q;
      if(students&&students.length>0){
        const dueStr=newA.due_date?new Date(newA.due_date).toLocaleDateString("en-KE"):"No deadline";
        const emailHtml=`<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0"><div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#1a1a2e;padding:20px 24px;text-align:center"><div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:3px">AKADIMIA</div></div><div style="padding:24px"><p style="font-size:16px;font-weight:700;color:#1a1a2e">New Assignment Posted</p><p style="font-size:14px;color:#444"><strong>${newA.title}</strong> has been posted for ${userField} students.</p><table style="width:100%;border-collapse:collapse;margin:16px 0"><tr><td style="padding:8px 12px;background:#f9f9f9;font-size:12px;color:#888;width:40%">Course Code</td><td style="padding:8px 12px;font-size:13px;color:#333">${newA.course_code||"Not specified"}</td></tr><tr><td style="padding:8px 12px;background:#f9f9f9;font-size:12px;color:#888">Due Date</td><td style="padding:8px 12px;font-size:13px;color:#e00">${dueStr}</td></tr><tr><td style="padding:8px 12px;background:#f9f9f9;font-size:12px;color:#888">Max Marks</td><td style="padding:8px 12px;font-size:13px;color:#333">${newA.max_marks}</td></tr><tr><td style="padding:8px 12px;background:#f9f9f9;font-size:12px;color:#888">Type</td><td style="padding:8px 12px;font-size:13px;color:#333">${newA.assignment_type==="group"?"Group ("+newA.group_size+" members)":"Individual"}</td></tr></table><div style="text-align:center;margin:20px 0"><a href="https://akadimia.co.ke" style="display:inline-block;background:#D4A017;color:#000;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:13px">Open AKADIMIA</a></div><p style="font-size:11px;color:#999;text-align:center">Log in and go to My Classroom to view and submit.</p></div></div></body></html>`;
        await fetch(import.meta.env.VITE_SUPABASE_URL+"/functions/v1/send-email",{method:"POST",headers:{"Content-Type":"application/json","apikey":import.meta.env.VITE_SUPABASE_KEY,"Authorization":"Bearer "+import.meta.env.VITE_SUPABASE_KEY},body:JSON.stringify({to:students.map(s=>s.email||s.id).filter(e=>e&&e.includes("@")),subject:"New Assignment: "+newA.title+" — Due "+dueStr,html:emailHtml})});
      }
    }catch(emailErr){console.log("Email notification error:",emailErr);}
    try{
      const query=supabase.from("profiles").select("*").eq("status","approved").eq("field",userField);
      const {data:allProfiles}=await query;
      const students=(allProfiles||[]).filter(p=>{
        if(newA.target_year==="All") return true;
        return String(p.year_level)===String(newA.target_year);
      });
      if(students&&students.length>0){
        const {sendAssignmentEmail}=await import("./email.js");
        for(const st of students){if(st.email)await sendAssignmentEmail(st.email,st.full_name||"Student",{...newA,field:userField});}
      }
    }catch(e){console.error(e);}
    setShowCreate(false);setNewA({title:"",description:"",course_code:"",due_date:"",max_marks:100,target_year:"all"});setAssignmentFile(null);
    load();
  };

  const submitAssignment=async(assignmentId)=>{
    if(!subFile&&!subComment)return;
    setSubmitting(true);
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    let fileUrl="";
    if(subFile){
      const path="submissions/"+assignmentId+"/"+user.id+"_"+Date.now()+"_"+subFile.name;
      const {data:upData}=await supabase.storage.from("course-materials").upload(path,subFile);
      if(upData){const {data:urlData}=supabase.storage.from("course-materials").getPublicUrl(path);fileUrl=urlData.publicUrl;}
    }
    await supabase.from("submissions").insert({assignment_id:assignmentId,student_id:user.id,student_name:userName,file_url:fileUrl,comment:subComment,status:"submitted"});
    if(addNotif) addNotif("📋","Assignment Submitted","Your submission has been recorded successfully.");
    setSubComment("");setSubFile(null);setSelected(null);load();setSubmitting(false);
  };

  const gradeSubmission=async(subId)=>{
    if(!gradeMarks)return;
    const {supabase}=await import("./supabase.js");
    await supabase.from("submissions").update({marks:parseInt(gradeMarks),feedback:gradeFeedback,status:"graded"}).eq("id",subId);
    if(addNotif) addNotif("✅","Assignment Graded","A submission has been graded successfully.");
    setGrading(null);setGradeFeedback("");setGradeMarks("");load();
  };

  const mySubmission=(aId)=>submissions.find(s=>s.assignment_id===aId&&s.student_name===userName);
  const asgSubmissions=(aId)=>submissions.filter(s=>s.assignment_id===aId);
  const isOverdue=(d)=>d&&new Date(d)<new Date();
  if(loading)return <div style={{...s.card,textAlign:"center",padding:"3rem",color:T.t3}}>Loading assignments...</div>;
  const exportAssignments=()=>exportCSV("AKADIMIA_Assignments_"+new Date().toISOString().slice(0,10),["Title","Course Code","Due Date","Max Marks","Target Year","Submissions"],assignments.map(a=>[a.title,a.course_code,a.due_date||"",a.max_marks,a.target_year||"All",submissions.filter(s=>s.assignment_id===a.id).length]));
  const exportSubmissions=()=>exportCSV("AKADIMIA_Submissions_"+new Date().toISOString().slice(0,10),["Student","Assignment","Submitted","Status","Marks","Feedback"],submissions.map(s=>{const a=assignments.find(x=>x.id===s.assignment_id);return[s.student_name,a?.title||"",s.submitted_at?new Date(s.submitted_at).toLocaleDateString():"",s.status,s.marks||"Not graded",s.feedback||""];}));

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div><h1 style={s.h1}>Assignments</h1><p style={s.sub}>{assignments.length} assignment{assignments.length!==1?"s":""}</p></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {isLec&&<button onClick={()=>setShowCreate(!showCreate)} style={s.btnP}>+ New Assignment</button>}
        {isLec&&assignments.length>0&&<button onClick={exportAssignments} style={{...s.btnS,fontSize:11}}>📥 CSV</button>}
        {isLec&&assignments.length>0&&<button onClick={exportSubmissions} style={{...s.btnS,fontSize:11}}>📥 Submissions</button>}
        {isLec&&assignments.length>0&&<button onClick={()=>exportPDF("Assignments Report",userField,["Title","Course","Due","Marks","Submissions"],assignments.map(a=>[a.title,a.course_code,a.due_date||"N/A",a.max_marks,submissions.filter(s=>s.assignment_id===a.id).length]),"Assignments")} style={{...s.btnS,fontSize:11}}>📄 PDF</button>}
      </div>
      </div>
      {isLec&&showCreate&&(
        <div style={{...s.card,marginBottom:"1.25rem",border:"1px solid "+T.ac+"44"}}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Create Assignment</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} placeholder="e.g. Risk Theory Problem Set 1" value={newA.title} onChange={e=>setNewA({...newA,title:e.target.value})}/></div>
            <div><label style={s.lbl}>COURSE CODE</label><input style={s.input} placeholder="e.g. SAC 406" value={newA.course_code} onChange={e=>setNewA({...newA,course_code:e.target.value})}/></div>
            <div><label style={s.lbl}>DUE DATE</label><input style={s.input} type="datetime-local" value={newA.due_date} onChange={e=>setNewA({...newA,due_date:e.target.value})}/></div>
            <div><label style={s.lbl}>MAX MARKS</label><input style={s.input} type="number" value={newA.max_marks} onChange={e=>setNewA({...newA,max_marks:parseInt(e.target.value)||100})}/></div>
          </div>
          <div style={{marginBottom:"0.75rem"}}>
            <label style={s.lbl}>TARGET YEAR GROUP</label>
            <select style={s.input} value={newA.target_year} onChange={e=>setNewA({...newA,target_year:e.target.value})}>
              <option value="all">All Students</option>
              {["Year 1","Year 2","Year 3","Year 4","Masters Sem 1","Masters Sem 2","PhD Year 1","PhD Year 2","PhD Year 3+"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>DESCRIPTION</label><textarea style={{...s.input,height:80,resize:"vertical"}} placeholder="Assignment instructions... Use $...$ for inline LaTeX e.g. $\\frac{d}{dx}f(x)$ and $$...$$ for display math" value={newA.description} onChange={e=>setNewA({...newA,description:e.target.value})}/></div>
          <div style={{marginBottom:"1rem"}}>
            <label style={s.lbl}>ATTACH FILE (PDF, Word, LaTeX)</label>
            <div style={{border:"2px dashed "+(assignmentFile?T.green:T.bd),borderRadius:8,padding:"0.75rem",textAlign:"center",fontSize:12,color:assignmentFile?T.green:T.t3}}>
              {assignmentFile?"✓ "+assignmentFile.name:"Click to attach"}
              <label style={{display:"block",marginTop:6,...s.btnS,cursor:"pointer",fontSize:11}}>
                Choose File<input type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.tex" onChange={e=>setAssignmentFile(e.target.files[0]||null)}/>
              </label>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={createAssignment} style={s.btnP}>{editingA?"Save Changes":"Create Assignment"}</button><button onClick={()=>{setShowCreate(false);setEditingA(null);setNewA({title:"",course_code:"",description:"",due_date:"",max_marks:100,target_year:"All",assignment_type:"individual",group_size:3,allow_late:false,questions:[]});}} style={{...s.btnS,marginLeft:8}}>Cancel</button>
            <button onClick={()=>setShowCreate(false)} style={s.btnS}>Cancel</button>
          </div>
        </div>
      )}
      {assignments.length===0?(
        <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
          <div style={{fontSize:40,marginBottom:12}}>📋</div>
          <div style={{fontSize:14,color:T.t2}}>No assignments yet.</div>
        </div>
      ):(
        <div style={{display:"grid",gap:12}}>
          {assignments.map(a=>{
            const mySub=mySubmission(a.id);
            const subs=asgSubmissions(a.id);
            const overdue=isOverdue(a.due_date);
            return(
              <div key={a.id} style={{...s.card,borderLeft:"3px solid "+(mySub?T.green:overdue?T.red:T.ac)}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:15,fontWeight:600,color:T.t1}}>{a.title}</span>
                      <span style={{background:T.ac+"22",color:T.ac,borderRadius:4,padding:"1px 8px",fontSize:10,fontWeight:600}}>{a.course_code}</span>
                      {mySub&&<span style={{background:T.green+"22",color:T.green,borderRadius:4,padding:"1px 8px",fontSize:10}}>Submitted</span>}
                      {mySub&&mySub.status==="graded"&&<span style={{background:T.purple+"22",color:T.purple,borderRadius:4,padding:"1px 8px",fontSize:10}}>Graded: {mySub.marks}/{a.max_marks}</span>}
                      {overdue&&!mySub&&<span style={{background:T.red+"22",color:T.red,borderRadius:4,padding:"1px 8px",fontSize:10}}>Overdue</span>}
                    </div>
                    {a.description&&<div style={{fontSize:12,color:T.t2,marginBottom:6,lineHeight:1.7}}><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{a.description}</ReactMarkdown></div>}
                    {a.file_url&&<a href={a.file_url} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:T.ac,textDecoration:"none",background:T.ac+"18",borderRadius:6,padding:"3px 10px",marginBottom:6}}>📎 Download</a>}
                    <div style={{fontSize:11,color:T.t3}}>
                      {a.due_date&&<span style={{marginRight:12}}>📅 Due: {new Date(a.due_date).toLocaleDateString("en-KE")} {new Date(a.due_date).toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit",timeZone:"Africa/Nairobi"})}</span>}
                      <span>Max: {a.max_marks} marks</span>
                      {isLec&&<span style={{marginLeft:12}}>📥 {subs.length} submission{subs.length!==1?"s":""}</span>}
                    </div>
                    {mySub&&mySub.feedback&&<div style={{marginTop:8,padding:"8px 12px",background:T.purple+"18",border:"1px solid "+T.purple+"44",borderRadius:8,fontSize:12,color:T.t1}}>💬 <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{mySub.feedback}</ReactMarkdown></div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                    {!isLec&&!mySub&&!overdue&&<button onClick={()=>setSelected(selected===a.id?null:a.id)} style={s.btnP}>Submit</button>}
                    {!isLec&&mySub&&mySub.file_url&&<a href={mySub.file_url} target="_blank" rel="noreferrer" style={{...s.btnS,textDecoration:"none",fontSize:11}}>View</a>}
                    {isLec&&subs.length>0&&<button onClick={()=>setSelected(selected===a.id?null:a.id)} style={s.btnS}>View ({subs.length})</button>}
                    {isLec&&<button onClick={()=>{setEditingA(a.id);setNewA({title:a.title,course_code:a.course_code||"",description:a.description||"",due_date:a.due_date?(()=>{const d=new Date(a.due_date);const pad=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes());})():"",max_marks:a.max_marks||100,target_year:a.target_year||"All",assignment_type:a.assignment_type||"individual",group_size:a.group_size||3,allow_late:a.allow_late||false,questions:[]});setShowCreate(true);}} style={{background:"none",border:"none",color:T.accent,cursor:"pointer",fontSize:12,padding:"4px"}}>✏ Edit</button>}{isLec&&<button onClick={async()=>{if(!confirm("Delete this assignment?"))return;const {supabase}=await import("./supabase.js");await supabase.from("assignments").delete().eq("id",a.id);load();}} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:12,padding:"4px"}}>🗑 Delete</button>}
                  </div>
                </div>
                {selected===a.id&&!isLec&&!mySub&&(
                  <div style={{marginTop:"1rem",borderTop:"1px solid "+T.bd,paddingTop:"1rem"}}>
                    <div style={{fontSize:13,fontWeight:500,color:T.t1,marginBottom:"0.75rem"}}>Submit Your Work</div>
                    <div style={{marginBottom:"0.75rem"}}>
                      <label style={s.lbl}>UPLOAD FILE</label>
                      <div style={{border:"2px dashed "+(subFile?T.green:T.bd),borderRadius:8,padding:"0.75rem",textAlign:"center",fontSize:12,color:subFile?T.green:T.t3}}>
                        {subFile?"✓ "+subFile.name:"Click to attach"}
                        <label style={{display:"block",marginTop:6,...s.btnS,cursor:"pointer",fontSize:11}}>
                          Choose File<input type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.png,.jpg,.tex,.txt" onChange={e=>setSubFile(e.target.files[0]||null)}/>
                        </label>
                      </div>
                    </div>
                    <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>COMMENT</label><textarea style={{...s.input,height:60,resize:"vertical"}} placeholder="Notes for lecturer..." value={subComment} onChange={e=>setSubComment(e.target.value)}/></div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>submitAssignment(a.id)} style={s.btnP} disabled={submitting}>{submitting?"Submitting...":"Submit"}</button>
                      <button onClick={()=>setSelected(null)} style={s.btnS}>Cancel</button>
                    </div>
                  </div>
                )}
                {selected===a.id&&isLec&&subs.length>0&&(
                  <div style={{marginTop:"1rem",borderTop:"1px solid "+T.bd,paddingTop:"1rem"}}>
                    <div style={{fontSize:13,fontWeight:500,color:T.t1,marginBottom:"0.75rem"}}>Submissions ({subs.length})</div>
                    <div style={{display:"grid",gap:8}}>
                      {subs.map(sub=>(
                        <div key={sub.id} style={{background:T.bg3,borderRadius:8,padding:"10px 12px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:500,color:T.t1}}>{sub.student_name}</div>
                              <div style={{fontSize:11,color:T.t3}}>{new Date(sub.submitted_at).toLocaleDateString()} · {sub.status}</div>
                              {sub.comment&&<div style={{fontSize:12,color:T.t2,marginTop:4}}>"{sub.comment}"</div>}
                              {sub.marks&&<div style={{fontSize:12,color:T.purple,marginTop:4}}>Marks: {sub.marks}/{a.max_marks}</div>}
                            </div>
                            <div style={{display:"flex",gap:6}}>
                              {sub.file_url&&<a href={sub.file_url} target="_blank" rel="noreferrer" style={{...s.btnS,fontSize:11,padding:"5px 10px",textDecoration:"none"}}>View</a>}
                              <button onClick={()=>setGrading(grading===sub.id?null:sub.id)} style={{...s.btnP,fontSize:11,padding:"5px 10px"}}>{sub.status==="graded"?"Re-grade":"Grade"}</button>
                            </div>
                          </div>
                          {grading===sub.id&&(
                            <div style={{marginTop:10,display:"grid",gridTemplateColumns:"100px 1fr auto",gap:8,alignItems:"end"}}>
                              <div><label style={s.lbl}>MARKS/{a.max_marks}</label><input style={s.input} type="number" value={gradeMarks} onChange={e=>setGradeMarks(e.target.value)}/></div>
                              <div><label style={s.lbl}>FEEDBACK</label><input style={s.input} value={gradeFeedback} onChange={e=>setGradeFeedback(e.target.value)} placeholder="Comments..."/></div>
                              <button onClick={()=>gradeSubmission(sub.id)} style={{...s.btnP,fontSize:11,padding:"8px 14px"}}>Save</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ExamsView=({userField,role,userName,addNotif})=>{
  const T=useT();const s=sx(T);const fld=FIELDS[userField];
  const [exams,setExams]=useState([]);
  const [submissions,setSubmissions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showCreate,setShowCreate]=useState(false);
  const [activeExam,setActiveExam]=useState(null);
  const [timeLeft,setTimeLeft]=useState(0);
  const [answers,setAnswers]=useState({});
  const [submitted,setSubmitted]=useState(false);
  const [selected,setSelected]=useState(null);
  const [grading,setGrading]=useState(null);
  const [gradeMarks,setGradeMarks]=useState("");
  const [gradeFeedback,setGradeFeedback]=useState("");
  const [newE,setNewE]=useState({title:"",course_code:"",duration_minutes:60,total_marks:100,instructions:"",target_year:"all",questions:[]});
  const [newQ,setNewQ]=useState({text:"",type:"mcq",options:["","","",""],marks:5,correct_answer:0,marking_scheme:""});
  const isLec=role==="lecturer"||role==="admin";
  const timerRef=useRef(null);

  const load=async()=>{
    setLoading(true);
    const {supabase}=await import("./supabase.js");
    const {data:ex}=await supabase.from("exams").select("*").eq("field",userField).order("created_at",{ascending:false});
    const {data:subs}=await supabase.from("exam_submissions").select("*");
    setExams(ex||[]);setSubmissions(subs||[]);setLoading(false);
  };
  useEffect(()=>{load();},[userField]);

  useEffect(()=>{
    if(activeExam&&timeLeft>0){
      timerRef.current=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);submitExam();return 0;}return t-1;}),1000);
    }
    return()=>clearInterval(timerRef.current);
  },[activeExam]);

  const shuffle=(arr)=>[...arr].sort(()=>Math.random()-0.5);

  const startExam=async(exam)=>{
    // Shuffle questions order
    const shuffledQs=shuffle(exam.questions||[]).map(q=>{
      if(q.type==="mcq"&&q.options){
        // Shuffle MCQ options and track correct answer remapping
        const indexed=q.options.map((opt,i)=>({opt,origIdx:i}));
        const shuffledOpts=shuffle(indexed);
        return{
          ...q,
          options:shuffledOpts.map(o=>o.opt),
          _optMap:shuffledOpts.map(o=>o.origIdx)
        };
      }
      return q;
    });
    setActiveExam({...exam,questions:shuffledQs});
    setTimeLeft(exam.duration_minutes*60);
    setAnswers({});setSubmitted(false);
  };

  const submitExam=async()=>{
    if(!activeExam)return;
    clearInterval(timerRef.current);
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    await supabase.from("exam_submissions").insert({
      exam_id:activeExam.id,student_id:user.id,student_name:userName,
      answers,status:"submitted",submitted_at:new Date().toISOString()
    });
    if(addNotif) addNotif("✏️","Exam Submitted","Your exam has been submitted successfully.");
    setSubmitted(true);setActiveExam(null);load();
  };

  const createExam=async()=>{
    if(!newE.title)return;
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    await supabase.from("exams").insert({...newE,field:userField,created_by:user.id,questions:JSON.parse(JSON.stringify(newE.questions||[]))});
    setShowCreate(false);setNewE({title:"",course_code:"",duration_minutes:60,total_marks:100,instructions:"",target_year:"all",questions:[]});
    load();
  };

  const addQuestion=()=>{
    if(!newQ.text.trim())return;
    const q={...newQ,id:Date.now(),text:newQ.text.trim()};
    setNewE(prev=>{
      const updated={...prev,questions:[...prev.questions,q]};
      console.log("Questions now:",updated.questions.length);
      return updated;
    });
    setNewQ({text:"",type:"mcq",options:["","","",""],marks:5});
  };

  const fmt=(s)=>`${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const mySub=(eId)=>submissions.find(s=>s.student_name===userName&&s.exam_id===eId);

  if(activeExam){
    const qs=activeExam.questions||[];
    return(
      <div>
        <div style={{...s.card,marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:T.t1}}>{activeExam.title}</div>
            <div style={{fontSize:12,color:T.t3}}>{activeExam.course_code} · {activeExam.total_marks} marks</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:700,color:timeLeft<300?T.red:T.ac,fontFamily:"monospace"}}>{fmt(timeLeft)}</div>
            <div style={{fontSize:10,color:T.t3}}>TIME REMAINING</div>
          </div>
        </div>
        {activeExam.instructions&&<div style={{...s.card,marginBottom:"1rem",fontSize:12,color:T.t2,lineHeight:1.6}}><strong>Instructions:</strong> {activeExam.instructions}</div>}
        {qs.length===0?(
          <div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>
            <div style={{fontSize:32,marginBottom:8}}>📝</div>
            <div>This exam has no questions yet. Submit when ready.</div>
          </div>
        ):(
          qs.map((q,i)=>(
            <div key={q.id||i} style={{...s.card,marginBottom:"0.75rem"}}>
              <div style={{fontSize:13,fontWeight:500,color:T.t1,marginBottom:"0.75rem"}}><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{(i+1)+". "+q.text}</ReactMarkdown><span style={{fontSize:11,color:T.t3}}>({q.marks} marks)</span></div>
              {q.type==="mcq"?(
                <div style={{display:"grid",gap:6}}>
                  {(q.options||[]).filter(o=>o).map((opt,j)=>(
                    <div key={j} onClick={()=>setAnswers(a=>({...a,[q.id||i]:j}))} style={{padding:"8px 12px",borderRadius:8,border:"1px solid "+(answers[q.id||i]===j?T.ac:T.bd),background:answers[q.id||i]===j?rgba(T.ac,0.15):T.bg3,cursor:"pointer",fontSize:12,color:T.t1}}>
                      <span style={{fontWeight:600,marginRight:6}}>{String.fromCharCode(65+j)}.</span>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{p:({children})=><span>{children}</span>}}>{opt}</ReactMarkdown>
                    </div>
                  ))}
                </div>
              ):(
                <textarea style={{...s.input,height:80,resize:"vertical",fontSize:12}} placeholder="Type your answer here..." value={answers[q.id||i]||""} onChange={e=>setAnswers(a=>({...a,[q.id||i]:e.target.value}))}/>
              )}
            </div>
          ))
        )}
        <div style={{display:"flex",gap:8,marginTop:"1rem"}}>
          <button onClick={submitExam} style={s.btnP}>Submit Exam</button>
          <button onClick={()=>{clearInterval(timerRef.current);setActiveExam(null);}} style={s.btnS}>Exit</button>
        </div>
      </div>
    );
  }

  if(submitted) return(
    <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
      <div style={{fontSize:48,marginBottom:12}}>✅</div>
      <div style={{fontSize:18,fontWeight:600,color:T.green,marginBottom:8}}>Exam Submitted!</div>
      <div style={{fontSize:13,color:T.t2,marginBottom:"1.5rem"}}>Your answers have been recorded. Results will be published by your lecturer.</div>
      <button onClick={()=>{setSubmitted(false);load();}} style={s.btnP}>Back to Exams</button>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div>
          <h1 style={s.h1}>Exams</h1>
          <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{fld&&fld.icon} {fld&&fld.name}</span>{exams.length} exam{exams.length!==1?"s":""} available</p>
        </div>
        {isLec&&<button onClick={()=>setShowCreate(!showCreate)} style={s.btnP}>+ Create Exam</button>}
      </div>

      {isLec&&showCreate&&(
        <div style={{...s.card,marginBottom:"1.25rem",border:`1px solid ${rgba(T.ac,0.3)}`}}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Create Exam</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} value={newE.title} onChange={e=>setNewE({...newE,title:e.target.value})} placeholder="e.g. SAC 406 Final Exam"/></div>
            <div><label style={s.lbl}>COURSE CODE</label><input style={s.input} value={newE.course_code} onChange={e=>setNewE({...newE,course_code:e.target.value})} placeholder="e.g. SAC 406"/></div>
            <div><label style={s.lbl}>DURATION (MIN)</label><input style={s.input} type="number" value={newE.duration_minutes} onChange={e=>setNewE({...newE,duration_minutes:parseInt(e.target.value)||60})}/></div>
            <div><label style={s.lbl}>TOTAL MARKS</label><input style={s.input} type="number" value={newE.total_marks} onChange={e=>setNewE({...newE,total_marks:parseInt(e.target.value)||100})}/></div>
            <div><label style={s.lbl}>TARGET YEAR</label>
              <select style={s.input} value={newE.target_year} onChange={e=>setNewE({...newE,target_year:e.target.value})}>
                {["all","Year 1","Year 2","Year 3","Year 4","Masters Sem 1","Masters Sem 2","PhD Year 1","PhD Year 2","PhD Year 3+"].map(v=><option key={v} value={v}>{v==="all"?"All Students":v}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:"1rem"}}><label style={s.lbl}>INSTRUCTIONS</label><textarea style={{...s.input,height:60,resize:"vertical"}} value={newE.instructions} onChange={e=>setNewE({...newE,instructions:e.target.value})} placeholder="Exam instructions..."/></div>
          <div style={{...s.card,background:T.bg3,marginBottom:"1rem"}}>
            <div style={{fontSize:12,fontWeight:600,color:T.t1,marginBottom:"0.75rem"}}>Add Questions ({newE.questions.length} added)</div>
            <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>QUESTION TEXT</label><input style={s.input} value={newQ.text} onChange={e=>setNewQ({...newQ,text:e.target.value})} placeholder="Enter question... Use $...$ for LaTeX e.g. $P(X=k) = \\binom{n}{k}p^k$"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"0.75rem"}}>
              <div><label style={s.lbl}>TYPE</label>
                <select style={s.input} value={newQ.type} onChange={e=>setNewQ({...newQ,type:e.target.value})}>
                  <option value="mcq">Multiple Choice</option>
                  <option value="essay">Essay / Open</option>
                </select>
              </div>
              <div><label style={s.lbl}>MARKS</label><input style={s.input} type="number" value={newQ.marks} onChange={e=>setNewQ({...newQ,marks:parseInt(e.target.value)||5})}/></div>
            </div>
            {newQ.type==="mcq"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"0.75rem"}}>
                {newQ.options.map((opt,i)=>(
                  <div key={i}><label style={s.lbl}>OPTION {String.fromCharCode(65+i)}</label><input style={s.input} value={opt} onChange={e=>{const ops=[...newQ.options];ops[i]=e.target.value;setNewQ({...newQ,options:ops});}} placeholder={`Option ${String.fromCharCode(65+i)}`}/></div>
                ))}
              </div>
            )}
            {newQ.type==="mcq"&&newQ.options.filter(o=>o).length>0&&(
              <div style={{marginBottom:"0.75rem"}}>
                <label style={s.lbl}>CORRECT ANSWER</label>
                <select style={s.input} value={newQ.correct_answer} onChange={e=>setNewQ({...newQ,correct_answer:parseInt(e.target.value)})}>
                  {newQ.options.map((opt,i)=>opt&&<option key={i} value={i}>Option {String.fromCharCode(65+i)}: {opt.slice(0,40)}</option>)}
                </select>
              </div>
            )}
            <div style={{marginBottom:"0.75rem"}}>
              <label style={s.lbl}>MARKING SCHEME / MODEL ANSWER</label>
              <textarea style={{...s.input,height:60,resize:"vertical",fontSize:12}} value={newQ.marking_scheme} onChange={e=>setNewQ({...newQ,marking_scheme:e.target.value})} placeholder={newQ.type==="mcq"?"Explain why option "+String.fromCharCode(65+newQ.correct_answer)+" is correct...":"Expected answer and key points to award marks..."}/>
            </div>
            <button onClick={addQuestion} style={{...s.btnP,fontSize:12}} disabled={!newQ.text.trim()}>+ Add Question to Exam</button>
            {newE.questions.length>0&&(
              <div style={{marginTop:"0.75rem",display:"grid",gap:4}}>
                {newE.questions.map((q,i)=>(
                  <div key={i} style={{fontSize:11,color:T.t2,padding:"4px 8px",background:T.bg4,borderRadius:4}}>
                    {i+1}. {q.text} ({q.marks}m) — {q.type}
                    <button onClick={()=>setNewE(e=>({...e,questions:e.questions.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:T.red,cursor:"pointer",marginLeft:8,fontSize:11}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {newE.questions.length===0&&<div style={{padding:"8px 12px",background:T.amber+"18",borderRadius:6,fontSize:12,color:T.amber,marginBottom:8}}>Add at least one question before creating the exam.</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={createExam} style={s.btnP}>Create Exam ({newE.questions.length} questions)</button>
            <button onClick={()=>setShowCreate(false)} style={s.btnS}>Cancel</button>
          </div>
        </div>
      )}

      {isLec&&exams.length>0&&(
        <div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap"}}>
          <button onClick={()=>exportCSV("AKADIMIA_Exams_"+new Date().toISOString().slice(0,10),["Title","Course","Duration (min)","Total Marks","Questions","Submissions"],exams.map(e=>[e.title,e.course_code,e.duration_minutes,e.total_marks,(e.questions||[]).length,submissions.filter(s=>s.exam_id===e.id).length]))} style={{...s.btnS,fontSize:11,padding:"6px 14px"}}>📥 Export CSV</button>
          <button onClick={()=>exportCSV("AKADIMIA_ExamResults_"+new Date().toISOString().slice(0,10),["Student","Exam","Submitted At","Status","Score","Feedback"],submissions.map(s=>{const e=exams.find(x=>x.id===s.exam_id);return[s.student_name,e?.title||"",s.submitted_at?new Date(s.submitted_at).toLocaleDateString():"",s.status,s.marks!=null?s.marks+"/"+e?.total_marks:"Not graded",s.feedback||""];}))} style={{...s.btnS,fontSize:11,padding:"6px 14px"}}>📥 Results CSV</button>
          <button onClick={()=>exportPDF("Exam Results Report",userField+" — "+new Date().toLocaleDateString('en-KE'),["Student","Exam","Score","Status","Feedback"],submissions.map(s=>{const e=exams.find(x=>x.id===s.exam_id);return[s.student_name,e?.title||"",s.marks!=null?s.marks+"/"+e?.total_marks:"N/A",s.status,s.feedback||""];}),"AKADIMIA_ExamResults")} style={{...s.btnS,fontSize:11,padding:"6px 14px"}}>📄 Results PDF</button>
        </div>
      )}
      {loading?<div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>Loading exams...</div>:
      exams.length===0?<div style={{...s.card,textAlign:"center",padding:"3rem"}}><div style={{fontSize:40,marginBottom:12}}>✏️</div><div style={{fontSize:14,color:T.t2}}>No exams yet.</div></div>:(
        <div style={{display:"grid",gap:12}}>
          {exams.map(ex=>{
            const sub=mySub(ex.id);
            const subs=submissions.filter(s=>s.exam_id===ex.id);
            return(
              <div key={ex.id} style={{...s.card,borderLeft:`3px solid ${sub?T.green:T.ac}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:15,fontWeight:600,color:T.t1}}>{ex.title}</span>
                      <span style={{background:rgba(T.ac,0.15),color:T.ac,borderRadius:4,padding:"1px 8px",fontSize:10,fontWeight:600}}>{ex.course_code}</span>
                      {sub&&<span style={{background:rgba(T.green,0.15),color:T.green,borderRadius:4,padding:"1px 8px",fontSize:10}}>✓ Submitted</span>}
                      {sub&&sub.marks&&<span style={{background:rgba(T.purple,0.15),color:T.purple,borderRadius:4,padding:"1px 8px",fontSize:10}}>Score: {sub.marks}/{ex.total_marks}</span>}
                    </div>
                    <div style={{fontSize:11,color:T.t3}}>
                      <span style={{marginRight:12}}>⏱ {ex.duration_minutes} min</span>
                      <span style={{marginRight:12}}>📊 {ex.total_marks} marks</span>
                      <span style={{marginRight:12}}>❓ {(ex.questions||[]).length} questions</span>
                      {isLec&&<span>👥 {subs.length} submitted</span>}
                    </div>
                    {ex.instructions&&<div style={{fontSize:12,color:T.t2,marginTop:6}}>{ex.instructions}</div>}
                    {sub&&sub.feedback&&<div style={{marginTop:8,padding:"8px 12px",background:rgba(T.purple,0.1),border:`1px solid ${rgba(T.purple,0.3)}`,borderRadius:8,fontSize:12,color:T.t1}}>💬 {sub.feedback}</div>}
                  </div>
                  <div style={{flexShrink:0}}>
                    {!isLec&&!sub&&<button onClick={()=>startExam(ex)} style={s.btnP}>Start Exam →</button>}
                    {isLec&&subs.length>0&&<button onClick={()=>setSelected(selected===ex.id?null:ex.id)} style={s.btnS}>Grade ({subs.length})</button>}
                    {isLec&&<button onClick={async()=>{if(!confirm("Delete this exam?"))return;const {supabase}=await import("./supabase.js");await supabase.from("exams").delete().eq("id",ex.id);load();}} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:12,padding:"4px"}}>🗑 Delete</button>}
                  </div>
                </div>

                {selected===ex.id&&isLec&&(
                  <div style={{marginTop:"1rem",borderTop:"1px solid "+T.bd,paddingTop:"1rem"}}>
                    <div style={{fontSize:13,fontWeight:500,color:T.t1,marginBottom:"0.75rem"}}>Submissions — {ex.title}</div>
                    <div style={{display:"grid",gap:8}}>
                      {subs.map(sub2=>(
                        <div key={sub2.id} style={{background:T.bg3,borderRadius:8,padding:"10px 12px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:500,color:T.t1}}>{sub2.student_name}</div>
                              <div style={{fontSize:11,color:T.t3}}>{sub2.submitted_at?new Date(sub2.submitted_at).toLocaleDateString():""} · {sub2.status}</div>
                              {sub2.marks&&<div style={{fontSize:12,color:T.purple,marginTop:4}}>Score: {sub2.marks}/{ex.total_marks}</div>}
                              {sub2.feedback&&<div style={{fontSize:12,color:T.t2,marginTop:4}}>Feedback: {sub2.feedback}</div>}
                              {sub2.answers&&Object.keys(sub2.answers).length>0&&(
                                <div style={{marginTop:8}}>
                                  <div style={{fontSize:11,color:T.t3,marginBottom:4}}>Answers:</div>
                                  {(ex.questions||[]).map((q,qi)=>(
                                    <div key={qi} style={{fontSize:11,color:T.t2,marginBottom:4,padding:"4px 8px",background:T.bg4,borderRadius:4}}>
                                      <span style={{fontWeight:600,marginRight:4}}>Q{qi+1}:</span>
                                      {q.type==="mcq"?"Option "+String.fromCharCode(65+(sub2.answers[q.id||qi]||0)):sub2.answers[q.id||qi]||"No answer"}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={()=>setGrading(grading===sub2.id?null:sub2.id)} style={{...s.btnP,fontSize:11,padding:"5px 10px",flexShrink:0}}>{sub2.status==="graded"?"Re-grade":"Grade"}</button>
                          </div>
                          {grading===sub2.id&&(
                            <div style={{marginTop:10,display:"grid",gridTemplateColumns:"120px 1fr auto",gap:8,alignItems:"end"}}>
                              <div><label style={s.lbl}>MARKS/{ex.total_marks}</label><input style={s.input} type="number" min="0" max={ex.total_marks} value={gradeMarks} onChange={e=>setGradeMarks(e.target.value)}/></div>
                              <div><label style={s.lbl}>FEEDBACK</label><input style={s.input} value={gradeFeedback} placeholder="Comments for student..." onChange={e=>setGradeFeedback(e.target.value)}/></div>
                              <button onClick={async()=>{
                                if(!gradeMarks)return;
                                const {supabase}=await import("./supabase.js");
                                await supabase.from("exam_submissions").update({marks:parseInt(gradeMarks),feedback:gradeFeedback,status:"graded"}).eq("id",sub2.id);
                                if(addNotif)addNotif("✅","Exam Graded","Submission graded successfully.");
                                setGrading(null);setGradeFeedback("");setGradeMarks("");load();
                              }} style={{...s.btnP,fontSize:11,padding:"8px 14px"}}>Save</button>
                            <button onClick={async()=>{
                                setGradeFeedback("Grading...");
                                try{
                                  const qs=ex.questions||[];
                                  const answerSummary=qs.map((q,qi)=>{
                                    const ans=sub2.answers[q.id||qi];
                                    const studentAns=q.type==="mcq"?"Option "+String.fromCharCode(65+(ans||0))+" ("+((q.options||[])[ans]||"No answer")+")":ans||"No answer";
                                    const correct=q.type==="mcq"?"Correct: Option "+String.fromCharCode(65+(q.correct_answer||0))+" ("+((q.options||[])[q.correct_answer||0]||"")+")":(q.marking_scheme||"No scheme provided");
                                    return (qi+1)+". Q: "+q.text+"\nStudent: "+studentAns+"\nExpected: "+correct+"\nMax marks: "+q.marks;
                                  }).join("\n\n");
                                  const raw=await callAI("You are an academic examiner. Grade this student exam submission fairly and professionally.\n\nExam: "+ex.title+"\nTotal Marks: "+ex.total_marks+"\n\nAnswers:\n"+answerSummary+"\n\nReturn ONLY a JSON object: {\"total_marks\": NUMBER, \"feedback\": \"detailed constructive feedback string\", \"per_question\": [{\"q\": NUMBER, \"awarded\": NUMBER, \"comment\": \"STRING\"}]}", 800);
                                  const clean=raw.replace(/```json|```/g,"").trim();
                                  const result=JSON.parse(clean.slice(clean.indexOf("{"),clean.lastIndexOf("}")+1));
                                  setGradeMarks(String(Math.min(result.total_marks||0,ex.total_marks)));
                                  setGradeFeedback(result.feedback||"");
                                }catch(e){setGradeFeedback("AI grading failed. Please grade manually.");}
                              }} style={{...s.btnS,fontSize:11,padding:"8px 14px"}}>🤖 AI Grade</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
const CalendarView=({setTab,role,userField})=>{
  const T=useT();const s=sx(T);
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showCreate,setShowCreate]=useState(false);
  const [newEv,setNewEv]=useState({title:"",description:"",event_type:"general",start_time:"",end_time:"",location:"",meeting_link:""});
  const isLec=role==="lecturer"||role==="admin";
  const types=["general","exam","assignment","meeting","holiday","workshop"];

  const load=async()=>{
    setLoading(true);
    const {supabase}=await import("./supabase.js");
    const {data}=await supabase.from("calendar_events").select("*").order("start_time",{ascending:true});
    setEvents(data||[]);setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const create=async()=>{
    if(!newEv.title||!newEv.start_time)return;
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    await supabase.from("calendar_events").insert({...newEv,field:userField,created_by:user.id});
    setShowCreate(false);setNewEv({title:"",description:"",event_type:"general",start_time:"",end_time:"",location:"",meeting_link:""});
    load();
  };

  const del=async(id)=>{
    const {supabase}=await import("./supabase.js");
    await supabase.from("calendar_events").delete().eq("id",id);
    load();
  };

  const typeColor={general:T.blue,exam:T.red,assignment:T.amber,meeting:T.green,holiday:T.purple,workshop:T.teal};
  const upcoming=events.filter(e=>new Date(e.start_time)>=new Date());
  const past=events.filter(e=>new Date(e.start_time)<new Date());

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div><h1 style={s.h1}>Calendar</h1><p style={s.sub}>{upcoming.length} upcoming events</p></div>
        {isLec&&<button onClick={()=>setShowCreate(!showCreate)} style={s.btnP}>+ Add Event</button>}
      </div>

      {isLec&&showCreate&&(
        <div style={{...s.card,marginBottom:"1.25rem",border:`1px solid ${rgba(T.ac,0.3)}`}}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>New Calendar Event</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} value={newEv.title} onChange={e=>setNewEv({...newEv,title:e.target.value})} placeholder="Event title"/></div>
            <div><label style={s.lbl}>TYPE</label>
              <select style={s.input} value={newEv.event_type} onChange={e=>setNewEv({...newEv,event_type:e.target.value})}>
                {types.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div><label style={s.lbl}>START DATE & TIME</label><input style={s.input} type="datetime-local" value={newEv.start_time} onChange={e=>setNewEv({...newEv,start_time:e.target.value})}/></div>
            <div><label style={s.lbl}>END DATE & TIME</label><input style={s.input} type="datetime-local" value={newEv.end_time} onChange={e=>setNewEv({...newEv,end_time:e.target.value})}/></div>
            <div><label style={s.lbl}>LOCATION (optional)</label><input style={s.input} value={newEv.location} onChange={e=>setNewEv({...newEv,location:e.target.value})} placeholder="e.g. Room 204, Online"/></div>
            <div><label style={s.lbl}>MEETING LINK (optional)</label><input style={s.input} value={newEv.meeting_link} onChange={e=>setNewEv({...newEv,meeting_link:e.target.value})} placeholder="https://zoom.us/..."/></div>
          </div>
          <div style={{marginBottom:"1rem"}}><label style={s.lbl}>DESCRIPTION</label><textarea style={{...s.input,height:60,resize:"vertical"}} value={newEv.description} onChange={e=>setNewEv({...newEv,description:e.target.value})} placeholder="Details..."/></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={create} style={s.btnP}>Save Event</button>
            <button onClick={()=>setShowCreate(false)} style={s.btnS}>Cancel</button>
          </div>
        </div>
      )}

      {loading?<div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>Loading...</div>:(
        <div>
          {upcoming.length>0&&(
            <div style={{marginBottom:"1.5rem"}}>
              <div style={{fontSize:12,fontWeight:600,color:T.t3,letterSpacing:0.8,marginBottom:"0.75rem"}}>UPCOMING</div>
              <div style={{display:"grid",gap:8}}>
                {upcoming.map(ev=>{
                  const color=typeColor[ev.event_type]||T.blue;
                  const dt=new Date(ev.start_time);
                  return(
                    <div key={ev.id} style={{...s.card,display:"flex",gap:16,alignItems:"flex-start",borderLeft:`3px solid ${color}`}}>
                      <div style={{textAlign:"center",minWidth:48,background:T.bg3,borderRadius:8,padding:"6px 8px"}}>
                        <div style={{fontSize:11,color:T.t3}}>{dt.toLocaleString("en-KE",{month:"short"}).toUpperCase()}</div>
                        <div style={{fontSize:22,fontWeight:700,color:T.t1,lineHeight:1}}>{dt.getDate()}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:14,fontWeight:600,color:T.t1}}>{ev.title}</span>
                          <span style={{background:rgba(color,0.15),color,borderRadius:4,padding:"1px 8px",fontSize:10,fontWeight:600,textTransform:"capitalize"}}>{ev.event_type}</span>
                        </div>
                        <div style={{fontSize:11,color:T.t3,marginBottom:ev.description?4:0}}>
                          🕐 {dt.toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"})}
                          {ev.end_time&&` — ${new Date(ev.end_time).toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"})}`}
                          {ev.location&&<span style={{marginLeft:8}}>📍 {ev.location}</span>}
                        </div>
                        {ev.description&&<div style={{fontSize:12,color:T.t2}}>{ev.description}</div>}
                        {ev.meeting_link&&<a href={ev.meeting_link} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:T.green,textDecoration:"none",marginTop:4,background:rgba(T.green,0.1),borderRadius:6,padding:"3px 10px",border:`1px solid ${rgba(T.green,0.3)}`}}>🔗 Join Meeting</a>}
                      </div>
                      {isLec&&<button onClick={()=>del(ev.id)} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:16,padding:4}}>✕</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {past.length>0&&(
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.t3,letterSpacing:0.8,marginBottom:"0.75rem"}}>PAST EVENTS</div>
              <div style={{display:"grid",gap:8}}>
                {past.slice(0,5).map(ev=>{
                  const color=typeColor[ev.event_type]||T.blue;
                  const dt=new Date(ev.start_time);
                  return(
                    <div key={ev.id} style={{...s.card,display:"flex",gap:16,alignItems:"center",opacity:0.6,borderLeft:`3px solid ${color}`}}>
                      <div style={{textAlign:"center",minWidth:48}}>
                        <div style={{fontSize:10,color:T.t3}}>{dt.toLocaleString("en-KE",{month:"short"}).toUpperCase()}</div>
                        <div style={{fontSize:18,fontWeight:700,color:T.t2,lineHeight:1}}>{dt.getDate()}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,color:T.t2}}>{ev.title}</div>
                        <div style={{fontSize:11,color:T.t3,textTransform:"capitalize"}}>{ev.event_type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {events.length===0&&(
            <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
              <div style={{fontSize:40,marginBottom:12}}>📅</div>
              <div style={{fontSize:14,color:T.t2}}>No events yet.</div>
              {isLec&&<div style={{fontSize:12,color:T.t3,marginTop:4}}>Click "+ Add Event" to create the first event.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const MeetingsView=({role,userField,userName})=>{
  const T=useT();const s=sx(T);
  const [meetings,setMeetings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showCreate,setShowCreate]=useState(false);
  const [newM,setNewM]=useState({title:"",description:"",meeting_link:"",platform:"zoom",scheduled_at:"",duration_minutes:60});
  const isLec=role==="lecturer"||role==="admin";
  const platforms=["zoom","google_meet","teams","youtube","other"];
  const platformIcon={zoom:"📹",google_meet:"🎥",teams:"💼",youtube:"▶️",other:"🔗"};
  const platformLabel={zoom:"Zoom",google_meet:"Google Meet",teams:"Microsoft Teams",youtube:"YouTube Live",other:"Other"};

  const load=async()=>{
    setLoading(true);
    const {supabase}=await import("./supabase.js");
    const {data}=await supabase.from("meetings").select("*").order("scheduled_at",{ascending:true});
    setMeetings(data||[]);setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const create=async()=>{
    if(!newM.title||!newM.meeting_link||!newM.scheduled_at)return;
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    await supabase.from("meetings").insert({...newM,field:userField,created_by:user.id});
    setShowCreate(false);
    setNewM({title:"",description:"",meeting_link:"",platform:"zoom",scheduled_at:"",duration_minutes:60});
    load();
  };

  const now=new Date();
  const live=meetings.filter(m=>{
    const st=new Date(m.scheduled_at);
    const en=new Date(st.getTime()+m.duration_minutes*60000);
    return st<=now&&en>=now;
  });
  const upcoming=meetings.filter(m=>new Date(m.scheduled_at)>now);
  const past=meetings.filter(m=>new Date(new Date(m.scheduled_at).getTime()+m.duration_minutes*60000)<now);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div>
          <h1 style={s.h1}>Live Classes</h1>
          <p style={s.sub}>{live.length>0?<span style={{color:T.red,fontWeight:600}}>Live now: {live.length}</span>:`${upcoming.length} upcoming`}</p>
        </div>
        {isLec&&<button onClick={()=>setShowCreate(!showCreate)} style={s.btnP}>+ Schedule Class</button>}
      </div>

      {isLec&&showCreate&&(
        <div style={{...s.card,marginBottom:"1.25rem",border:"1px solid "+T.ac+"44"}}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Schedule Live Class</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} value={newM.title} onChange={e=>setNewM({...newM,title:e.target.value})} placeholder="e.g. Risk Theory Lecture 5"/></div>
            <div><label style={s.lbl}>PLATFORM</label>
              <select style={s.input} value={newM.platform} onChange={e=>setNewM({...newM,platform:e.target.value})}>
                {platforms.map(p=><option key={p} value={p}>{platformLabel[p]}</option>)}
              </select>
            </div>
            <div><label style={s.lbl}>DATE AND TIME</label><input style={s.input} type="datetime-local" value={newM.scheduled_at} onChange={e=>setNewM({...newM,scheduled_at:e.target.value})}/></div>
            <div><label style={s.lbl}>DURATION (MIN)</label><input style={s.input} type="number" value={newM.duration_minutes} onChange={e=>setNewM({...newM,duration_minutes:parseInt(e.target.value)||60})}/></div>
          </div>
          <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>MEETING LINK</label><input style={s.input} value={newM.meeting_link} onChange={e=>setNewM({...newM,meeting_link:e.target.value})} placeholder="https://zoom.us/j/..."/></div>
          <div style={{marginBottom:"1rem"}}><label style={s.lbl}>DESCRIPTION</label><textarea style={{...s.input,height:60,resize:"vertical"}} value={newM.description} onChange={e=>setNewM({...newM,description:e.target.value})} placeholder="What will be covered..."/></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={create} style={s.btnP}>Schedule Class</button>
            <button onClick={()=>setShowCreate(false)} style={s.btnS}>Cancel</button>
          </div>
        </div>
      )}

      {loading?<div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>Loading...</div>:(
        <div>
          {live.length>0&&(
            <div style={{marginBottom:"1.5rem"}}>
              <div style={{fontSize:12,fontWeight:600,color:T.red,letterSpacing:0.8,marginBottom:"0.75rem"}}>LIVE NOW</div>
              {live.map(m=>(
                <div key={m.id} style={{...s.card,borderLeft:"3px solid "+T.red,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:600,color:T.t1,marginBottom:4}}>{m.title}</div>
                      <div style={{fontSize:11,color:T.t3}}>{platformLabel[m.platform]} · {m.duration_minutes} min</div>
                      {m.description&&<div style={{fontSize:12,color:T.t2,marginTop:4}}>{m.description}</div>}
                    </div>
                    <a href={m.meeting_link} target="_blank" rel="noreferrer" style={{...s.btnP,textDecoration:"none",fontSize:13,padding:"10px 20px"}}>Join Now</a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {upcoming.length>0&&(
            <div style={{marginBottom:"1.5rem"}}>
              <div style={{fontSize:12,fontWeight:600,color:T.t3,letterSpacing:0.8,marginBottom:"0.75rem"}}>UPCOMING</div>
              {upcoming.map(m=>{
                const dt=new Date(m.scheduled_at);
                return(
                  <div key={m.id} style={{...s.card,borderLeft:"3px solid "+T.green,marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:4}}>{m.title}</div>
                        <div style={{fontSize:11,color:T.t3}}>
                          {platformLabel[m.platform]} · {dt.toLocaleDateString("en-KE")} · {dt.toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"})} · {m.duration_minutes} min
                        </div>
                        {m.description&&<div style={{fontSize:12,color:T.t2,marginTop:4}}>{m.description}</div>}
                      </div>
                      <a href={m.meeting_link} target="_blank" rel="noreferrer" style={{...s.btnS,textDecoration:"none",fontSize:11,padding:"6px 14px"}}>Open Link</a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {past.length>0&&(
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.t3,letterSpacing:0.8,marginBottom:"0.75rem"}}>PAST</div>
              {past.slice(0,5).map(m=>(
                <div key={m.id} style={{...s.card,opacity:0.5,marginBottom:6,display:"flex",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:13,color:T.t2}}>{m.title}</div>
                    <div style={{fontSize:11,color:T.t3}}>{new Date(m.scheduled_at).toLocaleDateString("en-KE")} · {platformLabel[m.platform]}</div>
                  </div>
                  <span style={{fontSize:11,color:T.t3}}>Ended</span>
                </div>
              ))}
            </div>
          )}

          {meetings.length===0&&(
            <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
              <div style={{fontSize:40,marginBottom:12}}>📹</div>
              <div style={{fontSize:14,color:T.t2}}>No classes scheduled yet.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const ResearchView=({userField})=>{
  const T=useT();const s=sx(T);const fld=FIELDS[userField];
  const [mode,setMode]=useState("check");
  const [file,setFile]=useState(null);
  const [text,setText]=useState("");
  const [extractedPreview,setExtractedPreview]=useState("");
  const [loading,setLoading]=useState(false);
  const [extracting,setExtracting]=useState(false);
  const [step,setStep]=useState("");
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");

  const parseJSON=(str)=>{try{const s=str.replace(/```json|```/g,"").trim();const a=s.indexOf("{");const b=s.lastIndexOf("}");if(a>=0&&b>a)return JSON.parse(s.slice(a,b+1));}catch(e){}return null;};

  const analyzeText=async(content)=>{
    if(!content||content.trim().length<50){setError("Please provide at least 50 characters.");return;}
    setLoading(true);setError("");setResult(null);setStep("Analyzing...");
    try{
      const res=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+import.meta.env.VITE_GEMINI_KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Analyze this academic text for plagiarism and AI generation.\n\nTEXT:\n"+content.slice(0,6000)+"\n\nReturn ONLY this JSON:\n{\"similarity_index\":NUMBER,\"ai_content_percentage\":NUMBER,\"human_content_percentage\":NUMBER,\"word_count\":NUMBER,\"sentence_count\":NUMBER,\"readability_score\":NUMBER,\"readability_label\":\"STRING\",\"overall_verdict\":\"Likely Original OR Possibly AI-Assisted OR Likely AI-Generated OR Potentially Plagiarized\",\"confidence\":NUMBER,\"summary\":\"STRING\",\"ai_indicators\":[\"STRING\"],\"suspicious_sections\":[\"STRING\"],\"recommendations\":[\"STRING\"]}"}]}],generationConfig:{maxOutputTokens:1500}})});
      const d=await res.json();
      if(d.error){setError("Error: "+d.error.message);setLoading(false);return;}
      const raw=d.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"";
      const parsed=parseJSON(raw);
      setResult(parsed||{overall_verdict:"Done",summary:raw.slice(0,400),similarity_index:0,ai_content_percentage:0,human_content_percentage:0,word_count:content.split(/\s+/).length,sentence_count:content.split(/[.!?]+/).length,readability_score:50,readability_label:"Standard",confidence:0,ai_indicators:[],suspicious_sections:[],recommendations:[]});
    }catch(e){setError("Error: "+e.message);}
    setStep("");setLoading(false);
  };

  const handleFile=async(f)=>{
    setFile(f);setError("");setText("");setExtractedPreview("");
    if(f.type==="text/plain"){const r=new FileReader();r.onload=e=>{setText(e.target.result);setExtractedPreview(e.target.result.slice(0,200)+"...");};r.readAsText(f);}
    else if(f.type==="application/pdf"){
      setExtracting(true);setStep("Extracting PDF...");
      const r=new FileReader();
      r.onload=async(e)=>{
        try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,messages:[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/pdf",data:e.target.result.split(",")[1]}},{type:"text",text:"Extract ALL text. Return only raw text."}]}]})});
        const d=await res.json();const t=d.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"";
        if(t.length>50){setText(t);setExtractedPreview(t.slice(0,200)+"...");}else{setError("Could not extract PDF. Paste text manually.");}
        }catch(e){setError("PDF extraction failed.");}
        setExtracting(false);setStep("");
      };r.readAsDataURL(f);
    }else{setError("Please use PDF, TXT. For DOCX, paste text manually.");}
  };

  const verdictColor=(v)=>{if(!v)return T.t2;if(v.includes("Original"))return T.green;if(v.includes("Assisted"))return T.amber;return T.red;};
  const ScoreRing=({value,label,color})=>(<div style={{textAlign:"center",padding:"1rem"}}><div style={{position:"relative",width:80,height:80,margin:"0 auto 8px"}}><svg viewBox="0 0 80 80" style={{transform:"rotate(-90deg)"}}><circle cx="40" cy="40" r="32" fill="none" stroke={T.bg3} strokeWidth="8"/><circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="8" strokeDasharray={String(2*Math.PI*32)} strokeDashoffset={String(2*Math.PI*32*(1-(value||0)/100))} strokeLinecap="round"/></svg><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:16,fontWeight:700,color}}>{value||0}%</div></div><div style={{fontSize:11,color:T.t2}}>{label}</div></div>);

  return(<div>
    <h1 style={s.h1}>Research & Integrity</h1>
    <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{fld&&fld.icon} {fld&&fld.name}</span>Plagiarism · AI detection</p>
    <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
      {[{id:"check",label:"Plagiarism & AI Check"},{id:"submit",label:"Submit Research"},{id:"library",label:"Library"}].map(mb=><button key={mb.id} onClick={()=>setMode(mb.id)} style={{...(mode===mb.id?s.btnP:s.btnS),fontSize:12}}>{mb.label}</button>)}
    </div>
    {mode==="check"&&(<div>
      {!result&&(<div style={s.card}>
        <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Upload or Paste Text</div>
        <div style={{border:"2px dashed "+(file?T.green:T.bd),borderRadius:8,padding:"1.25rem",marginBottom:"1rem"}}>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <label style={{...s.btnP,cursor:"pointer",fontSize:12,padding:"8px 16px"}}>{extracting?"Extracting...":file?"Change File":"Choose File"}<input type="file" style={{display:"none"}} accept=".txt,.pdf" onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])} disabled={extracting}/></label>
            <div style={{flex:1,fontSize:12,color:file?T.t1:T.t3}}>{file?file.name:"PDF or TXT"}{step&&<div style={{color:T.ac,marginTop:4,fontSize:11}}>{step}</div>}</div>
          </div>
          {extractedPreview&&<div style={{marginTop:10,padding:"8px",background:T.bg3,borderRadius:6,fontSize:11,color:T.t2}}><span style={{color:T.green,fontWeight:600}}>Extracted: </span>{extractedPreview}</div>}
        </div>
        <div style={{marginBottom:"1rem"}}><label style={s.lbl}>PASTE TEXT</label><textarea style={{...s.input,height:160,resize:"vertical",fontSize:12}} placeholder="Paste your essay here..." value={text} onChange={e=>setText(e.target.value)}/><div style={{fontSize:10,color:T.t3,marginTop:4}}>{text.split(/\s+/).filter(Boolean).length} words</div></div>
        {error&&<div style={{marginBottom:"0.75rem",padding:"8px 12px",background:T.red+"18",borderRadius:6,fontSize:12,color:T.red}}>{error}</div>}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>analyzeText(text)} style={{...s.btnP,fontSize:13,padding:"10px 24px"}} disabled={loading||extracting||!text.trim()}>{loading?"Analyzing...":"Analyze Text"}</button>
          {loading&&<span style={{fontSize:11,color:T.t3}}>{step}</span>}
        </div>
      </div>)}
      {result&&(<div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"1rem"}}><h2 style={{...s.h1,marginBottom:0}}>Analysis Report</h2><button onClick={()=>{setResult(null);setFile(null);setText("");setExtractedPreview("");}} style={s.btnS}>New Analysis</button></div>
        <div style={{...s.card,borderLeft:"4px solid "+verdictColor(result.overall_verdict),marginBottom:"1rem"}}>
          <div style={{fontSize:11,color:T.t3,marginBottom:4}}>OVERALL VERDICT</div>
          <div style={{fontSize:22,fontWeight:700,color:verdictColor(result.overall_verdict),marginBottom:6}}>{result.overall_verdict}</div>
          <div style={{fontSize:12,color:T.t2}}>{result.summary}</div>
          {result.confidence>0&&<div style={{marginTop:8,fontSize:12,color:T.t3}}>Confidence: {result.confidence}%</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1rem"}}>
          <div style={s.card}><ScoreRing value={result.similarity_index} label="Similarity" color={result.similarity_index>30?T.red:result.similarity_index>15?T.amber:T.green}/></div>
          <div style={s.card}><ScoreRing value={result.ai_content_percentage} label="AI Content" color={result.ai_content_percentage>50?T.red:result.ai_content_percentage>25?T.amber:T.green}/></div>
          <div style={s.card}><ScoreRing value={result.human_content_percentage} label="Human Written" color={result.human_content_percentage>70?T.green:T.amber}/></div>
          <div style={s.card}><ScoreRing value={result.readability_score} label={result.readability_label||"Readability"} color={T.blue}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
          <div style={s.card}><div style={{fontSize:12,fontWeight:600,color:T.t1,marginBottom:10}}>Stats</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["Words",result.word_count||0],["Sentences",result.sentence_count||0]].map(([k,v])=><div key={k} style={{background:T.bg3,borderRadius:6,padding:"10px 12px"}}><div style={{fontSize:10,color:T.t3}}>{k}</div><div style={{fontSize:20,fontWeight:600,color:T.t1}}>{v}</div></div>)}</div></div>
          <div style={s.card}><div style={{fontSize:12,fontWeight:600,color:T.t1,marginBottom:10}}>Recommendations</div>{(result.recommendations||[]).slice(0,4).map((r,i)=><div key={i} style={{fontSize:11,color:T.t2,display:"flex",gap:6,marginBottom:4}}><span style={{color:T.ac}}>→</span>{r}</div>)}</div>
        </div>
        {(result.suspicious_sections||[]).length>0&&<div style={{...s.card,marginBottom:"1rem"}}><div style={{fontSize:12,fontWeight:600,color:T.red,marginBottom:10}}>Flagged Sections</div>{result.suspicious_sections.slice(0,5).map((sec,i)=><div key={i} style={{background:T.red+"14",borderRadius:6,padding:"8px 12px",fontSize:11,color:T.t1,fontStyle:"italic",marginBottom:6}}>"{sec}"</div>)}</div>}
        {(result.ai_indicators||[]).length>0&&<div style={s.card}><div style={{fontSize:12,fontWeight:600,color:T.amber,marginBottom:10}}>AI Indicators</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{result.ai_indicators.slice(0,8).map((ind,i)=><span key={i} style={{background:T.amber+"20",color:T.amber,borderRadius:20,padding:"3px 12px",fontSize:11}}>{ind}</span>)}</div></div>}
      </div>)}
    </div>)}
    {mode==="submit"&&<div style={s.card}><div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Submit Research</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}><div><label style={s.lbl}>TITLE</label><input style={s.input} placeholder="Title"/></div><div><label style={s.lbl}>AUTHORS</label><input style={s.input} placeholder="Authors"/></div></div><button style={s.btnP}>Submit</button></div>}
    {mode==="library"&&<div style={{...s.card,textAlign:"center",padding:"3rem"}}><div style={{fontSize:40,marginBottom:12}}>📚</div><div style={{fontSize:14,color:T.t2}}>Research library coming soon.</div></div>}
  </div>);
};

const AIView=({lang,userField,role})=>{
  const T=useT();const t=useLang();const s=sx(T);const fld=FIELDS[userField];
  const [msgs,setMsgs]=useState([{role:"bot",text:"Karibu! I am EduBot, AKADIMIA AI tutor. I specialise in "+((fld&&fld.name)||userField)+". Ask me anything about your coursework, assignments, research or career!"}]);
  const [inp,setInp]=useState(""),[loading,setL]=useState(false);const scrollRef=useRef(null);
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[msgs]);
  const send=async()=>{
    if(!inp.trim())return;
    const q=inp.trim();setInp("");setL(true);setMsgs(m=>[...m,{role:"user",text:q}]);
    try{
      const {askClaude}=await import("./api.js");
      const {supabase:sb}=await import("./supabase.js");
      const {data:{user:u}}=await sb.auth.getUser();
      if(u&&role==="student"){const ok=await checkAndLogUsage(sb,u.id,"ai_tutor",20);if(!ok){setMsgs(m=>[...m,{role:"bot",text:"You have reached your daily limit of 20 AI Tutor messages. Come back tomorrow!"}]);setL(false);return;}}
      const reply=await askClaude(q,(fld&&fld.name)||"Actuarial Science",lang);
      setMsgs(m=>[...m,{role:"bot",text:reply}]);
    }catch(e){console.error("AI TUTOR ERROR:",e);setMsgs(m=>[...m,{role:"bot",text:"Sorry, I could not process that. Please try again."}]);}
    setL(false);
  };
  return(<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
    <h1 style={s.h1}>{t("ai")}</h1>
    <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{fld&&fld.icon} {fld&&fld.name}</span>Powered by Claude AI</p>
    <div ref={scrollRef} style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,padding:"1rem 0",marginBottom:"1rem"}}>
      {msgs.map((m,i)=>{
        const isBot=m.role==="bot";
        return(<div key={i} style={{display:"flex",justifyContent:isBot?"flex-start":"flex-end"}}>
          <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:isBot?"4px 12px 12px 12px":"12px 4px 12px 12px",background:isBot?T.bg2:T.ac+"22",border:"1px solid "+(isBot?T.bd:T.ac+"44"),fontSize:13,color:T.t1,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.text}</div>
        </div>);
      })}
      {loading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{padding:"10px 14px",borderRadius:"4px 12px 12px 12px",background:T.bg2,border:"1px solid "+T.bd,fontSize:13,color:T.t3}}>Thinking...</div></div>}
    </div>
    <div style={{display:"flex",gap:8}}>
      <input style={{...s.input,flex:1}} placeholder={t("ask")} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}/>
      <button onClick={send} style={{...s.btnP,padding:"10px 20px"}} disabled={loading||!inp.trim()}>{t("send")}</button>
    </div>
  </div>);
};

const OppsView=({userField})=>{
  const T=useT();const s=sx(T);const fld=FIELDS[userField];
  const [opps,setOpps]=useState([]);
  const [loading,setLoading]=useState(false);
  const [filter,setFilter]=useState("all");
  const [lastFetched,setLastFetched]=useState(null);
  const [error,setError]=useState("");

  const fetchOpps=async()=>{
    setLoading(true);setError("");
    try{
      const fieldName=(fld&&fld.name)||userField;
      const today=new Date().toLocaleDateString("en-KE",{day:"numeric",month:"long",year:"numeric"});
      const cacheKey="opps_"+userField;const cached=localStorage.getItem(cacheKey);
      if(cached){const {data,ts}=JSON.parse(cached);if(Date.now()-ts<86400000){setOpps(data);setLastFetched(new Date(ts));setLoading(false);return;}}
      const oppRes=await callGemini("Today is "+today+". List 12 realistic current opportunities for "+fieldName+" students and professionals in Kenya and East Africa. Include a mix of: scholarships, grants, jobs, training programs, fellowships and networking events. Focus on well-known organizations like NRF, DAAD, AfDB, Mastercard Foundation, World Bank, UN agencies, Kenyan government, regional universities and professional bodies. For each include realistic deadlines in 2025-2026. Return ONLY a valid JSON array with these exact fields: title, org, type (one of: scholarship/grant/job/training/networking/fellowship), description (2 sentences max), deadline, url. No markdown, no explanation, just the JSON array.", 2000);
      const oppClean=oppRes.replace(/```json|```/g,"").trim();
      const oppStart=oppClean.indexOf("[");const oppEnd=oppClean.lastIndexOf("]");
      const parsed=JSON.parse(oppStart>=0&&oppEnd>oppStart?oppClean.slice(oppStart,oppEnd+1):"[]");
      const oppData=Array.isArray(parsed)?parsed:[];
      setOpps(oppData);setLastFetched(new Date());
      localStorage.setItem("opps_"+userField,JSON.stringify({data:oppData,ts:Date.now()}));
    }catch(e){setError("Could not fetch opportunities: "+e.message);console.error("OPP ERROR:",e);}
    setLoading(false);
  };

  useEffect(()=>{fetchOpps();},[userField]);

  const types=["all","scholarship","grant","job","training","networking","fellowship"];
  const filtered=filter==="all"?opps:opps.filter(o=>(o.type||"").toLowerCase().includes(filter));
  const typeColor={scholarship:T.ac,grant:T.teal,job:T.green,training:T.blue,networking:T.purple,fellowship:T.amber};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div>
          <h1 style={s.h1}>Opportunities</h1>
          <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{fld&&fld.icon} {fld&&fld.name}</span>{lastFetched?"Last updated: "+lastFetched.toLocaleTimeString():"Loading..."}</p>
        </div>
        <button onClick={fetchOpps} style={{...s.btnP,fontSize:12,padding:"8px 16px"}} disabled={loading}>{loading?"Searching...":"Refresh"}</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:"1.25rem",flexWrap:"wrap"}}>
        {types.map(type=>(
          <button key={type} onClick={()=>setFilter(type)} style={{...(filter===type?s.btnP:s.btnS),fontSize:11,padding:"5px 12px",textTransform:"capitalize"}}>{type==="all"?"All":type}</button>
        ))}
      </div>
      {error&&<div style={{...s.card,color:T.red,textAlign:"center",padding:"1.5rem"}}>{error} <button onClick={fetchOpps} style={{...s.btnS,marginLeft:8,fontSize:11}}>Retry</button></div>}
      {loading&&<div style={{display:"grid",gap:10}}>{[1,2,3,4].map(i=><div key={i} style={{...s.card,height:80,background:T.bg3}}/>)}</div>}
      {!loading&&!error&&filtered.length===0&&(
        <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
          <div style={{fontSize:40,marginBottom:12}}>🌍</div>
          <div style={{fontSize:14,color:T.t2}}>No opportunities found. Try refreshing.</div>
        </div>
      )}
      {!loading&&filtered.length>0&&(
        <div style={{display:"grid",gap:10}}>
          {filtered.map((o,i)=>{
            const tc=typeColor[(o.type||"").toLowerCase()]||T.t2;
            return(
              <div key={i} style={{...s.card,borderLeft:"3px solid "+tc}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:600,color:T.t1}}>{o.title}</span>
                      <span style={{background:tc+"22",color:tc,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600,textTransform:"capitalize"}}>{o.type||"opportunity"}</span>
                    </div>
                    <div style={{fontSize:12,color:T.ac,fontWeight:500,marginBottom:4}}>{o.org}</div>
                    <div style={{fontSize:12,color:T.t2,lineHeight:1.6,marginBottom:o.deadline?6:0}}>{o.description}</div>
                    {o.deadline&&<div style={{fontSize:11,color:T.amber}}>Deadline: {o.deadline}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",flexShrink:0}}>
                    {o.url&&o.url.startsWith("http")&&<a href={o.url} target="_blank" rel="noreferrer" style={{...s.btnP,fontSize:11,padding:"6px 14px",textDecoration:"none"}}>Apply →</a>}
                    <span style={{fontSize:9,color:T.t3}}>Verify on official site</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AnalyticsView=({userField,userName,role})=>{
  const T=useT();const s=sx(T);const fld=FIELDS[userField];
  const [loading,setLoading]=useState(false);
  const [score,setScore]=useState(null);
  const [error,setError]=useState("");
  const [certMode,setCertMode]=useState(false);
  const [certData,setCertData]=useState({course:"",grade:"",date:new Date().toISOString().slice(0,10)});

  const generateScore=async()=>{
    setLoading(true);setError("");setScore(null);
    try{
      const {supabase}=await import("./supabase.js");
      const {data:{user}}=await supabase.auth.getUser();
      const [{data:subs},{data:exSubs},{data:profile}]=await Promise.all([
        supabase.from("submissions").select("*").eq("student_name",userName),
        supabase.from("exam_submissions").select("*").eq("student_name",userName),
        supabase.from("profiles").select("*").eq("id",user.id).single()
      ]);
      const gradedAssignments=(subs||[]).filter(s=>s.status==="graded");
      const gradedExams=(exSubs||[]).filter(s=>s.marks!=null);
      const avgAssignment=gradedAssignments.length>0?gradedAssignments.reduce((a,s)=>a+(s.marks||0),0)/gradedAssignments.length:0;
      const avgExam=gradedExams.length>0?gradedExams.reduce((a,s)=>a+(s.marks||0),0)/gradedExams.length:0;
      const fieldName=(fld&&fld.name)||userField;
      const {supabase:sbA}=await import("./supabase.js");
      const {data:{user:uA}}=await sbA.auth.getUser();
      if(uA&&role==="student"){const ok=await checkAndLogUsage(sbA,uA.id,"career_analytics",3);if(!ok){if(addNotif)addNotif("⚠️","Limit Reached","You have used your 3 daily career analysis runs. Try again tomorrow.");return;}}
      const raw=await callAI("You are a career readiness analyst for Kenyan university graduates. Assess this student's employability.\n\nStudent: "+userName+"\nField: "+fieldName+"\nYear Level: "+(profile?.year_level||"Unknown")+"\nAssignments submitted: "+(subs||[]).length+"\nAssignments graded: "+gradedAssignments.length+"\nAvg assignment score: "+avgAssignment.toFixed(1)+"%\nExams taken: "+(exSubs||[]).length+"\nExams graded: "+gradedExams.length+"\nAvg exam score: "+avgExam.toFixed(1)+"%\n\nReturn ONLY this JSON: {\"overall_score\":NUMBER_0_100,\"grade\":\"A/B/C/D\",\"label\":\"Career Ready/Developing/Needs Work\",\"academic_score\":NUMBER,\"engagement_score\":NUMBER,\"skills_score\":NUMBER,\"strengths\":[\"STRING\",\"STRING\",\"STRING\"],\"gaps\":[\"STRING\",\"STRING\",\"STRING\"],\"top_roles\":[\"STRING\",\"STRING\",\"STRING\"],\"next_steps\":[\"STRING\",\"STRING\",\"STRING\"]}", 1200);
      const clean=raw.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean.slice(clean.indexOf("{"),clean.lastIndexOf("}")+1));
      setScore(parsed);
    }catch(e){setError("Could not generate score. Please try again.");}
    setLoading(false);
  };

  const generateCertificate=()=>{
    if(!certData.course)return;
    const html=`<!DOCTYPE html><html><head><title>Certificate — AKADIMIA</title><style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Georgia,serif;background:#f8f5f0;display:flex;align-items:center;justify-content:center;min-height:100vh;}
      .cert{width:800px;background:#fff;border:12px solid #D4A017;padding:60px;text-align:center;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.15);}
      .cert::before{content:"";position:absolute;inset:8px;border:2px solid #D4A017;pointer-events:none;}
      .logo{font-size:32px;font-weight:700;letter-spacing:4px;color:#1a1a2e;margin-bottom:4px;}
      .tagline{font-size:12px;color:#D4A017;font-style:italic;margin-bottom:32px;}
      .cert-title{font-size:14px;color:#666;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;}
      .cert-of{font-size:42px;color:#D4A017;font-style:italic;margin-bottom:24px;}
      .student-name{font-size:36px;font-weight:700;color:#1a1a2e;border-bottom:2px solid #D4A017;display:inline-block;padding-bottom:8px;margin-bottom:24px;}
      .cert-body{font-size:16px;color:#333;line-height:1.8;margin-bottom:32px;}
      .course-name{font-size:22px;font-weight:700;color:#1a1a2e;font-style:italic;}
      .grade-box{display:inline-block;background:#1a1a2e;color:#D4A017;padding:8px 24px;border-radius:4px;font-size:18px;font-weight:700;margin:12px 0;}
      .sig-section{display:flex;justify-content:space-between;margin-top:48px;}
      .sig-line{text-align:center;width:200px;}
      .sig-bar{border-top:1px solid #333;padding-top:8px;font-size:12px;color:#666;}
      .seal{font-size:48px;margin:16px 0;}
      .cert-date{font-size:13px;color:#888;margin-top:24px;}
      .footer-note{font-size:10px;color:#aaa;margin-top:16px;}
      @media print{body{background:#fff;} .no-print{display:none;}}
    </style></head><body>
    <div class="cert">
      <div class="logo">AKADIMIA</div>
      <div class="tagline">Ujuzi Bila Mipaka — Every Field. Every Student. One Platform.</div>
      <div class="cert-title">This is to certify that</div>
      <div class="student-name">${certData.name||userName}</div>
      <div class="cert-body">has successfully completed the course</div>
      <div class="course-name">${certData.course}</div>
      <div class="cert-body">with the following result:</div>
      <div class="grade-box">Grade: ${certData.grade||"PASS"}</div>
      <div class="cert-body">in the field of <strong>${(fld&&fld.name)||userField}</strong></div>
      <div class="seal">🏛️</div>
      <div class="sig-section">
        <div class="sig-line"><div class="sig-bar">Platform Administrator<br>AKADIMIA</div></div>
        <div class="sig-line"><div style="font-size:22px;color:#D4A017;margin-bottom:4px;">AKADIMIA</div><div class="sig-bar">Verified Digital Certificate</div></div>
        <div class="sig-line"><div class="sig-bar">Date Issued<br>${new Date(certData.date).toLocaleDateString("en-KE",{day:"numeric",month:"long",year:"numeric"})}</div></div>
      </div>
      <div class="cert-date">Certificate ID: AKD-${Date.now().toString(36).toUpperCase()} | Verify at akadimia.co.ke</div>
      <div class="footer-note">This certificate was issued by AKADIMIA Academic Platform. Data protected under Kenya Data Protection Act 2019.</div>
    </div>
    <div class="no-print" style="position:fixed;bottom:20px;right:20px;">
      <button onclick="window.print()" style="background:#D4A017;color:#000;border:none;padding:12px 28px;border-radius:6px;font-size:15px;cursor:pointer;font-weight:700;">Print / Save PDF</button>
    </div>
    </body></html>`;
    const win=window.open("","_blank");
    win.document.write(html);
    win.document.close();
  };

  const scoreColor=(n)=>n>=75?T.green:n>=50?T.amber:T.red;
  const ScoreArc=({value,label,color})=>(
    <div style={{textAlign:"center"}}>
      <div style={{position:"relative",width:72,height:72,margin:"0 auto 6px"}}>
        <svg viewBox="0 0 72 72" style={{transform:"rotate(-90deg)"}}>
          <circle cx="36" cy="36" r="28" fill="none" stroke={T.bg3} strokeWidth="7"/>
          <circle cx="36" cy="36" r="28" fill="none" stroke={color} strokeWidth="7" strokeDasharray={String(2*Math.PI*28)} strokeDashoffset={String(2*Math.PI*28*(1-(value||0)/100))} strokeLinecap="round"/>
        </svg>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:14,fontWeight:700,color}}>{value||0}</div>
      </div>
      <div style={{fontSize:10,color:T.t3}}>{label}</div>
    </div>
  );

  return(
    <div>
      <h1 style={s.h1}>Analytics & Career Readiness</h1>
      <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{fld&&fld.icon} {fld&&fld.name}</span>AI-powered employability assessment</p>

      <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
        <button onClick={()=>setCertMode(false)} style={{...(certMode?s.btnS:s.btnP),fontSize:12}}>Career Score</button>
        {(role==="lecturer"||role==="admin")&&<button onClick={()=>setCertMode(true)} style={{...(certMode?s.btnP:s.btnS),fontSize:12}}>Digital Certificate</button>}
      </div>

      {!certMode&&(<div>
        {!score&&(
          <div style={{...s.card,textAlign:"center",padding:"2.5rem"}}>
            <div style={{fontSize:48,marginBottom:16}}>🎯</div>
            <div style={{fontSize:16,fontWeight:600,color:T.t1,marginBottom:8}}>AI Career Readiness Score</div>
            <div style={{fontSize:13,color:T.t2,marginBottom:"1.5rem",lineHeight:1.7}}>Get an AI-powered assessment of your employability based on your academic performance, engagement and activity on AKADIMIA. Updated each time you run it.</div>
            {error&&<div style={{marginBottom:"1rem",padding:"8px 12px",background:T.red+"18",borderRadius:6,fontSize:12,color:T.red}}>{error}</div>}
            <button onClick={generateScore} style={{...s.btnP,fontSize:14,padding:"12px 32px"}} disabled={loading}>{loading?"Analyzing your profile...":"Generate My Score"}</button>
          </div>
        )}
        {score&&(
          <div>
            <div style={{...s.card,borderLeft:"4px solid "+scoreColor(score.overall_score),marginBottom:"1rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
                <div>
                  <div style={{fontSize:11,color:T.t3,marginBottom:4}}>CAREER READINESS SCORE</div>
                  <div style={{fontSize:52,fontWeight:700,color:scoreColor(score.overall_score),lineHeight:1}}>{score.overall_score}</div>
                  <div style={{fontSize:14,color:T.t2,marginTop:4}}>{score.label} — Grade {score.grade}</div>
                </div>
                <div style={{display:"flex",gap:20}}>
                  <ScoreArc value={score.academic_score} label="Academic" color={scoreColor(score.academic_score)}/>
                  <ScoreArc value={score.engagement_score} label="Engagement" color={scoreColor(score.engagement_score)}/>
                  <ScoreArc value={score.skills_score} label="Skills" color={scoreColor(score.skills_score)}/>
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
              <div style={s.card}>
                <div style={{fontSize:12,fontWeight:600,color:T.green,marginBottom:10}}>Strengths</div>
                {(score.strengths||[]).map((str,i)=><div key={i} style={{fontSize:12,color:T.t2,display:"flex",gap:6,marginBottom:6}}><span style={{color:T.green}}>✓</span>{str}</div>)}
              </div>
              <div style={s.card}>
                <div style={{fontSize:12,fontWeight:600,color:T.amber,marginBottom:10}}>Areas to Improve</div>
                {(score.gaps||[]).map((g,i)=><div key={i} style={{fontSize:12,color:T.t2,display:"flex",gap:6,marginBottom:6}}><span style={{color:T.amber}}>→</span>{g}</div>)}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
              <div style={s.card}>
                <div style={{fontSize:12,fontWeight:600,color:T.ac,marginBottom:10}}>Top Career Matches</div>
                {(score.top_roles||[]).map((r,i)=><div key={i} style={{fontSize:12,color:T.t1,padding:"6px 10px",background:T.bg3,borderRadius:6,marginBottom:6}}>{r}</div>)}
              </div>
              <div style={s.card}>
                <div style={{fontSize:12,fontWeight:600,color:T.blue,marginBottom:10}}>Recommended Next Steps</div>
                {(score.next_steps||[]).map((ns,i)=><div key={i} style={{fontSize:12,color:T.t2,display:"flex",gap:6,marginBottom:6}}><span style={{color:T.blue,fontWeight:700}}>{i+1}.</span>{ns}</div>)}
              </div>
            </div>
            <button onClick={()=>setScore(null)} style={{...s.btnS,fontSize:12}}>Recalculate</button>
          </div>
        )}
      </div>)}

      {certMode&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Generate Digital Certificate</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
            <div><label style={s.lbl}>STUDENT NAME</label><input style={s.input} value={certData.name||userName} onChange={e=>setCertData({...certData,name:e.target.value})}/></div>
            <div><label style={s.lbl}>COURSE / UNIT NAME</label><input style={s.input} placeholder="e.g. Risk Theory SAC 406" value={certData.course} onChange={e=>setCertData({...certData,course:e.target.value})}/></div>
            <div><label style={s.lbl}>GRADE / RESULT</label><input style={s.input} placeholder="e.g. A, Distinction, 78%" value={certData.grade} onChange={e=>setCertData({...certData,grade:e.target.value})}/></div>
            <div><label style={s.lbl}>DATE ISSUED</label><input style={s.input} type="datetime-local" value={certData.date} onChange={e=>setCertData({...certData,date:e.target.value})}/></div>
          </div>
          <div style={{padding:"12px",background:T.bg3,borderRadius:8,fontSize:12,color:T.t2,marginBottom:"1rem"}}>The certificate will open in a new tab. Click Print / Save PDF to save it. The certificate includes a unique verification ID linked to akadimia.co.ke.</div>
          <button onClick={generateCertificate} style={{...s.btnP,fontSize:13,padding:"10px 24px"}} disabled={!certData.course}>Generate Certificate</button>
        </div>
      )}
    </div>
  );
};

const InnovationHub=({userName,role,userField})=>{
  const T=useT();const s=sx(T);
  const [tab,setTab]=useState("feed");
  const [innovations,setInnovations]=useState([]);
  const [challenges,setChallenges]=useState([]);
  const [aiIdeas,setAiIdeas]=useState([]);
  const [loading,setLoading]=useState(true);
  const [aiLoading,setAiLoading]=useState(false);
  const [showCreate,setShowCreate]=useState(false);
  const [showChallenge,setShowChallenge]=useState(false);
  const [comments,setComments]=useState({});
  const [showComments,setShowComments]=useState(null);
  const [newComment,setNewComment]=useState("");
  const [userLikes,setUserLikes]=useState(new Set());
  const [newI,setNewI]=useState({title:"",description:"",category:"idea",tags:""});
  const [newC,setNewC]=useState({title:"",description:"",sponsor:"",prize:"",deadline:"",category:"tech",link:""});
  const [subFile,setSubFile]=useState(null);
  const isAdmin=role==="admin"||role==="lecturer";
  const cats=["idea","project","research","startup","social","tech","agriculture","health","education","finance"];
  const catColors={idea:T.ac,project:T.blue,research:T.purple,startup:T.amber,social:T.green,tech:T.teal,agriculture:"#84CC16",health:T.red,education:T.blue,finance:T.green};

  const load=async()=>{
    setLoading(true);
    const {supabase}=await import("./supabase.js");
    const [{data:inv},{data:chal},{data:lk}]=await Promise.all([
      supabase.from("innovations").select("*").order("created_at",{ascending:false}),
      supabase.from("challenges").select("*").order("deadline",{ascending:true}),
      supabase.from("innovation_likes").select("innovation_id,user_id")
    ]);
    const {data:{user}}=await supabase.auth.getUser();
    setInnovations(inv||[]);
    setChallenges(chal||[]);
    setUserLikes(new Set((lk||[]).filter(l=>l.user_id===user?.id).map(l=>l.innovation_id)));
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const generateAiIdeas=async()=>{
    setAiLoading(true);setAiIdeas([]);
    try{
      const fld=FIELDS[userField];
      const {supabase:sbI}=await import("./supabase.js");
      const {data:{user:uI}}=await sbI.auth.getUser();
      if(uI&&role==="student"){const ok=await checkAndLogUsage(sbI,uI.id,"innovation_ideas",5);if(!ok){if(addNotif)addNotif("⚠️","Limit Reached","You have used your 5 daily idea refreshes. Try again tomorrow.");return;}}
      const raw=await callGemini("Generate 6 exciting, actionable innovation ideas for Kenyan university students, especially those studying "+(fld?.name||userField)+". Ideas should address real African problems and have startup or social impact potential. Mix fields — include tech, agriculture, health, finance, education and social innovation. For each include a catchy title, 2-sentence description, category, potential impact and difficulty (Easy/Medium/Hard). Return ONLY a JSON array: [{title,description,category,impact,difficulty}]", 1500);
      const clean=raw.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean.slice(clean.indexOf("["),clean.lastIndexOf("]")+1));
      setAiIdeas(Array.isArray(parsed)?parsed:[]);
    }catch(e){console.error(e);}
    setAiLoading(false);
  };

  const submitInnovation=async()=>{
    if(!newI.title||!newI.description)return;
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    let fileUrl="";
    if(subFile){
      const path="innovations/"+user.id+"/"+Date.now()+"_"+subFile.name;
      const {data:upData}=await supabase.storage.from("course-materials").upload(path,subFile);
      if(upData){const {data:urlData}=supabase.storage.from("course-materials").getPublicUrl(path);fileUrl=urlData.publicUrl;}
    }
    await supabase.from("innovations").insert({...newI,tags:newI.tags.split(",").map(t=>t.trim()).filter(Boolean),author_name:userName,author_id:user.id,file_url:fileUrl||null});
    setShowCreate(false);setNewI({title:"",description:"",category:"idea",tags:""});setSubFile(null);load();
  };

  const submitChallenge=async()=>{
    if(!newC.title||!newC.sponsor)return;
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    await supabase.from("challenges").insert({...newC,created_by:user.id});
    setShowChallenge(false);setNewC({title:"",description:"",sponsor:"",prize:"",deadline:"",category:"tech",link:""});load();
  };

  const toggleLike=async(innovId)=>{
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    if(userLikes.has(innovId)){
      await supabase.from("innovation_likes").delete().eq("innovation_id",innovId).eq("user_id",user.id);
      await supabase.from("innovations").update({likes:Math.max(0,(innovations.find(i=>i.id===innovId)?.likes||1)-1)}).eq("id",innovId);
      setUserLikes(s=>{const n=new Set(s);n.delete(innovId);return n;});
    }else{
      await supabase.from("innovation_likes").insert({innovation_id:innovId,user_id:user.id});
      await supabase.from("innovations").update({likes:(innovations.find(i=>i.id===innovId)?.likes||0)+1}).eq("id",innovId);
      setUserLikes(s=>new Set([...s,innovId]));
    }
    load();
  };

  const loadComments=async(innovId)=>{
    const {supabase}=await import("./supabase.js");
    const {data}=await supabase.from("innovation_comments").select("*").eq("innovation_id",innovId).order("created_at",{ascending:true});
    setComments(c=>({...c,[innovId]:data||[]}));
    setShowComments(showComments===innovId?null:innovId);
  };

  const submitComment=async(innovId)=>{
    if(!newComment.trim())return;
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    await supabase.from("innovation_comments").insert({innovation_id:innovId,author_name:userName,author_id:user.id,content:newComment.trim()});
    setNewComment("");loadComments(innovId);
  };

  const daysLeft=(d)=>{if(!d)return null;const diff=Math.ceil((new Date(d)-new Date())/(1000*60*60*24));return diff>0?diff:0;};

  return(
    <div>
      <div style={{marginBottom:"1.5rem"}}>
        <h1 style={{...s.h1,marginBottom:4}}>Innovation Hub</h1>
        <p style={{...s.sub,marginBottom:"1rem"}}>Ideas · Challenges · Community — open to every field and every mind</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["feed","💡 Ideas Feed"],["challenges","🏆 Challenges"],["ai","🤖 AI Ideas"],["community","👥 Community"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{...(tab===id?s.btnP:s.btnS),fontSize:12}}>{label}</button>
          ))}
        </div>
      </div>

      {tab==="feed"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:12,color:T.t3}}>{innovations.length} ideas shared by the community</div>
            <button onClick={()=>setShowCreate(!showCreate)} style={s.btnP}>+ Share an Idea</button>
          </div>

          {showCreate&&(
            <div style={{...s.card,marginBottom:"1.25rem",border:"1px solid "+rgba(T.ac,0.3)}}>
              <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Share Your Innovation</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
                <div><label style={s.lbl}>TITLE</label><input style={s.input} value={newI.title} onChange={e=>setNewI({...newI,title:e.target.value})} placeholder="Give your idea a catchy name"/></div>
                <div><label style={s.lbl}>CATEGORY</label>
                  <select style={s.input} value={newI.category} onChange={e=>setNewI({...newI,category:e.target.value})}>
                    {cats.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>DESCRIPTION</label><textarea style={{...s.input,height:100,resize:"vertical"}} value={newI.description} onChange={e=>setNewI({...newI,description:e.target.value})} placeholder="Describe your idea, the problem it solves and how it could work..."/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
                <div><label style={s.lbl}>TAGS (comma separated)</label><input style={s.input} value={newI.tags} onChange={e=>setNewI({...newI,tags:e.target.value})} placeholder="e.g. fintech, mobile, rural"/></div>
                <div><label style={s.lbl}>ATTACH PDF / DOCUMENT</label>
                  <label style={{...s.btnS,cursor:"pointer",fontSize:11,display:"block",textAlign:"center"}}>
                    {subFile?subFile.name:"Choose File"}
                    <input type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e=>setSubFile(e.target.files[0]||null)}/>
                  </label>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={submitInnovation} style={s.btnP}>Post Idea</button>
                <button onClick={()=>setShowCreate(false)} style={s.btnS}>Cancel</button>
              </div>
            </div>
          )}

          {loading?<div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>Loading ideas...</div>:
          innovations.length===0?(
            <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
              <div style={{fontSize:48,marginBottom:12}}>💡</div>
              <div style={{fontSize:14,color:T.t2,marginBottom:8}}>No ideas yet. Be the first to share!</div>
              <button onClick={()=>setShowCreate(true)} style={s.btnP}>Share an Idea</button>
            </div>
          ):(
            <div style={{display:"grid",gap:12}}>
              {innovations.map(inv=>{
                const color=catColors[inv.category]||T.ac;
                const liked=userLikes.has(inv.id);
                const commList=comments[inv.id]||[];
                return(
                  <div key={inv.id} style={{...s.card,borderLeft:"3px solid "+color}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                          <span style={{fontSize:15,fontWeight:600,color:T.t1}}>{inv.title}</span>
                          <span style={{background:rgba(color,0.15),color,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600,textTransform:"capitalize"}}>{inv.category}</span>
                          {inv.status==="featured"&&<span style={{background:rgba(T.amber,0.2),color:T.amber,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600}}>⭐ Featured</span>}
                        </div>
                        <div style={{fontSize:12,color:T.t2,lineHeight:1.7,marginBottom:8}}>{inv.description}</div>
                        {inv.tags&&inv.tags.length>0&&(
                          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                            {inv.tags.map((tag,i)=><span key={i} style={{background:T.bg3,color:T.t3,borderRadius:20,padding:"2px 8px",fontSize:10}}>#{tag}</span>)}
                          </div>
                        )}
                        <div style={{fontSize:11,color:T.t3}}>
                          By <span style={{color:T.ac,fontWeight:500}}>{inv.author_name}</span> · {new Date(inv.created_at).toLocaleDateString("en-KE")}
                        </div>
                      </div>
                      {inv.file_url&&<a href={inv.file_url} target="_blank" rel="noreferrer" style={{...s.btnS,fontSize:11,padding:"5px 10px",textDecoration:"none",flexShrink:0}}>📎 View</a>}
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <button onClick={()=>toggleLike(inv.id)} style={{background:liked?rgba(T.red,0.15):"none",border:"1px solid "+(liked?T.red:T.bd),borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:12,color:liked?T.red:T.t3,display:"flex",alignItems:"center",gap:4}}>
                        {liked?"❤️":"🤍"} {inv.likes||0}
                      </button>
                      <button onClick={()=>loadComments(inv.id)} style={{background:"none",border:"1px solid "+T.bd,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:12,color:T.t3}}>
                        💬 {showComments===inv.id?"Hide":"Discuss"} {commList.length>0?"("+commList.length+")":""}
                      </button>
                      {isAdmin&&<button onClick={async()=>{const {supabase}=await import("./supabase.js");await supabase.from("innovations").update({status:inv.status==="featured"?"open":"featured"}).eq("id",inv.id);load();}} style={{background:"none",border:"1px solid "+T.bd,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:11,color:T.amber}}>{inv.status==="featured"?"Unfeature":"⭐ Feature"}</button>}
                      {(inv.author_id===inv.author_id||isAdmin)&&<button onClick={async()=>{if(!confirm("Delete this idea?"))return;const {supabase}=await import("./supabase.js");await supabase.from("innovations").delete().eq("id",inv.id);load();}} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:11,marginLeft:"auto"}}>🗑</button>}
                    </div>
                    {showComments===inv.id&&(
                      <div style={{marginTop:"1rem",borderTop:"1px solid "+T.bd,paddingTop:"1rem"}}>
                        {commList.map((c,i)=>(
                          <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
                            <div style={{width:28,height:28,borderRadius:"50%",background:rgba(T.ac,0.2),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:T.ac,flexShrink:0}}>{c.author_name?.[0]||"?"}</div>
                            <div style={{flex:1}}>
                              <div style={{fontSize:11,fontWeight:600,color:T.ac}}>{c.author_name} <span style={{color:T.t3,fontWeight:400}}>· {new Date(c.created_at).toLocaleDateString()}</span></div>
                              <div style={{fontSize:12,color:T.t1,lineHeight:1.6}}>{c.content}</div>
                            </div>
                          </div>
                        ))}
                        <div style={{display:"flex",gap:8,marginTop:8}}>
                          <input style={{...s.input,flex:1,fontSize:12}} placeholder="Add to the discussion..." value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitComment(inv.id)}/>
                          <button onClick={()=>submitComment(inv.id)} style={{...s.btnP,fontSize:11,padding:"8px 14px"}}>Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab==="challenges"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:12,color:T.t3}}>{challenges.length} active challenges and hackathons</div>
            {isAdmin&&<button onClick={()=>setShowChallenge(!showChallenge)} style={s.btnP}>+ Add Challenge</button>}
          </div>

          {isAdmin&&showChallenge&&(
            <div style={{...s.card,marginBottom:"1.25rem",border:"1px solid "+rgba(T.amber,0.3)}}>
              <div style={{fontSize:14,fontWeight:600,color:T.amber,marginBottom:"1rem"}}>Add Challenge / Hackathon</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
                <div><label style={s.lbl}>TITLE</label><input style={s.input} value={newC.title} onChange={e=>setNewC({...newC,title:e.target.value})} placeholder="e.g. Safaricom Hackathon 2025"/></div>
                <div><label style={s.lbl}>SPONSOR / ORGANISER</label><input style={s.input} value={newC.sponsor} onChange={e=>setNewC({...newC,sponsor:e.target.value})} placeholder="e.g. Safaricom PLC"/></div>
                <div><label style={s.lbl}>PRIZE</label><input style={s.input} value={newC.prize} onChange={e=>setNewC({...newC,prize:e.target.value})} placeholder="e.g. KES 500,000"/></div>
                <div><label style={s.lbl}>DEADLINE</label><input style={s.input} type="datetime-local" value={newC.deadline} onChange={e=>setNewC({...newC,deadline:e.target.value})}/></div>
                <div><label style={s.lbl}>CATEGORY</label>
                  <select style={s.input} value={newC.category} onChange={e=>setNewC({...newC,category:e.target.value})}>
                    {["tech","agriculture","health","education","finance","social","energy","environment"].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={s.lbl}>APPLY LINK</label><input style={s.input} value={newC.link} onChange={e=>setNewC({...newC,link:e.target.value})} placeholder="https://..."/></div>
              </div>
              <div style={{marginBottom:"1rem"}}><label style={s.lbl}>DESCRIPTION</label><textarea style={{...s.input,height:80,resize:"vertical"}} value={newC.description} onChange={e=>setNewC({...newC,description:e.target.value})} placeholder="What is the challenge about?"/></div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={submitChallenge} style={{...s.btnP,background:T.amber,color:"#000"}}>Post Challenge</button>
                <button onClick={()=>setShowChallenge(false)} style={s.btnS}>Cancel</button>
              </div>
            </div>
          )}

          {challenges.length===0?(
            <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
              <div style={{fontSize:48,marginBottom:12}}>🏆</div>
              <div style={{fontSize:14,color:T.t2}}>No active challenges yet.</div>
              {isAdmin&&<div style={{fontSize:12,color:T.t3,marginTop:4}}>Add a hackathon or corporate challenge above.</div>}
            </div>
          ):(
            <div style={{display:"grid",gap:12}}>
              {challenges.map(ch=>{
                const days=daysLeft(ch.deadline);
                const urgent=days!==null&&days<=7;
                return(
                  <div key={ch.id} style={{...s.card,borderLeft:"3px solid "+(urgent?T.red:T.amber)}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                          <span style={{fontSize:15,fontWeight:600,color:T.t1}}>{ch.title}</span>
                          <span style={{background:rgba(T.amber,0.15),color:T.amber,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600,textTransform:"capitalize"}}>{ch.category}</span>
                          {urgent&&days>0&&<span style={{background:rgba(T.red,0.15),color:T.red,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600}}>🔥 {days}d left</span>}
                          {days===0&&<span style={{background:rgba(T.red,0.2),color:T.red,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600}}>Closed</span>}
                        </div>
                        <div style={{fontSize:12,color:T.amber,fontWeight:500,marginBottom:4}}>{ch.sponsor}</div>
                        {ch.description&&<div style={{fontSize:12,color:T.t2,lineHeight:1.7,marginBottom:6}}>{ch.description}</div>}
                        <div style={{fontSize:11,color:T.t3,display:"flex",gap:16,flexWrap:"wrap"}}>
                          {ch.prize&&<span>🏅 Prize: {ch.prize}</span>}
                          {ch.deadline&&<span>📅 Deadline: {new Date(ch.deadline).toLocaleDateString("en-KE")}</span>}
                          {days!==null&&days>0&&!urgent&&<span>⏳ {days} days left</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                        {ch.link&&<a href={ch.link} target="_blank" rel="noreferrer" style={{...s.btnP,textDecoration:"none",fontSize:12,background:T.amber,color:"#000"}}>Apply →</a>}
                        {isAdmin&&<button onClick={async()=>{if(!confirm("Delete?"))return;const {supabase}=await import("./supabase.js");await supabase.from("challenges").delete().eq("id",ch.id);load();}} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:11}}>🗑</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab==="ai"&&(
        <div>
          <div style={{...s.card,marginBottom:"1.5rem",textAlign:"center",padding:"2rem"}}>
            <div style={{fontSize:40,marginBottom:12}}>🤖</div>
            <div style={{fontSize:16,fontWeight:600,color:T.t1,marginBottom:8}}>AI Innovation Spark</div>
            <div style={{fontSize:13,color:T.t2,marginBottom:"1.5rem",lineHeight:1.7}}>Claude AI generates 6 fresh innovation ideas tailored to the Kenyan context. Get inspired, then post your own version to the feed.</div>
            <button onClick={generateAiIdeas} style={{...s.btnP,fontSize:13,padding:"10px 28px"}} disabled={aiLoading}>{aiLoading?"Generating ideas...":"Spark My Ideas 🔥"}</button>
          </div>
          {aiIdeas.length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {aiIdeas.map((idea,i)=>{
                const color=catColors[idea.category?.toLowerCase()]||T.ac;
                return(
                  <div key={i} style={{...s.card,borderTop:"3px solid "+color}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <span style={{fontSize:14,fontWeight:600,color:T.t1,flex:1}}>{idea.title}</span>
                      <span style={{background:rgba(color,0.15),color,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:600,flexShrink:0,marginLeft:8,textTransform:"capitalize"}}>{idea.category}</span>
                    </div>
                    <div style={{fontSize:12,color:T.t2,lineHeight:1.7,marginBottom:8}}>{idea.description}</div>
                    {idea.impact&&<div style={{fontSize:11,color:T.green,marginBottom:4}}>Impact: {idea.impact}</div>}
                    {idea.difficulty&&<div style={{fontSize:11,color:idea.difficulty==="Easy"?T.green:idea.difficulty==="Medium"?T.amber:T.red}}>Difficulty: {idea.difficulty}</div>}
                    <button onClick={()=>{setNewI({title:idea.title,description:idea.description,category:idea.category?.toLowerCase()||"idea",tags:idea.category||""});setShowCreate(true);setTab("feed");}} style={{...s.btnS,fontSize:11,marginTop:12,width:"100%"}}>Post This Idea →</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab==="community"&&(
        <div>
          <div style={{...s.card,marginBottom:"1.25rem",background:"linear-gradient(135deg,"+rgba(T.ac,0.1)+","+rgba(T.purple,0.1)+")",border:"1px solid "+rgba(T.ac,0.2)}}>
            <div style={{fontSize:15,fontWeight:600,color:T.t1,marginBottom:8}}>Welcome to the Innovation Community</div>
            <div style={{fontSize:12,color:T.t2,lineHeight:1.8}}>This is a cross-disciplinary space where actuaries meet engineers, lawyers meet technologists, and farmers meet data scientists. Every field has a problem. Every student has a solution.</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1.25rem"}}>
            {[
              {icon:"💡",label:"Total Ideas",value:innovations.length,color:T.ac},
              {icon:"🏆",label:"Live Challenges",value:challenges.filter(c=>daysLeft(c.deadline)>0).length,color:T.amber},
              {icon:"❤️",label:"Total Likes",value:innovations.reduce((a,i)=>a+(i.likes||0),0),color:T.red},
              {icon:"👥",label:"Contributors",value:new Set(innovations.map(i=>i.author_name)).size,color:T.green},
            ].map(({icon,label,value,color})=>(
              <div key={label} style={{...s.card,textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:4}}>{icon}</div>
                <div style={{fontSize:24,fontWeight:700,color}}>{value}</div>
                <div style={{fontSize:11,color:T.t3}}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{...s.card,marginBottom:"1rem"}}>
            <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:12}}>Most Loved Ideas</div>
            {[...innovations].sort((a,b)=>(b.likes||0)-(a.likes||0)).slice(0,5).map((inv,i)=>(
              <div key={inv.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<4?"1px solid "+T.bd:"none"}}>
                <span style={{fontSize:18,fontWeight:700,color:T.t3,width:24,textAlign:"center"}}>{i+1}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:T.t1,fontWeight:500}}>{inv.title}</div>
                  <div style={{fontSize:11,color:T.t3}}>by {inv.author_name} · {inv.category}</div>
                </div>
                <span style={{fontSize:12,color:T.red}}>❤️ {inv.likes||0}</span>
              </div>
            ))}
            {innovations.length===0&&<div style={{fontSize:12,color:T.t3,textAlign:"center",padding:"1rem"}}>No ideas yet. Be the first!</div>}
          </div>
          <div style={{...s.card,background:rgba(T.ac,0.05),border:"1px solid "+rgba(T.ac,0.2)}}>
            <div style={{fontSize:13,fontWeight:600,color:T.ac,marginBottom:8}}>Community Guidelines</div>
            <div style={{fontSize:12,color:T.t2,lineHeight:1.8}}>
              Be respectful and constructive. Credit sources and inspirations. Build on each others ideas rather than dismissing them. One bold idea shared today could become the solution that changes a million lives tomorrow. This is your space — own it.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProgrammeView=({userField,role,userName})=>{
  const T=useT();const s=sx(T);
  const [courses,setCourses]=useState([]);
  const [loading,setLoading]=useState(true);
  const [progLevel,setProgLevel]=useState("undergraduate");
  const [yearFilter,setYearFilter]=useState(1);
  const [semFilter,setSemFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [expanded,setExpanded]=useState(null);
  const [editNotes,setEditNotes]=useState(null);
  const [notesText,setNotesText]=useState("");
  const [saving,setSaving]=useState(false);
  const [viewMode,setViewMode]=useState("cards");
  const isLec=role==="lecturer"||role==="admin";

  const REFS={
    wab:[
      {title:"IFoA Study Materials",url:"https://www.actuaries.org.uk/studying/study-materials",type:"Official"},
      {title:"Society of Actuaries — Exam P Materials",url:"https://www.soa.org/education/exam-req/edu-exam-p-detail/",type:"Official"},
      {title:"MIT OCW — Financial Mathematics",url:"https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/",type:"University"},
      {title:"Khan Academy — Finance & Capital Markets",url:"https://www.khanacademy.org/economics-finance-domain/core-finance",type:"Free"},
      {title:"IRA Kenya — Insurance Publications",url:"https://www.ira.go.ke/index.php/publications",type:"Regulatory"},
      {title:"CBK — Financial Stability Reports",url:"https://www.centralbank.go.ke/financial-stability-reports/",type:"Regulatory"},
      {title:"CMA Kenya — Capital Markets Research",url:"https://www.cma.or.ke/index.php/research-policy",type:"Regulatory"},
      {title:"ACTEX Free Preview Chapters",url:"https://www.actexmadriver.com",type:"Textbook"},
    ],
    sas:[
      {title:"OpenStax Introductory Statistics (Free)",url:"https://openstax.org/books/introductory-statistics/pages/1-introduction",type:"Free"},
      {title:"Introduction to Statistical Learning (Free PDF)",url:"https://www.statlearning.com",type:"Free"},
      {title:"R for Data Science — Hadley Wickham (Free)",url:"https://r4ds.had.co.nz",type:"Free"},
      {title:"StatLect — Free Probability Lectures",url:"https://www.statlect.com",type:"Free"},
      {title:"Penn State STAT Online Courses",url:"https://online.stat.psu.edu/statprogram/",type:"University"},
      {title:"Coursera — Statistics with R (Audit Free)",url:"https://www.coursera.org/specializations/statistics",type:"MOOC"},
    ],
    sma:[
      {title:"Paul's Online Math Notes (Calculus & ODE)",url:"https://tutorial.math.lamar.edu",type:"Free"},
      {title:"MIT OCW — Mathematics Courses",url:"https://ocw.mit.edu/courses/mathematics/",type:"University"},
      {title:"3Blue1Brown — Essence of Linear Algebra",url:"https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",type:"Video"},
      {title:"Khan Academy — Calculus & Linear Algebra",url:"https://www.khanacademy.org/math",type:"Free"},
      {title:"Brilliant.org — Interactive Maths (Free tier)",url:"https://brilliant.org",type:"Interactive"},
    ],
    scs:[
      {title:"CS50 Harvard — Free Computer Science",url:"https://cs50.harvard.edu/x/",type:"Free"},
      {title:"GeeksForGeeks — DSA & Programming",url:"https://www.geeksforgeeks.org/data-structures/",type:"Free"},
      {title:"Java Programming MOOC.fi (Free)",url:"https://java-programming.mooc.fi",type:"Free"},
      {title:"W3Schools — SQL & Programming",url:"https://www.w3schools.com",type:"Free"},
      {title:"freeCodeCamp — Full Stack Development",url:"https://www.freecodecamp.org",type:"Free"},
    ]
  };

  const getRefs=(code)=>{
    const c=code.toLowerCase();
    if(c.startsWith("wab"))return REFS.wab;
    if(c.startsWith("sas"))return REFS.sas;
    if(c.startsWith("sma"))return REFS.sma;
    return REFS.scs;
  };

  const refColor={Official:T.green,University:T.purple,Free:T.ac,Regulatory:T.red,Textbook:T.amber,MOOC:T.teal,Video:"#FF6B6B",Interactive:T.blue};

  const load=async()=>{
    setLoading(true);
    const {supabase}=await import("./supabase.js");
    const {data}=await supabase.from("programme_courses").select("*").order("year").order("semester").order("code");
    setCourses(data||[]);setLoading(false);
    setYearFilter(1);setSemFilter("all");setExpanded(null);
  };
  useEffect(()=>{load();},[]);

  const saveNotes=async(id)=>{
    setSaving(true);
    const {supabase}=await import("./supabase.js");
    await supabase.from("programme_courses").update({lecturer_notes:notesText,lecturer_name:userName,updated_at:new Date().toISOString()}).eq("id",id);
    setSaving(false);setEditNotes(null);load();
  };

  const fieldCourses=courses.filter(c=>(c.field||"actuarial")===userField);
  const hasOwnCourses=fieldCourses.length>0;
  const filtered=(hasOwnCourses?fieldCourses:[]).filter(c=>{
    if((c.programme_level||"undergraduate")!==progLevel)return false;
    if(c.year!==yearFilter)return false;
    if(semFilter!=="all"&&c.semester!==parseInt(semFilter))return false;
    if(search&&!c.name.toLowerCase().includes(search.toLowerCase())&&!c.code.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });
  const isMasters=progLevel==="masters";
  const maxYear=isMasters?2:4;

  const yearColors={1:T.green,2:T.blue,3:T.purple,4:T.amber};
  const semGroups=["1","2","3"].filter(s=>semFilter==="all"||semFilter===s);
  const semLabel={1:"Semester One",2:"Semester Two",3:"Industrial Attachment"};

  const doExport=()=>{
    exportPDF(
      (isMasters?"MSc":"BSc")+" Actuarial Science — Year "+yearFilter+" Programme",
      (isMasters?"JOOUST SAC Course Codes":"Wangari Agrovet Biopharma WAB Course Codes")+" · AKADIMIA",
      ["Code","Course Name","Sem","Credits","Type","Prerequisites"],
      filtered.map(c=>[c.code,c.name,c.semester===3?"Attachment":c.semester,c.credits,c.type==="C"?"Core":"Elective",c.prerequisites||"None"])
    );
  };

  return(
    <div>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,"+rgba(T.ac,0.12)+","+rgba(T.blue,0.06)+")",borderRadius:16,padding:"1.5rem",marginBottom:"1.5rem",border:"1px solid "+rgba(T.ac,0.2)}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:800,color:T.t1,marginBottom:4,letterSpacing:0.5}}>Programme Structure</h1>
            <div style={{fontSize:13,color:T.ac,fontWeight:600,marginBottom:4}}>{isMasters?"Master of Science in Actuarial Science":"Bachelor of Science in Actuarial Science with IT"}</div>
            <div style={{fontSize:12,color:T.t3}}>{isMasters?"JOOUST · SAC Course Codes · 4 Semesters · Thesis or Project Pathway":"Wangari Agrovet Biopharma (WAB) · 4 Years · 8 Semesters"}</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:4,background:T.bg3,borderRadius:8,padding:4,border:"1px solid "+T.bd}}>
              <button onClick={()=>{setProgLevel("undergraduate");setYearFilter(1);setSemFilter("all");setExpanded(null);}} style={{padding:"6px 14px",borderRadius:6,border:"none",background:progLevel==="undergraduate"?T.ac:"none",color:progLevel==="undergraduate"?"#000":T.t2,fontSize:11,cursor:"pointer",fontWeight:progLevel==="undergraduate"?700:400}}>BSc</button>
              <button onClick={()=>{setProgLevel("masters");setYearFilter(1);setSemFilter("all");setExpanded(null);}} style={{padding:"6px 14px",borderRadius:6,border:"none",background:progLevel==="masters"?T.purple:"none",color:progLevel==="masters"?"#fff":T.t2,fontSize:11,cursor:"pointer",fontWeight:progLevel==="masters"?700:400}}>MSc</button>
            </div>
            <button onClick={doExport} style={{...s.btnS,fontSize:11,padding:"8px 16px"}}>📄 Export PDF</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:10,marginTop:"1rem"}}>
          {[
            [courses.filter(c=>(c.programme_level||"undergraduate")===progLevel).length,"Total Units","📚",T.ac],
            [courses.filter(c=>(c.programme_level||"undergraduate")===progLevel&&c.type==="C").length,"Core","🎯",T.green],
            [courses.filter(c=>(c.programme_level||"undergraduate")===progLevel&&c.type==="E").length,"Elective","✨",T.amber],
            [isMasters?"2":"4","Years","📅",T.blue],
            [isMasters?"4":"8","Semesters","🗓",T.purple],
            [courses.filter(c=>(c.programme_level||"undergraduate")===progLevel&&c.lecturer_notes).length,"Lecturer Notes","📝",T.teal],
          ].map(([v,l,ic,col])=>(
            <div key={l} style={{background:T.bg2,borderRadius:10,padding:"10px 8px",textAlign:"center",border:"1px solid "+T.bd}}>
              <div style={{fontSize:16,marginBottom:2}}>{ic}</div>
              <div style={{fontSize:18,fontWeight:700,color:col,lineHeight:1}}>{v}</div>
              <div style={{fontSize:10,color:T.t3,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Year Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,flex:1,flexWrap:"wrap"}}>
          {Array.from({length:maxYear},(_,i)=>i+1).map(y=>(
            <button key={y} onClick={()=>{setYearFilter(y);setSemFilter("all");setExpanded(null);}} style={{flex:1,minWidth:80,padding:"10px 8px",borderRadius:10,border:"2px solid "+(yearFilter===y?yearColors[y]||T.purple:T.bd),background:yearFilter===y?rgba(yearColors[y]||T.purple,0.15):"none",color:yearFilter===y?yearColors[y]||T.purple:T.t2,fontWeight:yearFilter===y?700:400,cursor:"pointer",fontSize:12,transition:"all 0.2s"}}>
              <div style={{fontSize:16,marginBottom:2}}>{isMasters?["Sem 1-2","Sem 3-4"][y-1]:["1️⃣","2️⃣","3️⃣","4️⃣"][y-1]}</div>
              {isMasters?"Year "+y+" (Sem "+(y*2-1)+"-"+y*2+")":"Year "+y}
              <div style={{fontSize:10,opacity:0.7}}>{courses.filter(c=>c.year===y&&(c.programme_level||"undergraduate")===progLevel).length} units</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:4,background:T.bg2,borderRadius:8,padding:4,border:"1px solid "+T.bd}}>
          {(isMasters?[["all","All"],["1","Sem 1"],["2","Sem 2"]]:
            [["all","All"],["1","Sem 1"],["2","Sem 2"],["3","Attach"]]).map(([v,l])=>(
            <button key={v} onClick={()=>setSemFilter(v)} style={{padding:"5px 12px",borderRadius:6,border:"none",background:semFilter===v?T.ac:"none",color:semFilter===v?"#000":T.t3,fontSize:11,cursor:"pointer",fontWeight:semFilter===v?600:400}}>{l}</button>
          ))}
        </div>
        <input style={{...s.input,flex:1,minWidth:160,fontSize:12}} placeholder="🔍 Search by name or code..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{display:"flex",gap:4,background:T.bg2,borderRadius:8,padding:4,border:"1px solid "+T.bd}}>
          {[["cards","▦"],["list","☰"]].map(([v,ic])=>(
            <button key={v} onClick={()=>setViewMode(v)} style={{padding:"5px 10px",borderRadius:6,border:"none",background:viewMode===v?T.ac:"none",color:viewMode===v?"#000":T.t3,fontSize:13,cursor:"pointer"}}>{ic}</button>
          ))}
        </div>
      </div>

      <div style={{fontSize:12,color:T.t3,marginBottom:"1rem",display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
        <span>{filtered.length} courses</span>
        <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:T.green,display:"inline-block"}}/>Core</span>
        <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:T.amber,display:"inline-block"}}/>Elective</span>
      </div>

      {!hasOwnCourses&&(
        <div style={{...s.card,textAlign:"center",padding:"2.5rem",marginBottom:"1.5rem",border:"1px solid "+rgba(T.amber,0.3),background:rgba(T.amber,0.05)}}>
          <div style={{fontSize:36,marginBottom:12}}>🏗️</div>
          <div style={{fontSize:15,fontWeight:600,color:T.amber,marginBottom:8}}>Programme Coming Soon — {(FIELDS[userField]&&FIELDS[userField].name)||userField}</div>
          <div style={{fontSize:12,color:T.t2,lineHeight:1.7,maxWidth:480,margin:"0 auto"}}>
            The official curriculum for your field has not yet been uploaded. Contact your institution administrator or AKADIMIA support to have your programme structure added. No courses from other fields will be shown here.
          </div>
        </div>
      )}
      {loading?(
        <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
          <div style={{fontSize:32,marginBottom:12}}>📚</div>
          <div style={{color:T.t3}}>Loading programme...</div>
        </div>
      ):(
        <div>
          {semGroups.map(sem=>{
            const sc=filtered.filter(c=>c.semester===parseInt(sem));
            if(sc.length===0)return null;
            return(
              <div key={sem} style={{marginBottom:"2rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1rem"}}>
                  <div style={{height:2,flex:1,background:"linear-gradient(90deg,"+T.ac+",transparent)"}}/>
                  <div style={{fontSize:13,fontWeight:700,color:T.ac,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>{semLabel[sem]||"Semester "+sem}</div>
                  <div style={{height:2,flex:1,background:"linear-gradient(270deg,"+T.ac+",transparent)"}}/>
                </div>

                {viewMode==="cards"?(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                    {sc.map(course=>{
                      const isExp=expanded===course.id;
                      const refs=getRefs(course.code);
                      const prefix=course.code.split(" ")[0].toLowerCase();
                      const prefixColor={wab:T.ac,sas:T.blue,sma:T.purple,scs:T.teal}[prefix]||T.ac;
                      return(
                        <div key={course.id} style={{background:T.bg2,borderRadius:12,border:"1px solid "+(isExp?T.ac:T.bd),overflow:"hidden",transition:"all 0.2s",boxShadow:isExp?"0 4px 20px "+rgba(T.ac,0.15):"none"}}>
                          <div onClick={()=>setExpanded(isExp?null:course.id)} style={{padding:"14px 16px",cursor:"pointer",borderLeft:"4px solid "+(course.type==="C"?T.green:T.amber)}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                <span style={{background:rgba(prefixColor,0.15),color:prefixColor,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{course.code}</span>
                                <span style={{background:course.type==="C"?rgba(T.green,0.12):rgba(T.amber,0.12),color:course.type==="C"?T.green:T.amber,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600}}>{course.type==="C"?"CORE":"ELEC"}</span>
                                {course.lecturer_notes&&<span style={{background:rgba(T.purple,0.12),color:T.purple,borderRadius:6,padding:"2px 6px",fontSize:10}}>📝</span>}
                              </div>
                              <span style={{color:T.t3,fontSize:12}}>{isExp?"▲":"▼"}</span>
                            </div>
                            <div style={{fontSize:13,fontWeight:600,color:T.t1,lineHeight:1.4,marginBottom:4}}>{course.name}</div>
                            <div style={{fontSize:11,color:T.t3}}>{course.credits} Credits {course.prerequisites?"· Pre-req: "+course.prerequisites:""}</div>
                          </div>
                          {isExp&&(
                            <div style={{borderTop:"1px solid "+T.bd,padding:"14px 16px",background:rgba(T.ac,0.02)}} onClick={e=>e.stopPropagation()}>
                              {course.description&&<div style={{fontSize:12,color:T.t2,lineHeight:1.8,marginBottom:"1rem"}}>{course.description}</div>}
                              {course.lecturer_notes&&(
                                <div style={{marginBottom:"1rem",padding:"12px",background:rgba(T.purple,0.08),border:"1px solid "+rgba(T.purple,0.2),borderRadius:8}}>
                                  <div style={{fontSize:11,fontWeight:600,color:T.purple,marginBottom:6}}>📝 Lecturer Notes{course.lecturer_name?" — "+course.lecturer_name:""}</div>
                                  <div style={{fontSize:12,color:T.t1,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{course.lecturer_notes}</div>
                                </div>
                              )}
                              {isLec&&(
                                <div style={{marginBottom:"1rem"}}>
                                  {editNotes===course.id?(
                                    <div>
                                      <label style={s.lbl}>NOTES / INSTRUCTIONS / OFFICE HOURS</label>
                                      <textarea style={{...s.input,height:100,resize:"vertical",fontSize:12,marginBottom:8}} placeholder="Add lecture notes, reading guides, assessment tips, office hours, email..." value={notesText} onChange={e=>setNotesText(e.target.value)}/>
                                      <div style={{display:"flex",gap:8}}>
                                        <button onClick={()=>saveNotes(course.id)} style={{...s.btnP,fontSize:11}} disabled={saving}>{saving?"Saving...":"Save"}</button>
                                        <button onClick={()=>setEditNotes(null)} style={{...s.btnS,fontSize:11}}>Cancel</button>
                                      </div>
                                    </div>
                                  ):(
                                    <button onClick={()=>{setEditNotes(course.id);setNotesText(course.lecturer_notes||"");}} style={{...s.btnS,fontSize:11,width:"100%"}}>
                                      {course.lecturer_notes?"✏️ Edit Notes":"📝 Add Lecturer Notes"}
                                    </button>
                                  )}
                                </div>
                              )}
                              <div style={{fontSize:11,fontWeight:600,color:T.t3,letterSpacing:0.5,marginBottom:8}}>FREE REFERENCES & RESOURCES</div>
                              <div style={{display:"grid",gap:5}}>
                                {refs.map((ref,i)=>(
                                  <a key={i} href={ref.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:T.bg3,borderRadius:7,textDecoration:"none",border:"1px solid "+T.bd,transition:"all 0.2s"}}>
                                    <span style={{background:rgba(refColor[ref.type]||T.ac,0.15),color:refColor[ref.type]||T.ac,borderRadius:4,padding:"1px 7px",fontSize:9,fontWeight:700,flexShrink:0}}>{ref.type.toUpperCase()}</span>
                                    <span style={{fontSize:11,color:T.t1,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ref.title}</span>
                                    <span style={{fontSize:11,color:T.ac,flexShrink:0}}>↗</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ):(
                  <div style={{background:T.bg2,borderRadius:12,border:"1px solid "+T.bd,overflow:"hidden"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{background:T.bg3}}>
                          {["Code","Course Name","Credits","Type","Pre-requisites","Notes"].map(h=>(
                            <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:T.t3,letterSpacing:0.5,borderBottom:"1px solid "+T.bd}}>{h.toUpperCase()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sc.map((course,i)=>(
                          <tr key={course.id} style={{borderBottom:"1px solid "+T.bd,background:i%2===0?T.bg2:rgba(T.ac,0.02),cursor:"pointer"}} onClick={()=>setExpanded(expanded===course.id?null:course.id)}>
                            <td style={{padding:"10px 12px"}}><span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:T.ac}}>{course.code}</span></td>
                            <td style={{padding:"10px 12px",fontSize:12,color:T.t1,fontWeight:500}}>{course.name}</td>
                            <td style={{padding:"10px 12px",fontSize:12,color:T.t3,textAlign:"center"}}>{course.credits}</td>
                            <td style={{padding:"10px 12px"}}><span style={{background:course.type==="C"?rgba(T.green,0.15):rgba(T.amber,0.15),color:course.type==="C"?T.green:T.amber,borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:600}}>{course.type==="C"?"Core":"Elective"}</span></td>
                            <td style={{padding:"10px 12px",fontSize:11,color:T.t3}}>{course.prerequisites||"—"}</td>
                            <td style={{padding:"10px 12px",fontSize:11,color:T.purple}}>{course.lecturer_notes?"📝 Yes":"—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ToolsView=({userField,userName})=>{
  const T=useT();const s=sx(T);const fld=FIELDS[userField];
  const [sel,setSel]=useState("calculator");
  const [calcInput,setCalcInput]=useState("");
  const [calcResult,setCalcResult]=useState("");
  const [pvRate,setPvRate]=useState("8");
  const [pvN,setPvN]=useState("10");
  const [pvPmt,setPvPmt]=useState("100000");
  const [pvResult,setPvResult]=useState(null);
  const [unitInput,setUnitInput]=useState("");
  const [unitFrom,setUnitFrom]=useState("KES");
  const [unitTo,setUnitTo]=useState("USD");
  const [unitResult,setUnitResult]=useState(null);
  const [fxRates,setFxRates]=useState({USD:129.5,EUR:140.2,GBP:164.8,UGX:0.034,TZS:0.051,ETB:2.31,ZAR:7.1});
  const [aiTool,setAiTool]=useState("");
  const [aiPrompt,setAiPrompt]=useState("");
  const [aiResult,setAiResult]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [gpaUnits,setGpaUnits]=useState([{name:"",credits:"3",grade:"A"}]);
  const [gpaResult,setGpaResult]=useState(null);
  const [mortRate,setMortRate]=useState("9");
  const [mortAmount,setMortAmount]=useState("5000000");
  const [mortYears,setMortYears]=useState("20");
  const [mortResult,setMortResult]=useState(null);
  const [loanRate,setLoanRate]=useState("14");
  const [penSalary,setPenSalary]=useState("150000");
  const [penYears,setPenYears]=useState("30");
  const [penRate,setPenRate]=useState("12");
  const [penContrib,setPenContrib]=useState("10");
  const [penEmployer,setPenEmployer]=useState("5");
  const [penSalaryGrowth,setPenSalaryGrowth]=useState("5");
  const [penResult,setPenResult]=useState(null);
  const [nssf,setNssf]=useState({salary:"150000",tier:"2"});
  const [nssfResult,setNssfResult]=useState(null);
  const [dbSalary,setDbSalary]=useState("150000");
  const [dbYears,setDbYears]=useState("30");
  const [dbFactor,setDbFactor]=useState("1.67");
  const [dbResult,setDbResult]=useState(null);
  // Life insurance states
  const [lifeAge,setLifeAge]=useState("35");
  const [lifeSum,setLifeSum]=useState("5000000");
  const [lifeTerm,setLifeTerm]=useState("20");
  const [lifeSmoker,setLifeSmoker]=useState("no");
  const [lifeResult,setLifeResult]=useState(null);
  // VaR states
  const [varPortfolio,setVarPortfolio]=useState("1000000");
  const [varReturn,setVarReturn]=useState("12");
  const [varVolatility,setVarVolatility]=useState("15");
  const [varConfidence,setVarConfidence]=useState("95");
  const [varResult,setVarResult]=useState(null);
  // Bond states
  const [bondFace,setBondFace]=useState("100000");
  const [bondCoupon,setBondCoupon]=useState("12");
  const [bondYield,setBondYield]=useState("10");
  const [bondYears,setBondYears]=useState("5");
  const [bondFreq,setBondFreq]=useState("2");
  const [bondResult,setBondResult]=useState(null);
  const [loanAmount,setLoanAmount]=useState("500000");
  const [loanYears,setLoanYears]=useState("3");
  const [loanResult,setLoanResult]=useState(null);

  const gradePoints={"A+":4.0,"A":4.0,"A-":3.7,"B+":3.3,"B":3.0,"B-":2.7,"C+":2.3,"C":2.0,"C-":1.7,"D+":1.3,"D":1.0,"F":0.0};

  const calcGPA=()=>{
    const valid=gpaUnits.filter(u=>u.name&&u.credits&&u.grade);
    if(valid.length===0)return;
    const totalCredits=valid.reduce((a,u)=>a+parseFloat(u.credits||0),0);
    const totalPoints=valid.reduce((a,u)=>a+(gradePoints[u.grade]||0)*parseFloat(u.credits||0),0);
    const gpa=totalCredits>0?(totalPoints/totalCredits).toFixed(2):0;
    const cls=gpa>=3.7?"First Class Honours":gpa>=3.3?"Upper Second Class":gpa>=3.0?"Second Class":gpa>=2.0?"Pass":"Fail";
    setGpaResult({gpa,cls,totalCredits,totalPoints:totalPoints.toFixed(1)});
  };

  const calcPV=()=>{
    const r=parseFloat(pvRate)/100;
    const n=parseFloat(pvN);
    const pmt=parseFloat(pvPmt);
    if(isNaN(r)||isNaN(n)||isNaN(pmt))return;
    const pv=pmt*((1-Math.pow(1+r,-n))/r);
    const fv=pmt*((Math.pow(1+r,n)-1)/r);
    const totalPaid=pmt*n;
    setPvResult({pv:pv.toFixed(2),fv:fv.toFixed(2),totalPaid:totalPaid.toFixed(2)});
  };

  const calcMortgage=()=>{
    const r=parseFloat(mortRate)/100/12;
    const n=parseFloat(mortYears)*12;
    const p=parseFloat(mortAmount);
    if(isNaN(r)||isNaN(n)||isNaN(p))return;
    const monthly=p*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
    const total=monthly*n;
    setMortResult({monthly:monthly.toFixed(0),total:total.toFixed(0),interest:(total-p).toFixed(0)});
  };

  const calcLoan=()=>{
    const r=parseFloat(loanRate)/100/12;
    const n=parseFloat(loanYears)*12;
    const p=parseFloat(loanAmount);
    if(isNaN(r)||isNaN(n)||isNaN(p))return;
    const monthly=p*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
    const total=monthly*n;
    setLoanResult({monthly:monthly.toFixed(0),total:total.toFixed(0),interest:(total-p).toFixed(0)});
  };

  const convertCurrency=()=>{
    const amt=parseFloat(unitInput);
    if(isNaN(amt))return;
    // fxRates stores: how many KES = 1 unit of foreign currency
    if(unitFrom==="KES"&&unitTo==="KES"){
      setUnitResult(amt.toFixed(2)+" KES");
    }else if(unitFrom==="KES"&&fxRates[unitTo]){
      // KES to foreign: divide by rate
      setUnitResult((amt/fxRates[unitTo]).toFixed(4)+" "+unitTo);
    }else if(unitTo==="KES"&&fxRates[unitFrom]){
      // foreign to KES: multiply by rate
      setUnitResult((amt*fxRates[unitFrom]).toFixed(2)+" KES");
    }else if(fxRates[unitFrom]&&fxRates[unitTo]){
      // foreign to foreign: via KES
      const inKES=amt*fxRates[unitFrom];
      setUnitResult((inKES/fxRates[unitTo]).toFixed(4)+" "+unitTo);
    }
  };

  const askAI=async()=>{
    if(!aiPrompt.trim())return;
    setAiLoading(true);setAiResult("");
    try{
      const aiText=await callAI("You are an expert in "+((fld&&fld.name)||"Actuarial Science")+". "+aiPrompt, 800);
      setAiResult(aiText);
    }catch(e){setAiResult("Error: "+e.message);}
    setAiLoading(false);
  };

  const fmt=(n)=>Number(n).toLocaleString("en-KE");

  const calcLifeInsurance=()=>{
    const age=parseInt(lifeAge);
    const sum=parseFloat(lifeSum);
    const term=parseInt(lifeTerm);
    // Simplified mortality-based premium using Kenya life tables approximation
    // Base mortality rate increases with age
    const baseMortality=0.001*Math.exp(0.07*(age-20));
    const smokerMult=lifeSmoker==="yes"?2.0:1.0;
    const adjMortality=baseMortality*smokerMult;
    // Net annual premium (simplified)
    const r=0.08;
    let apv=0;
    for(let t=1;t<=term;t++){
      const survProb=Math.exp(-adjMortality*t);
      apv+=survProb*adjMortality*Math.pow(1+r,-t);
    }
    const annuity=(1-Math.pow(1+r,-term))/r;
    const annualPremium=(sum*apv)/annuity;
    const monthlyPremium=annualPremium/12;
    const totalPremium=annualPremium*term;
    setLifeResult({
      annual:annualPremium.toFixed(0),
      monthly:monthlyPremium.toFixed(0),
      total:totalPremium.toFixed(0),
      coverRatio:(sum/totalPremium).toFixed(1),
      mortality:(adjMortality*1000).toFixed(2)
    });
  };

  const calcVaR=()=>{
    const p=parseFloat(varPortfolio);
    const mu=parseFloat(varReturn)/100;
    const sigma=parseFloat(varVolatility)/100;
    const conf=parseFloat(varConfidence)/100;
    // Z-scores for common confidence levels
    const zScores={0.90:1.282,0.95:1.645,0.99:2.326,0.999:3.090};
    const z=zScores[conf]||1.645;
    // Daily VaR (assuming 252 trading days)
    const dailySigma=sigma/Math.sqrt(252);
    const dailyMu=mu/252;
    const varDaily=p*(z*dailySigma-dailyMu);
    const varMonthly=p*(z*sigma/Math.sqrt(12)-mu/12);
    const varAnnual=p*(z*sigma-mu);
    const cvarDaily=p*(dailySigma*Math.exp(-z*z/2)/(1-conf)/Math.sqrt(2*Math.PI));
    setVarResult({
      daily:varDaily.toFixed(0),
      monthly:varMonthly.toFixed(0),
      annual:varAnnual.toFixed(0),
      cvar:cvarDaily.toFixed(0),
      sharpe:((mu-0.08)/sigma).toFixed(3)
    });
  };

  const calcBond=()=>{
    const face=parseFloat(bondFace);
    const c=parseFloat(bondCoupon)/100;
    const y=parseFloat(bondYield)/100;
    const n=parseFloat(bondYears);
    const freq=parseFloat(bondFreq);
    const couponPayment=face*c/freq;
    const periodsPerYear=freq;
    const totalPeriods=n*periodsPerYear;
    const periodYield=y/periodsPerYear;
    // Price = PV of coupons + PV of face
    let price=0;
    for(let t=1;t<=totalPeriods;t++){
      price+=couponPayment/Math.pow(1+periodYield,t);
    }
    price+=face/Math.pow(1+periodYield,totalPeriods);
    // Duration (Macaulay)
    let duration=0;
    for(let t=1;t<=totalPeriods;t++){
      duration+=(t/freq)*(couponPayment/Math.pow(1+periodYield,t))/price;
    }
    duration+=(n)*(face/Math.pow(1+periodYield,totalPeriods))/price;
    const modDuration=duration/(1+periodYield);
    const convexity=price*Math.pow(1+periodYield,-2)*(totalPeriods*(totalPeriods+1)*face/Math.pow(1+periodYield,totalPeriods)+couponPayment*2/Math.pow(periodYield,3)*(totalPeriods*periodYield-(1+periodYield)*(1-Math.pow(1+periodYield,-totalPeriods))))/price;
    setBondResult({
      price:price.toFixed(2),
      pricePercentage:(price/face*100).toFixed(2),
      duration:duration.toFixed(4),
      modDuration:modDuration.toFixed(4),
      premium:price>face?"Premium":"Discount",
      totalCoupon:(couponPayment*totalPeriods).toFixed(0)
    });
  };

  const calcPension=()=>{
    const sal=parseFloat(penSalary);
    const yrs=parseFloat(penYears);
    const r=parseFloat(penRate)/100/12;
    const g=parseFloat(penSalaryGrowth)/100/12;
    const n=yrs*12;
    // Project salary to retirement with annual growth
    const finalSalary=sal*Math.pow(1+parseFloat(penSalaryGrowth)/100,yrs);
    // Use growing annuity formula for FV when salary grows
    let fv=0;
    for(let i=1;i<=n;i++){
      const salAtTime=sal*Math.pow(1+g,i-1);
      const contrib=salAtTime*(parseFloat(penContrib)+parseFloat(penEmployer))/100;
      fv+=contrib*Math.pow(1+r,n-i);
    }
    // Monthly pension as 20-year annuity at retirement
    const monthlyPension=fv*(r)/(1-Math.pow(1+r,-240));
    const totalContrib=sal*(parseFloat(penContrib)+parseFloat(penEmployer))/100*n;
    const replacementRate=(monthlyPension/finalSalary)*100;
    setPenResult({
      fv:fv.toFixed(0),
      monthlyPension:monthlyPension.toFixed(0),
      finalSalary:finalSalary.toFixed(0),
      totalContrib:totalContrib.toFixed(0),
      empMonthly:(sal*parseFloat(penContrib)/100).toFixed(0),
      emplMonthly:(sal*parseFloat(penEmployer)/100).toFixed(0),
      replacementRate:replacementRate.toFixed(1)
    });
  };

  const calcNSSF=()=>{
    const sal=parseFloat(nssf.salary);
    // NSSF Act 2013 Kenya - Tier I and Tier II
    const tier1Upper=7000;
    const tier1Rate=0.06;
    const tier2Rate=0.06;
    const tier1Employee=Math.min(sal,tier1Upper)*tier1Rate;
    const tier1Employer=Math.min(sal,tier1Upper)*tier1Rate;
    let tier2Employee=0,tier2Employer=0;
    if(nssf.tier==="2"&&sal>tier1Upper){
      tier2Employee=(sal-tier1Upper)*tier2Rate;
      tier2Employer=(sal-tier1Upper)*tier2Rate;
    }
    const totalEmployee=tier1Employee+tier2Employee;
    const totalEmployer=tier1Employer+tier2Employer;
    setNssfResult({
      tier1Employee:tier1Employee.toFixed(0),
      tier1Employer:tier1Employer.toFixed(0),
      tier2Employee:tier2Employee.toFixed(0),
      tier2Employer:tier2Employer.toFixed(0),
      totalEmployee:totalEmployee.toFixed(0),
      totalEmployer:totalEmployer.toFixed(0),
      total:(totalEmployee+totalEmployer).toFixed(0)
    });
  };

  const calcDB=()=>{
    const sal=parseFloat(dbSalary);
    const yrs=parseFloat(dbYears);
    const factor=parseFloat(dbFactor)/100;
    const annualPension=factor*yrs*sal;
    const monthlyPension=annualPension/12;
    const lumpsum=annualPension*3;
    setDbResult({
      annual:annualPension.toFixed(0),
      monthly:monthlyPension.toFixed(0),
      lumpsum:lumpsum.toFixed(0),
      replacementRate:((monthlyPension/sal)*100).toFixed(1)
    });
  };

  const tools=[
    {id:"platforms",icon:"🌐",label:"Field Platforms",featured:true},
    {id:"calculator",icon:"🧮",label:"Scientific Calc"},
    {id:"gpa",icon:"🎓",label:"GPA Calculator"},
    {id:"annuity",icon:"📈",label:"Annuity & PV"},
    {id:"mortgage",icon:"🏠",label:"Mortgage Calc"},
    {id:"loan",icon:"💳",label:"Loan Calculator"},
    {id:"currency",icon:"💱",label:"Currency Converter"},
    {id:"pension",icon:"🏦",label:"Pension Calculator"},
    {id:"life",icon:"❤️",label:"Life Insurance"},
    {id:"risk",icon:"⚠️",label:"Risk & VaR"},
    {id:"bond",icon:"📑",label:"Bond Pricing"},
    {id:"ai",icon:"🤖",label:"AI Formula Helper"},
  ];

  return(
    <div>
      <h1 style={s.h1}>Tools Hub</h1>
      <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{fld&&fld.icon} {fld&&fld.name}</span>Live interactive tools for actuarial and financial computation</p>

      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1.5rem"}}>
        <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%"}}>
          {/* Featured platforms button */}
          <button onClick={()=>setSel("platforms")} style={{
            width:"100%",padding:"14px 20px",borderRadius:12,cursor:"pointer",
            display:"flex",alignItems:"center",gap:12,
            background:sel==="platforms"
              ?"linear-gradient(135deg,#D4A017,#F59E0B)"
              :"linear-gradient(135deg,"+rgba("#D4A017",0.15)+","+rgba("#F59E0B",0.1)+")",
            border:"2px solid "+(sel==="platforms"?"#D4A017":rgba("#D4A017",0.4)),
            boxShadow:sel==="platforms"?"0 4px 16px "+rgba("#D4A017",0.4):"none",
            transition:"all 0.2s"
          }}>
            <span style={{fontSize:28}}>🌐</span>
            <div style={{textAlign:"left",flex:1}}>
              <div style={{fontSize:14,fontWeight:800,color:sel==="platforms"?"#000":"#D4A017",letterSpacing:0.5}}>Field Platforms & Tools</div>
              <div style={{fontSize:11,color:sel==="platforms"?"#000":T.t3,marginTop:1}}>Open your field-specific professional tools</div>
            </div>
            <span style={{fontSize:20,color:sel==="platforms"?"#000":"#D4A017"}}>→</span>
          </button>
          {/* Other tools */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {tools.filter(t=>t.id!=="platforms").map(t=>(
              <button key={t.id} onClick={()=>setSel(t.id)} style={{
                ...(sel===t.id?s.btnP:s.btnS),
                fontSize:11,padding:"7px 14px",
                display:"flex",alignItems:"center",gap:5
              }}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sel==="calculator"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>🧮 Scientific Calculator</div>
          <div style={{background:T.bg0,borderRadius:10,padding:"1rem",marginBottom:"1rem",border:"1px solid "+T.bd}}>
            <input style={{...s.input,fontSize:20,fontFamily:"monospace",textAlign:"right",marginBottom:8}} value={calcInput} onChange={e=>setCalcInput(e.target.value)} placeholder="Enter expression e.g. Math.sqrt(25) * 1.08^10"/>
            <div style={{background:T.bg3,borderRadius:8,padding:"10px 16px",fontSize:22,fontFamily:"monospace",color:T.ac,textAlign:"right",minHeight:44}}>{calcResult||"0"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:8}}>
            {["7","8","9","÷","√","4","5","6","×","x²","1","2","3","-","1/x","0",".","=","+","C","(",")","%","^","ln"].map(btn=>(
              <button key={btn} onClick={()=>{
                if(btn==="C"){setCalcInput("");setCalcResult("");}
                else if(btn==="="){
                  try{
                    let expr=calcInput
                      .replace(/÷/g,"/").replace(/×/g,"*")
                      .replace(/√\(/g,"Math.sqrt(")
                      .replace(/x²/g,"**2").replace(/\^/g,"**")
                      .replace(/ln\(/g,"Math.log(")
                      .replace(/π/g,"Math.PI");
                    const result=new Function("return "+expr)();
                    setCalcResult(Number.isFinite(result)?String(Math.round(result*1e10)/1e10):"Error");
                  }catch{setCalcResult("Error");}
                }else{
                  setCalcInput(p=>p+(btn==="√"?"Math.sqrt(":btn==="ln"?"Math.log(":btn));
                }
              }} style={{padding:"10px 0",borderRadius:8,border:"1px solid "+T.bd,background:["=","C"].includes(btn)?T.ac:["÷","×","-","+","^"].includes(btn)?rgba(T.ac,0.15):T.bg3,color:btn==="="||btn==="C"?"#000":T.t1,cursor:"pointer",fontSize:13,fontWeight:["=","C"].includes(btn)?700:400}}>
                {btn}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:T.t3}}>Tip: Use Math.pow(1.08,10) for compound interest, Math.sqrt() for standard deviation</div>
        </div>
      )}

      {sel==="gpa"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>🎓 GPA / Degree Classification Calculator</div>
          <div style={{display:"grid",gap:8,marginBottom:"1rem"}}>
            {gpaUnits.map((u,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px 100px 36px",gap:8,alignItems:"center"}}>
                <input style={{...s.input,fontSize:12}} placeholder="Unit name e.g. WAB 201" value={u.name} onChange={e=>{const a=[...gpaUnits];a[i]={...a[i],name:e.target.value};setGpaUnits(a);}}/>
                <input style={{...s.input,fontSize:12,textAlign:"center"}} placeholder="Credits" type="number" value={u.credits} onChange={e=>{const a=[...gpaUnits];a[i]={...a[i],credits:e.target.value};setGpaUnits(a);}}/>
                <select style={{...s.input,fontSize:12}} value={u.grade} onChange={e=>{const a=[...gpaUnits];a[i]={...a[i],grade:e.target.value};setGpaUnits(a);}}>
                  {Object.keys(gradePoints).map(g=><option key={g}>{g}</option>)}
                </select>
                <button onClick={()=>setGpaUnits(gpaUnits.filter((_,j)=>j!==i))} style={{background:"none",border:"1px solid "+T.red+"44",borderRadius:6,color:T.red,cursor:"pointer",fontSize:12,padding:"6px"}}>✕</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:"1rem"}}>
            <button onClick={()=>setGpaUnits([...gpaUnits,{name:"",credits:"3",grade:"A"}])} style={{...s.btnS,fontSize:12}}>+ Add Unit</button>
            <button onClick={calcGPA} style={{...s.btnP,fontSize:12}}>Calculate GPA</button>
          </div>
          {gpaResult&&(
            <div style={{background:rgba(T.green,0.08),border:"1px solid "+rgba(T.green,0.25),borderRadius:10,padding:"1rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                {[["GPA",gpaResult.gpa,T.ac],["Classification",gpaResult.cls,T.green],["Total Credits",gpaResult.totalCredits,T.blue],["Quality Points",gpaResult.totalPoints,T.purple]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
                    <div style={{fontSize:11,color:T.t3}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {sel==="annuity"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>📈 Annuity & Present Value Calculator</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:"1rem"}}>
            <div><label style={s.lbl}>ANNUAL INTEREST RATE (%)</label><input style={s.input} type="number" value={pvRate} onChange={e=>setPvRate(e.target.value)}/></div>
            <div><label style={s.lbl}>NUMBER OF PERIODS (n)</label><input style={s.input} type="number" value={pvN} onChange={e=>setPvN(e.target.value)}/></div>
            <div><label style={s.lbl}>PAYMENT PER PERIOD (KES)</label><input style={s.input} type="number" value={pvPmt} onChange={e=>setPvPmt(e.target.value)}/></div>
          </div>
          <button onClick={calcPV} style={{...s.btnP,marginBottom:"1rem"}}>Calculate</button>
          {pvResult&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {[["Present Value (PV)","KES "+fmt(pvResult.pv),T.ac],["Future Value (FV)","KES "+fmt(pvResult.fv),T.green],["Total Payments","KES "+fmt(pvResult.totalPaid),T.amber]].map(([l,v,c])=>(
                <div key={l} style={{background:rgba(c,0.1),border:"1px solid "+rgba(c,0.25),borderRadius:8,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:11,color:T.t3}}>{l}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{fontSize:11,color:T.t3,marginTop:"1rem"}}>Formula: PV = PMT × [1 - (1+r)^-n] / r</div>
        </div>
      )}

      {sel==="mortgage"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>🏠 Mortgage Calculator (Kenya)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:"1rem"}}>
            <div><label style={s.lbl}>LOAN AMOUNT (KES)</label><input style={s.input} type="number" value={mortAmount} onChange={e=>setMortAmount(e.target.value)}/></div>
            <div><label style={s.lbl}>ANNUAL RATE (%)</label><input style={s.input} type="number" value={mortRate} onChange={e=>setMortRate(e.target.value)}/></div>
            <div><label style={s.lbl}>TERM (YEARS)</label><input style={s.input} type="number" value={mortYears} onChange={e=>setMortYears(e.target.value)}/></div>
          </div>
          <button onClick={calcMortgage} style={{...s.btnP,marginBottom:"1rem"}}>Calculate</button>
          {mortResult&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {[["Monthly Payment","KES "+fmt(mortResult.monthly),T.ac],["Total Paid","KES "+fmt(mortResult.total),T.amber],["Total Interest","KES "+fmt(mortResult.interest),T.red]].map(([l,v,c])=>(
                <div key={l} style={{background:rgba(c,0.1),border:"1px solid "+rgba(c,0.25),borderRadius:8,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:11,color:T.t3}}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sel==="loan"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>💳 Loan Repayment Calculator</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:"1rem"}}>
            <div><label style={s.lbl}>LOAN AMOUNT (KES)</label><input style={s.input} type="number" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)}/></div>
            <div><label style={s.lbl}>ANNUAL RATE (%)</label><input style={s.input} type="number" value={loanRate} onChange={e=>setLoanRate(e.target.value)}/></div>
            <div><label style={s.lbl}>TERM (YEARS)</label><input style={s.input} type="number" value={loanYears} onChange={e=>setLoanYears(e.target.value)}/></div>
          </div>
          <button onClick={calcLoan} style={{...s.btnP,marginBottom:"1rem"}}>Calculate</button>
          {loanResult&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {[["Monthly Repayment","KES "+fmt(loanResult.monthly),T.ac],["Total Repayment","KES "+fmt(loanResult.total),T.amber],["Total Interest","KES "+fmt(loanResult.interest),T.red]].map(([l,v,c])=>(
                <div key={l} style={{background:rgba(c,0.1),border:"1px solid "+rgba(c,0.25),borderRadius:8,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:11,color:T.t3}}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sel==="currency"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>💱 Currency Converter (KES Base)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 120px 120px",gap:12,marginBottom:"1rem",alignItems:"end"}}>
            <div><label style={s.lbl}>AMOUNT</label><input style={s.input} type="number" value={unitInput} onChange={e=>setUnitInput(e.target.value)} placeholder="Enter amount"/></div>
            <div><label style={s.lbl}>FROM</label>
              <select style={s.input} value={unitFrom} onChange={e=>setUnitFrom(e.target.value)}>
                {["KES","USD","EUR","GBP","UGX","TZS","ETB","ZAR"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={s.lbl}>TO</label>
              <select style={s.input} value={unitTo} onChange={e=>setUnitTo(e.target.value)}>
                {["KES","USD","EUR","GBP","UGX","TZS","ETB","ZAR"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button onClick={convertCurrency} style={{...s.btnP,marginBottom:"1rem"}}>Convert</button>
          {unitResult&&<div style={{background:rgba(T.ac,0.1),border:"1px solid "+rgba(T.ac,0.3),borderRadius:10,padding:"1rem",fontSize:24,fontWeight:700,color:T.ac,textAlign:"center"}}>{unitInput} {unitFrom} = {unitResult}</div>}
          <div style={{marginTop:"1rem",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
            {Object.entries(fxRates).map(([cur,rate])=>(
              <div key={cur} style={{background:T.bg3,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:11,color:T.t3}}>1 {cur} =</div>
                <div style={{fontSize:13,fontWeight:600,color:T.ac}}>KES {rate.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:10,color:T.t3,marginTop:8}}>Indicative rates. Verify at cbk.go.ke or your bank for official CBK rates.</div>
        </div>
      )}

      {["law","medicine","nursing","education","theology","history","artdesign","music","socialwork","communication"].includes(userField)&&(
        <div style={{...s.card,background:"linear-gradient(135deg,"+rgba(T.ac,0.08)+","+rgba(T.purple,0.05)+")",border:"1px solid "+rgba(T.ac,0.2),marginBottom:"1rem"}}>
          <div style={{fontSize:13,fontWeight:600,color:T.ac,marginBottom:6}}>💡 Tools available for {(fld&&fld.name)||userField}</div>
          <div style={{fontSize:12,color:T.t2,lineHeight:1.7}}>
            The calculators (GPA, annuity, mortgage, loan, currency) are useful for all students. The actuarial tools (pension, VaR, bond pricing, life insurance) are primarily designed for finance and actuarial students but are available for cross-disciplinary learning. The Field Platforms section shows your field-specific professional tools.
          </div>
        </div>
      )}

      {["law","medicine","nursing","education","theology","history","artdesign","music","socialwork","communication"].includes(userField)&&(
        <div style={{...s.card,background:"linear-gradient(135deg,"+rgba(T.ac,0.08)+","+rgba(T.purple,0.05)+")",border:"1px solid "+rgba(T.ac,0.2),marginBottom:"1rem"}}>
          <div style={{fontSize:13,fontWeight:600,color:T.ac,marginBottom:6}}>💡 Tools available for {(fld&&fld.name)||userField}</div>
          <div style={{fontSize:12,color:T.t2,lineHeight:1.7}}>
            The calculators (GPA, annuity, mortgage, loan, currency) are useful for all students. The actuarial tools (pension, VaR, bond pricing, life insurance) are primarily designed for finance and actuarial students but are available for cross-disciplinary learning. The Field Platforms section shows your field-specific professional tools.
          </div>
        </div>
      )}

      {sel==="platforms"&&(
        <div>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>🔗 Field Tools & Platforms</div>
          <div style={{fontSize:12,color:T.t2,marginBottom:"1.25rem"}}>Recommended tools and platforms for <strong>{(fld&&fld.name)||userField}</strong> students. All links open the official platform. Tools shown are specific to your field.</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
            {[
              ...(fld&&fld.tools||["Python","R","SPSS","Excel","LaTeX"]).map(tool=>{
                const TOOL_INFO={
                  "Python":{icon:"🐍",desc:"General purpose programming, data analysis, machine learning",url:"https://colab.research.google.com",site:"Google Colab (Free)",color:"#3776AB"},
                  "R":{icon:"📊",desc:"Statistical computing, data visualisation and modelling",url:"https://rstudio.cloud",site:"Posit Cloud (Free)",color:"#276DC3"},
                  "STATA":{icon:"📉",desc:"Statistical analysis and econometrics",url:"https://www.stata.com/learning-resources/",site:"Stata Learning Resources",color:"#1A5276"},
                  "SPSS":{icon:"🔢",desc:"Statistical analysis, surveys and social science research",url:"https://www.ibm.com/academic/topic/data-science",site:"IBM SPSS (Academic)",color:"#052FAD"},
                  "LaTeX":{icon:"📝",desc:"Scientific document preparation and mathematical typesetting",url:"https://www.overleaf.com",site:"Overleaf (Free)",color:"#4CAF50"},
                  "Excel":{icon:"📗",desc:"Spreadsheet analysis, financial modelling and data management",url:"https://office.com",site:"Microsoft 365 Online",color:"#217346"},
                  "SAS":{icon:"📈",desc:"Advanced analytics, business intelligence and data management",url:"https://welcome.oda.sas.com",site:"SAS OnDemand (Free)",color:"#0076CE"},
                  "NVivo":{icon:"🔍",desc:"Qualitative data analysis and research",url:"https://lumivero.com/products/nvivo/",site:"NVivo by Lumivero",color:"#8B4513"},
                  "Zotero":{icon:"📚",desc:"Reference management and citation tool",url:"https://www.zotero.org",site:"Zotero (Free)",color:"#CC2936"},
                  "LexisNexis":{icon:"⚖️",desc:"Legal research database and case law",url:"https://www.lexisnexis.com",site:"LexisNexis",color:"#CC0000"},
                  "Westlaw":{icon:"📜",desc:"Legal research and case law database",url:"https://legal.thomsonreuters.com/en/products/westlaw",site:"Westlaw",color:"#003366"},
                  "GIS":{icon:"🗺️",desc:"Geographic information systems and spatial analysis",url:"https://www.arcgis.com",site:"ArcGIS Online (Free)",color:"#2E7D32"},
                  "AutoCAD":{icon:"📐",desc:"Computer-aided design and drafting",url:"https://www.autodesk.com/education/",site:"AutoCAD (Student Free)",color:"#E53935"},
                  "MATLAB":{icon:"🔬",desc:"Numerical computing and simulation",url:"https://matlab.mathworks.com",site:"MATLAB Online",color:"#E87722"},
                  "Python (ML)":{icon:"🤖",desc:"Machine learning and deep learning with Python",url:"https://colab.research.google.com",site:"Google Colab (Free)",color:"#3776AB"},
                };
                const info=TOOL_INFO[tool]||{icon:"🔧",desc:"Professional tool for "+((fld&&fld.name)||userField),url:"https://www.google.com/search?q="+tool+" tutorial",site:"Search Resources",color:T.ac};
                return(
                  <div key={tool} style={{background:T.bg2,borderRadius:12,border:"1px solid "+T.bd,overflow:"hidden"}}>
                    <div style={{background:info.color+"22",borderBottom:"1px solid "+T.bd,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:24}}>{info.icon}</span>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:T.t1}}>{tool}</div>
                        <div style={{fontSize:10,color:info.color,fontWeight:600}}>{info.site}</div>
                      </div>
                    </div>
                    <div style={{padding:"12px 16px"}}>
                      <div style={{fontSize:12,color:T.t2,lineHeight:1.6,marginBottom:12}}>{info.desc}</div>
                      <a href={info.url} target="_blank" rel="noreferrer" style={{...s.btnP,display:"block",textAlign:"center",textDecoration:"none",fontSize:12,padding:"8px",background:info.color,border:"none"}}>Open Platform →</a>
                    </div>
                  </div>
                );
              }),
              ...[
                {tool:"Google Scholar",icon:"🎓",desc:"Free academic search engine for research papers and citations",url:"https://scholar.google.com",site:"scholar.google.com",color:"#4285F4"},
                {tool:"ResearchGate",icon:"🔬",desc:"Academic network to share papers and connect with researchers",url:"https://www.researchgate.net",site:"researchgate.net",color:"#00D2FF"},
                {tool:"Wolfram Alpha",icon:"🧮",desc:"Computational knowledge engine for maths and science queries",url:"https://www.wolframalpha.com",site:"wolframalpha.com",color:"#E07000"},
                {tool:"Coursera",icon:"🎒",desc:"Free audit access to university courses from top institutions",url:"https://www.coursera.org",site:"coursera.org",color:"#0056D2"},
              ].map(({tool,icon,desc,url,site,color})=>(
                <div key={tool} style={{background:T.bg2,borderRadius:12,border:"1px solid "+T.bd,overflow:"hidden"}}>
                  <div style={{background:color+"22",borderBottom:"1px solid "+T.bd,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:24}}>{icon}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:T.t1}}>{tool}</div>
                      <div style={{fontSize:10,color,fontWeight:600}}>{site}</div>
                    </div>
                  </div>
                  <div style={{padding:"12px 16px"}}>
                    <div style={{fontSize:12,color:T.t2,lineHeight:1.6,marginBottom:12}}>{desc}</div>
                    <a href={url} target="_blank" rel="noreferrer" style={{...s.btnP,display:"block",textAlign:"center",textDecoration:"none",fontSize:12,padding:"8px",background:color,border:"none"}}>Open Platform →</a>
                  </div>
                </div>
              ))
            ]}
          </div>
        </div>
      )}

      {sel==="pension"&&(
        <div>
          <h2 style={{...s.h1,marginBottom:"0.5rem"}}>🏦 Pension Benefits Calculator</h2>
          <p style={{...s.sub,marginBottom:"1.5rem"}}>Kenya pension computations — DC schemes, NSSF Act 2013, and Defined Benefit</p>

          <div style={{display:"flex",gap:8,marginBottom:"1.5rem",flexWrap:"wrap"}}>
            {[["dc","Defined Contribution (DC)"],["nssf","NSSF Kenya"],["db","Defined Benefit (DB)"]].map(([id,label])=>(
              <button key={id} onClick={()=>{setPenResult(null);setNssfResult(null);setDbResult(null);setSel("pension_"+id);}} style={{...s.btnS,fontSize:12}}>{label}</button>
            ))}
          </div>

          {/* DC Scheme */}
          <div style={{...s.card,marginBottom:"1rem"}}>
            <div style={{fontSize:14,fontWeight:600,color:T.ac,marginBottom:"1rem"}}>Defined Contribution (DC) Pension Scheme</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
              <div><label style={s.lbl}>MONTHLY GROSS SALARY (KES)</label><input style={s.input} type="number" value={penSalary} onChange={e=>setPenSalary(e.target.value)}/></div>
              <div><label style={s.lbl}>YEARS TO RETIREMENT</label><input style={s.input} type="number" value={penYears} onChange={e=>setPenYears(e.target.value)}/></div>
              <div><label style={s.lbl}>EMPLOYEE CONTRIBUTION (%)</label><input style={s.input} type="number" value={penContrib} onChange={e=>setPenContrib(e.target.value)}/></div>
              <div><label style={s.lbl}>EMPLOYER CONTRIBUTION (%)</label><input style={s.input} type="number" value={penEmployer} onChange={e=>setPenEmployer(e.target.value)}/></div>
              <div><label style={s.lbl}>ANNUAL FUND RETURN (%)</label><input style={s.input} type="number" value={penRate} onChange={e=>setPenRate(e.target.value)}/></div>
              <div><label style={s.lbl}>ANNUAL SALARY GROWTH (%)</label><input style={s.input} type="number" value={penSalaryGrowth} onChange={e=>setPenSalaryGrowth(e.target.value)} placeholder="e.g. 5"/></div>
            </div>
            <div style={{fontSize:11,color:T.t3,marginBottom:"0.75rem",padding:"8px 12px",background:T.bg3,borderRadius:6}}>Assumes salary grows annually. Income replacement is against projected final salary at retirement — a more realistic measure than today's salary.</div>
            <button onClick={calcPension} style={s.btnP}>Calculate DC Pension</button>
            {penResult&&(
              <div style={{marginTop:"1rem",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                {[
                  ["Projected Fund Value","KES "+fmt(penResult.fv),T.ac],
                  ["Est. Monthly Pension","KES "+fmt(penResult.monthlyPension),T.green],
                  ["Projected Final Salary","KES "+fmt(penResult.finalSalary),T.blue],
                  ["Total Contributions","KES "+fmt(penResult.totalContrib),T.purple],
                  ["Your Monthly (Today)","KES "+fmt(penResult.empMonthly),T.teal],
                  ["Income Replacement",penResult.replacementRate+"%",parseFloat(penResult.replacementRate)>=60?T.green:parseFloat(penResult.replacementRate)>=40?T.amber:T.red],
                ].map(([l,v,c])=>(
                  <div key={l} style={{background:rgba(c,0.1),border:"1px solid "+rgba(c,0.25),borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                    <div style={{fontSize:10,color:T.t3,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NSSF */}
          <div style={{...s.card,marginBottom:"1rem"}}>
            <div style={{fontSize:14,fontWeight:600,color:T.green,marginBottom:"1rem"}}>NSSF Kenya — Act 2013 Contributions</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
              <div><label style={s.lbl}>GROSS SALARY (KES)</label><input style={s.input} type="number" value={nssf.salary} onChange={e=>setNssf({...nssf,salary:e.target.value})}/></div>
              <div><label style={s.lbl}>NSSF TIER</label>
                <select style={s.input} value={nssf.tier} onChange={e=>setNssf({...nssf,tier:e.target.value})}>
                  <option value="1">Tier I only (up to KES 7,000)</option>
                  <option value="2">Tier I + Tier II (above KES 7,000)</option>
                </select>
              </div>
            </div>
            <button onClick={calcNSSF} style={{...s.btnP,background:T.green}}>Calculate NSSF</button>
            {nssfResult&&(
              <div style={{marginTop:"1rem"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
                  {[
                    ["Tier I Employee","KES "+fmt(nssfResult.tier1Employee),T.blue],
                    ["Tier I Employer","KES "+fmt(nssfResult.tier1Employer),T.blue],
                    ["Tier II Employee","KES "+fmt(nssfResult.tier2Employee),T.purple],
                    ["Tier II Employer","KES "+fmt(nssfResult.tier2Employer),T.purple],
                    ["Your Total","KES "+fmt(nssfResult.totalEmployee),T.green],
                    ["Combined Total","KES "+fmt(nssfResult.total),T.ac],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{background:rgba(c,0.1),border:"1px solid "+rgba(c,0.25),borderRadius:8,padding:"10px",textAlign:"center"}}>
                      <div style={{fontSize:15,fontWeight:700,color:c}}>{v}</div>
                      <div style={{fontSize:10,color:T.t3,marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:11,color:T.t3,padding:"8px 12px",background:T.bg3,borderRadius:6}}>Based on NSSF Act 2013: Tier I rate 6% employee + 6% employer on pensionable wages up to KES 7,000. Tier II rate 6%+6% on balance. Verify with RBA Kenya for current rates.</div>
              </div>
            )}
          </div>

          {/* Defined Benefit */}
          <div style={s.card}>
            <div style={{fontSize:14,fontWeight:600,color:T.amber,marginBottom:"1rem"}}>Defined Benefit (DB) — Final Salary Scheme</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:"1rem"}}>
              <div><label style={s.lbl}>FINAL MONTHLY SALARY (KES)</label><input style={s.input} type="number" value={dbSalary} onChange={e=>setDbSalary(e.target.value)}/></div>
              <div><label style={s.lbl}>YEARS OF SERVICE</label><input style={s.input} type="number" value={dbYears} onChange={e=>setDbYears(e.target.value)}/></div>
              <div><label style={s.lbl}>ACCRUAL RATE (% per year)</label><input style={s.input} type="number" value={dbFactor} onChange={e=>setDbFactor(e.target.value)} placeholder="e.g. 1.67 for 1/60th"/></div>
            </div>
            <div style={{fontSize:11,color:T.t3,marginBottom:"0.75rem"}}>Common accrual rates: 1.67% (1/60th scheme), 1.25% (1/80th scheme), 2% (1/50th scheme)</div>
            <button onClick={calcDB} style={{...s.btnP,background:T.amber,color:"#000"}}>Calculate DB Pension</button>
            {dbResult&&(
              <div style={{marginTop:"1rem",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
                {[
                  ["Annual Pension","KES "+fmt(dbResult.annual),T.amber],
                  ["Monthly Pension","KES "+fmt(dbResult.monthly),T.green],
                  ["Commutation (3x)","KES "+fmt(dbResult.lumpsum),T.ac],
                  ["Income Replacement",dbResult.replacementRate+"%",parseFloat(dbResult.replacementRate)>=60?T.green:T.red],
                ].map(([l,v,c])=>(
                  <div key={l} style={{background:rgba(c,0.1),border:"1px solid "+rgba(c,0.25),borderRadius:8,padding:"12px",textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                    <div style={{fontSize:10,color:T.t3,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {sel==="life"&&(
        <div style={s.card}>
          <h2 style={{fontSize:15,fontWeight:700,color:T.t1,marginBottom:4}}>❤️ Life Insurance Premium Estimator</h2>
          <p style={{fontSize:12,color:T.t2,marginBottom:"1rem"}}>Indicative term life premiums using simplified Kenya mortality assumptions. For actual quotes contact an IRA-licensed insurer.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
            <div><label style={s.lbl}>CURRENT AGE</label><input style={s.input} type="number" value={lifeAge} onChange={e=>setLifeAge(e.target.value)}/></div>
            <div><label style={s.lbl}>SUM ASSURED (KES)</label><input style={s.input} type="number" value={lifeSum} onChange={e=>setLifeSum(e.target.value)}/></div>
            <div><label style={s.lbl}>POLICY TERM (YEARS)</label><input style={s.input} type="number" value={lifeTerm} onChange={e=>setLifeTerm(e.target.value)}/></div>
            <div><label style={s.lbl}>SMOKER STATUS</label>
              <select style={s.input} value={lifeSmoker} onChange={e=>setLifeSmoker(e.target.value)}>
                <option value="no">Non-Smoker</option>
                <option value="yes">Smoker (2x mortality)</option>
              </select>
            </div>
          </div>
          <button onClick={calcLifeInsurance} style={s.btnP}>Estimate Premium</button>
          {lifeResult&&(
            <div style={{marginTop:"1rem",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
              {[
                ["Annual Premium","KES "+fmt(lifeResult.annual),T.ac],
                ["Monthly Premium","KES "+fmt(lifeResult.monthly),T.green],
                ["Total Premiums Paid","KES "+fmt(lifeResult.total),T.blue],
                ["Cover Ratio",lifeResult.coverRatio+"x",T.purple],
                ["Mortality Rate (‰)",lifeResult.mortality+" per 1000",T.amber],
              ].map(([l,v,c])=>(
                <div key={l} style={{background:rgba(c,0.1),border:"1px solid "+rgba(c,0.25),borderRadius:8,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:T.t3,marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{fontSize:10,color:T.t3,marginTop:"1rem",padding:"8px",background:T.bg3,borderRadius:6}}>Disclaimer: This is an educational estimate only. Actual premiums depend on full medical underwriting. Verify with IRA Kenya licensed insurers.</div>
        </div>
      )}

      {sel==="risk"&&(
        <div style={s.card}>
          <h2 style={{fontSize:15,fontWeight:700,color:T.t1,marginBottom:4}}>⚠️ Value at Risk (VaR) & Portfolio Risk</h2>
          <p style={{fontSize:12,color:T.t2,marginBottom:"1rem"}}>Parametric VaR using normal distribution. Used in risk management and Solvency II reporting.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
            <div><label style={s.lbl}>PORTFOLIO VALUE (KES)</label><input style={s.input} type="number" value={varPortfolio} onChange={e=>setVarPortfolio(e.target.value)}/></div>
            <div><label style={s.lbl}>EXPECTED ANNUAL RETURN (%)</label><input style={s.input} type="number" value={varReturn} onChange={e=>setVarReturn(e.target.value)}/></div>
            <div><label style={s.lbl}>ANNUAL VOLATILITY / STD DEV (%)</label><input style={s.input} type="number" value={varVolatility} onChange={e=>setVarVolatility(e.target.value)}/></div>
            <div><label style={s.lbl}>CONFIDENCE LEVEL</label>
              <select style={s.input} value={varConfidence} onChange={e=>setVarConfidence(e.target.value)}>
                <option value="90">90% (z = 1.282)</option>
                <option value="95">95% (z = 1.645)</option>
                <option value="99">99% (z = 2.326)</option>
                <option value="99.9">99.9% (z = 3.090)</option>
              </select>
            </div>
          </div>
          <button onClick={calcVaR} style={{...s.btnP,background:T.red}}>Calculate VaR</button>
          {varResult&&(
            <div style={{marginTop:"1rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:"1rem"}}>
                {[
                  ["1-Day VaR","KES "+fmt(varResult.daily),T.red],
                  ["1-Month VaR","KES "+fmt(varResult.monthly),T.amber],
                  ["1-Year VaR","KES "+fmt(varResult.annual),T.purple],
                  ["1-Day CVaR (ES)","KES "+fmt(varResult.cvar),T.red],
                  ["Sharpe Ratio",varResult.sharpe,parseFloat(varResult.sharpe)>1?T.green:T.amber],
                ].map(([l,v,c])=>(
                  <div key={l} style={{background:rgba(c,0.1),border:"1px solid "+rgba(c,0.25),borderRadius:8,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                    <div style={{fontSize:10,color:T.t3,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:T.t3,padding:"8px 12px",background:T.bg3,borderRadius:6}}>VaR: Maximum expected loss at given confidence level. CVaR (Expected Shortfall): Average loss beyond VaR threshold. Parametric method assumes normality.</div>
            </div>
          )}
        </div>
      )}

      {sel==="bond"&&(
        <div style={s.card}>
          <h2 style={{fontSize:15,fontWeight:700,color:T.t1,marginBottom:4}}>📑 Bond Pricing & Duration Calculator</h2>
          <p style={{fontSize:12,color:T.t2,marginBottom:"1rem"}}>Price fixed-income securities, compute Macaulay and modified duration. Relevant for Kenya government bonds and corporate debt.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
            <div><label style={s.lbl}>FACE VALUE (KES)</label><input style={s.input} type="number" value={bondFace} onChange={e=>setBondFace(e.target.value)}/></div>
            <div><label style={s.lbl}>COUPON RATE (% p.a.)</label><input style={s.input} type="number" value={bondCoupon} onChange={e=>setBondCoupon(e.target.value)}/></div>
            <div><label style={s.lbl}>MARKET YIELD / YTM (%)</label><input style={s.input} type="number" value={bondYield} onChange={e=>setBondYield(e.target.value)}/></div>
            <div><label style={s.lbl}>YEARS TO MATURITY</label><input style={s.input} type="number" value={bondYears} onChange={e=>setBondYears(e.target.value)}/></div>
            <div><label style={s.lbl}>COUPON FREQUENCY</label>
              <select style={s.input} value={bondFreq} onChange={e=>setBondFreq(e.target.value)}>
                <option value="1">Annual</option>
                <option value="2">Semi-Annual</option>
                <option value="4">Quarterly</option>
              </select>
            </div>
          </div>
          <button onClick={calcBond} style={{...s.btnP,background:T.purple}}>Price Bond</button>
          {bondResult&&(
            <div style={{marginTop:"1rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:"1rem"}}>
                {[
                  ["Clean Price","KES "+fmt(bondResult.price),T.purple],
                  ["Price (% of Face)",bondResult.pricePercentage+"%",T.ac],
                  ["Macaulay Duration",bondResult.duration+" yrs",T.blue],
                  ["Modified Duration",bondResult.modDuration+" yrs",T.teal],
                  ["Total Coupon Income","KES "+fmt(bondResult.totalCoupon),T.green],
                  ["Trading At",bondResult.premium,bondResult.premium==="Premium"?T.amber:T.green],
                ].map(([l,v,c])=>(
                  <div key={l} style={{background:rgba(c,0.1),border:"1px solid "+rgba(c,0.25),borderRadius:8,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                    <div style={{fontSize:10,color:T.t3,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:T.t3,padding:"8px 12px",background:T.bg3,borderRadius:6}}>Modified Duration measures price sensitivity to yield changes. A duration of {bondResult.modDuration} means a 1% yield rise reduces price by ~{bondResult.modDuration}%. Relevant for Kenya Treasury bonds traded on NSE.</div>
            </div>
          )}
        </div>
      )}

      {sel==="ai"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:4}}>🤖 AI Formula & Concept Helper</div>
          <div style={{fontSize:12,color:T.t2,marginBottom:"1rem"}}>Ask anything — formula derivations, actuarial concepts, statistical methods, financial models</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:"0.75rem"}}>
            {["Derive the Black-Scholes formula","Explain credibility theory","Show the Kaplan-Meier estimator","Derive net premium for whole life policy","Explain VaR and CVaR","Show ARIMA model selection criteria"].map(q=>(
              <button key={q} onClick={()=>setAiPrompt(q)} style={{...s.btnS,fontSize:10,padding:"4px 10px"}}>{q}</button>
            ))}
          </div>
          <textarea style={{...s.input,height:80,resize:"vertical",fontSize:12,marginBottom:"0.75rem"}} placeholder={"Ask a "+((fld&&fld.name)||"actuarial")+" question..."} value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)}/>
          <button onClick={askAI} style={{...s.btnP,marginBottom:"1rem"}} disabled={aiLoading||!aiPrompt.trim()}>{aiLoading?"Thinking...":"Ask AI"}</button>
          {aiResult&&(
            <div style={{background:T.bg3,borderRadius:10,padding:"1rem",fontSize:12,color:T.t1,lineHeight:1.8,whiteSpace:"pre-wrap",border:"1px solid "+T.bd}}>{aiResult}</div>
          )}
        </div>
      )}
    </div>
  );
};

const TranscriptView=({userField})=>{
  const T=useT();const t=useLang();const s=sx(T);
  const fld=FIELDS[userField];const data=FIELD_DATA[userField];
  const courses=(data&&data.courses)||[];
  const [mode,setMode]=useState("upload");
  const [loading,setLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);
  const [aiError,setAiError]=useState("");
  const [uploadedFile,setUploadedFile]=useState(null);
  const [units,setUnits]=useState(courses.slice(0,5).map(c=>({code:c.code,name:c.name,grade:"B+",credit:3})));
  const fileRef=useRef(null);
  const gradeOpts=["A","A-","B+","B","B-","C+","C","C-","D+","D","E"];
  const creditOpts=[1,2,3,4,5,6];

  const gradeToGPA=g=>({A:4.0,"A-":3.7,"B+":3.3,B:3.0,"B-":2.7,"C+":2.3,C:2.0,"C-":1.7,"D+":1.3,D:1.0,E:0.0}[g]||0);
  const totalPoints=units.reduce((s,u)=>s+gradeToGPA(u.grade)*u.credit,0);
  const totalCredits=units.reduce((s,u)=>s+u.credit,0);
  const gpaNum=totalCredits>0?totalPoints/totalCredits:0;
  const gpa=gpaNum.toFixed(2);
  const standing=gpaNum>=3.5?"First Class":gpaNum>=3.0?"Upper Second":gpaNum>=2.5?"Lower Second":"Pass";

  const analyseWithAI=async(src)=>{
    setLoading(true);setAiError("");setAiResult(null);
    try{
      const fieldName=(fld&&fld.name)||userField;
      let messages=[];
      if(src==="upload"&&uploadedFile){
        const base64=await new Promise((res,rej)=>{
          const r=new FileReader();
          r.onload=()=>res(r.result.split(",")[1]);
          r.onerror=rej;
          r.readAsDataURL(uploadedFile);
        });
        const isPDF=uploadedFile.type==="application/pdf";
        const content=[
          isPDF
            ?{type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}}
            :{type:"image",source:{type:"base64",media_type:uploadedFile.type,data:base64}},
          {type:"text",text:"You are an academic advisor at a Kenyan university. This student studies "+fieldName+". Read their transcript carefully and provide:\n1. **Academic Summary** — their actual GPA, standing, and overall performance from the transcript\n2. **Strengths** — top performing units you can see\n3. **Areas to Improve** — weak areas with specific advice\n4. **Recommended Certifications** — 3-4 certs matching their actual profile in Kenya\n5. **Career Pathways** — top 3 careers with % fit based on what you see\n6. **12-Month Action Plan** — 4 quarterly steps tailored to their results\n\nBase everything on what you actually see in the transcript."}
        ];
        messages=[{role:"user",content}];
      } else {
        const unitList=units.map(u=>u.code+" "+u.name+": "+u.grade+" ("+u.credit+" CU)").join(", ");
        const prompt="You are an academic advisor at a Kenyan university. A "+fieldName+" student has these grades: "+unitList+". GPA: "+gpa+" ("+standing+"). Provide:\n1. **Academic Summary** — 2-3 sentence assessment of their actual performance\n2. **Strengths** — top 3 units they excel in\n3. **Areas to Improve** — weakest 2-3 units with specific advice\n4. **Recommended Certifications** — 3-4 certs matching their profile in Kenya\n5. **Career Pathways** — top 3 careers with % fit based on their actual grades\n6. **12-Month Action Plan** — 4 quarterly milestones tailored to their GPA\n\nBe specific to their actual grades, not generic.";
        messages=[{role:"user",content:prompt}];
      }
      const text=await callAI(messages[0].content, 1500);
      setAiResult(text);setMode("advice");
    }catch(e){
      console.error(e);
      setAiError("AI analysis failed: "+e.message);
    }
    setLoading(false);
  };

  return(
    <div>
      <h1 style={s.h1}>{t("transcript")}</h1>
      <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{fld&&fld.icon} {fld&&fld.name}</span>Upload results for personalised AI career guidance</p>
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
        {[["upload","📄 Upload"],["manual","✏️ Manual Entry"],["advice","🎯 Career Guidance"]].map(mb=>(
          <button key={mb[0]} onClick={()=>setMode(mb[0])} style={{...(mode===mb[0]?s.btnP:s.btnS),fontSize:12,padding:"8px 16px"}}>{mb[1]}</button>
        ))}
      </div>

      {mode==="upload"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={s.card}>
            <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Upload Your Transcript</div>
            <div onClick={()=>fileRef.current&&fileRef.current.click()} style={{border:`2px dashed ${uploadedFile?T.green:T.bd}`,borderRadius:10,padding:"2.5rem",textAlign:"center",cursor:"pointer",marginBottom:"1rem"}}>
              <div style={{fontSize:40,marginBottom:12}}>{uploadedFile?"✅":"📄"}</div>
              <div style={{fontSize:13,color:uploadedFile?T.green:T.t2,marginBottom:4}}>{uploadedFile?uploadedFile.name:"Drop your official transcript here"}</div>
              <div style={{fontSize:11,color:T.t3}}>PDF or image · BUC, KUCCPS, A-Level</div>
            </div>
            <input ref={fileRef} type="file" style={{display:"none"}} accept=".pdf,.png,.jpg,.jpeg" onChange={e=>setUploadedFile(e.target.files[0]||null)}/>
            {aiError&&<div style={{color:T.red,fontSize:12,marginBottom:8}}>{aiError}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>fileRef.current&&fileRef.current.click()} style={{...s.btnS,flex:1}}>Choose File</button>
              <button onClick={()=>analyseWithAI("upload")} style={{...s.btnP,flex:1}} disabled={loading}>{loading?"Analysing...":"Get AI Guidance →"}</button>
            </div>
            <div style={{fontSize:11,color:T.t3,marginTop:8,textAlign:"center"}}>Or use Manual Entry to type your grades for detailed GPA analysis</div>
          </div>
          <div style={s.card}>
            <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>What AI Does With Your Transcript</div>
            {[["🎓 Reads Your Field","Gives guidance specific to "+((fld&&fld.name)||"your field")+" in Kenya"],["📊 Calculates Standing","Identifies your academic strengths and weak areas"],["🏆 Matches Certifications","Finds professional certs that boost your career"],["🗺️ Career Pathways","Shows top career options with fit scores"],["📅 12-Month Plan","Step-by-step quarterly action roadmap"]].map(uf=>(
              <div key={uf[0]} style={{display:"flex",gap:10,marginBottom:10}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:T.ac,marginTop:6,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:12,color:T.t1,fontWeight:500}}>{uf[0]}</div>
                  <div style={{fontSize:11,color:T.t3,lineHeight:1.5}}>{uf[1]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode==="manual"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
            <div>
              <span style={{fontSize:14,fontWeight:600,color:T.t1}}>{units.length} units · </span>
              <span style={{fontSize:14,fontWeight:700,color:gpaNum>=3.5?T.green:gpaNum>=3.0?T.amber:T.red}}>{gpa} GPA — {standing}</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setUnits(u=>[...u,{code:"",name:"",grade:"B",credit:3}])} style={{...s.btnS,fontSize:12,padding:"6px 12px"}}>+ Add Unit</button>
              <button onClick={()=>analyseWithAI("manual")} style={s.btnP} disabled={loading||units.length===0}>{loading?"Analysing...":"Analyse with AI →"}</button>
            </div>
          </div>
          {aiError&&<div style={{color:T.red,fontSize:12,marginBottom:8,padding:"8px 12px",background:rgba(T.red,0.1),borderRadius:8}}>{aiError}</div>}
          <div style={{display:"grid",gap:6}}>
            {units.map((u,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"120px 1fr 80px 80px 34px",gap:8,alignItems:"center"}}>
                <input style={{...s.input,fontSize:12}} placeholder="Code" value={u.code} onChange={e=>setUnits(un=>un.map((x,xi)=>xi===i?{...x,code:e.target.value}:x))}/>
                <input style={{...s.input,fontSize:12}} placeholder="Unit name" value={u.name} onChange={e=>setUnits(un=>un.map((x,xi)=>xi===i?{...x,name:e.target.value}:x))}/>
                <select style={{...s.input,fontSize:12}} value={u.grade} onChange={e=>setUnits(un=>un.map((x,xi)=>xi===i?{...x,grade:e.target.value}:x))}>
                  {gradeOpts.map(g=><option key={g}>{g}</option>)}
                </select>
                <select style={{...s.input,fontSize:12}} value={u.credit} onChange={e=>setUnits(un=>un.map((x,xi)=>xi===i?{...x,credit:parseInt(e.target.value)}:x))}>
                  {creditOpts.map(c=><option key={c} value={c}>{c} CU</option>)}
                </select>
                <button onClick={()=>setUnits(un=>un.filter((_,xi)=>xi!==i))} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:7,color:T.red,cursor:"pointer",fontSize:14,height:36}}>×</button>
              </div>
            ))}
          </div>
          <div style={{...s.card,marginTop:"1rem",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {[["GPA",gpa,gpaNum>=3.5?T.green:T.amber],["Units",units.length,T.t1],["Standing",standing,T.ac],["Credits",totalCredits,T.blue]].map(item=>(
              <div key={item[0]} style={{textAlign:"center"}}>
                <div style={{fontSize:10,color:T.t3,marginBottom:4}}>{item[0].toUpperCase()}</div>
                <div style={{fontSize:20,fontWeight:700,color:item[2]}}>{item[1]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode==="advice"&&(
        <div>
          {!aiResult?(
            <div style={{...s.card,textAlign:"center",padding:"2.5rem"}}>
              <div style={{fontSize:40,marginBottom:12}}>🎯</div>
              <div style={{fontSize:14,color:T.t2,marginBottom:"1rem"}}>Enter your grades in Manual Entry or upload your transcript to get personalised AI guidance.</div>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                <button onClick={()=>setMode("upload")} style={s.btnS}>Upload Transcript</button>
                <button onClick={()=>setMode("manual")} style={s.btnP}>Enter Grades →</button>
              </div>
            </div>
          ):(
            <div style={{...s.card}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
                <div style={{fontSize:14,fontWeight:600,color:T.t1}}>🎯 Your Personalised Career Guidance</div>
                <button onClick={()=>{setAiResult(null);setMode("manual");}} style={{...s.btnS,fontSize:11,padding:"5px 12px"}}>Re-analyse</button>
              </div>
              <div style={{fontSize:13,color:T.t1,lineHeight:1.8}}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{aiResult}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const CommunityChat=({userId,userName,userField,T,s})=>{
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);

  const load=async()=>{
    const {supabase}=await import("./supabase.js");
    const {data}=await supabase.from("community_messages").select("*").order("created_at",{ascending:true}).limit(100);
    setMsgs(data||[]);setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const send=async()=>{
    if(!input.trim())return;
    setSending(true);
    const {supabase}=await import("./supabase.js");
    await supabase.from("community_messages").insert({user_id:userId,user_name:userName,user_field:userField,message:input.trim()});
    setInput("");setSending(false);load();
  };

  return(
    <div style={{background:T.bg2,borderRadius:12,border:"1px solid "+T.bd,display:"flex",flexDirection:"column",height:"68vh",overflow:"hidden"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid "+T.bd,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:T.t1}}>Community Chat</div>
          <div style={{fontSize:11,color:T.t3}}>Open to all students and staff</div>
        </div>
        <button onClick={load} style={{...s.btnS,fontSize:11,padding:"4px 10px"}}>↻</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"1rem",display:"flex",flexDirection:"column",gap:8}}>
        {loading&&<div style={{textAlign:"center",color:T.t3,padding:"2rem"}}>Loading...</div>}
        {!loading&&msgs.length===0&&<div style={{textAlign:"center",color:T.t3,padding:"2rem"}}>No messages yet. Start the conversation!</div>}
        {!loading&&msgs.map(m=>{
          const isMe=m.user_id===userId;
          const fld=FIELDS[m.user_field];
          return(
            <div key={m.id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:fld?fld.color+"33":T.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:fld?fld.color:T.ac,flexShrink:0}}>
                {(m.user_name||"?")[0].toUpperCase()}
              </div>
              <div style={{maxWidth:"72%"}}>
                <div style={{fontSize:10,color:T.t3,marginBottom:2,textAlign:isMe?"right":"left"}}>{isMe?"You":m.user_name}</div>
                <div style={{background:isMe?T.ac:T.bg3,color:isMe?"#000":T.t1,borderRadius:10,padding:"8px 12px",fontSize:12,lineHeight:1.5}}>{m.message}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{padding:"12px 16px",borderTop:"1px solid "+T.bd,display:"flex",gap:8}}>
        <input style={{...s.input,flex:1,fontSize:12}} placeholder="Say something..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}}/>
        <button onClick={send} style={{...s.btnP,padding:"8px 16px",fontSize:12}} disabled={!input.trim()||sending}>{sending?"...":"Send"}</button>
      </div>
    </div>
  );
};

const PeersView=({setTab,userField,userName,userId})=>{
  const T=useT();const s=sx(T);
  const [peersTab,setPeersTab]=useState("peers");
  const [peers,setPeers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");

  useEffect(()=>{
    (async()=>{
      const {supabase}=await import("./supabase.js");
      const {data}=await supabase.from("profiles").select("*").eq("status","approved").neq("id",(await supabase.auth.getUser()).data.user?.id||"").order("full_name");
      setPeers(data||[]);setLoading(false);
    })();
  },[]);

  const fieldColors={};
  Object.entries(FIELDS).forEach(([k,v])=>{fieldColors[k]=v.color;});
  const getInitials=n=>(n||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const filtered=filter==="all"?peers:filter==="field"?peers.filter(p=>p.field===userField):filter==="year"?peers.filter(p=>p.field===userField&&p.year_level):peers.filter(p=>p.role==="lecturer"||p.role==="admin");

  return(
    <div>
      <h1 style={s.h1}>Peers and Community</h1>
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
        <button onClick={()=>setPeersTab("peers")} style={{...(peersTab==="peers"?s.btnP:s.btnS),fontSize:12}}>Peers Directory</button>
        <button onClick={()=>setPeersTab("community")} style={{padding:"7px 16px",borderRadius:8,border:"1px solid "+rgba(T.purple,0.5),background:peersTab==="community"?T.purple:"none",color:peersTab==="community"?"#fff":T.purple,fontSize:12,cursor:"pointer",fontWeight:peersTab==="community"?700:400}}>Community Chat</button>
      </div>
      {peersTab==="community"&&<CommunityChat userId={userId} userName={userName} userField={userField} T={T} s={s}/>}
      {peersTab==="peers"&&(
        <div>
          <p style={s.sub}>Connect with fellow students across AKADIMIA</p>
          <div style={{display:"flex",gap:8,marginBottom:"1.25rem",flexWrap:"wrap"}}>
            {[["all","All"],["field","My Field"],["year","My Field and Year"],["lecturers","Lecturers"]].map(([id,label])=>(
              <button key={id} onClick={()=>setFilter(id)} style={{...(filter===id?s.btnP:s.btnS),fontSize:12}}>{label}</button>
            ))}
          </div>
          {loading?<div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>Loading peers...</div>:(
            <div>
              <div style={{fontSize:12,color:T.t3,marginBottom:"0.75rem"}}>{filtered.length} student{filtered.length!==1?"s":""}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                {filtered.map((p,i)=>{
                  const fc=fieldColors[p.field]||T.ac;
                  const peerFld=FIELDS[p.field];
                  return(
                    <div key={i} style={{...s.card,textAlign:"center",padding:"1.25rem"}}>
                      <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,"+fc+","+fc+"88)",margin:"0 auto 10px",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:18}}>
                        {getInitials(p.full_name)}
                      </div>
                      <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:4}}>{p.full_name}</div>
                      <div style={{fontSize:11,color:fc,marginBottom:4}}>{peerFld?peerFld.icon+" "+peerFld.name:p.field}</div>
                      {p.year_level&&<div style={{fontSize:10,color:T.t3,marginBottom:8}}>{p.year_level}</div>}
                      <div style={{display:"inline-block",background:rgba(fc,0.12),color:fc,borderRadius:20,padding:"3px 12px",fontSize:10,fontWeight:600,textTransform:"capitalize"}}>{p.role||"student"}</div>
                    </div>
                  );
                })}
                {filtered.length===0&&(
                  <div style={{...s.card,textAlign:"center",padding:"3rem",gridColumn:"1/-1"}}>
                    <div style={{fontSize:40,marginBottom:12}}>👥</div>
                    <div style={{fontSize:14,color:T.t2}}>No peers found for this filter.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WellnessResponses=({userField,T,s})=>{
  const [responses,setResponses]=useState([]);
  useEffect(()=>{
    (async()=>{
      const {supabase}=await import("./supabase.js");
      const {data}=await supabase.from("wellness_responses").select("*").eq("field",userField).order("created_at",{ascending:false}).limit(5);
      setResponses(data||[]);
    })();
  },[userField]);
  if(responses.length===0)return null;
  return(
    <div style={{marginBottom:"1rem"}}>
      {responses.map((r,i)=>(
        <div key={i} style={{padding:"12px 14px",background:rgba(T.blue,0.08),border:"1px solid "+rgba(T.blue,0.25),borderRadius:8,marginBottom:8,borderLeft:"3px solid "+T.blue}}>
          <div style={{fontSize:11,fontWeight:600,color:T.blue,marginBottom:4}}>💙 Message from Wellness Team</div>
          <div style={{fontSize:12,color:T.t1,lineHeight:1.7}}>{r.message}</div>
          <div style={{fontSize:10,color:T.t3,marginTop:4}}>{new Date(r.created_at).toLocaleDateString("en-KE")}</div>
        </div>
      ))}
    </div>
  );
};

const ClassroomView=({userField,role,userName,userId,addNotif})=>{
  const T=useT();const s=sx(T);const fld=FIELDS[userField];
  const isLec=role==="lecturer"||role==="admin";
  const [tab,setTab]=useState("assignments");
  const [assignments,setAssignments]=useState([]);
  const [submissions,setSubmissions]=useState([]);
  const [exams,setExams]=useState([]);
  const [examSubs,setExamSubs]=useState([]);
  const [meetings,setMeetings]=useState([]);
  const [comments,setComments]=useState({});
  const [loading,setLoading]=useState(true);
  const [showCreate,setShowCreate]=useState(false);
  const [editingA,setEditingA]=useState(null);
    const [newA,setNewA]=useState({title:"",course_code:"",description:"",due_date:"",max_marks:100,target_year:"All",assignment_type:"individual",group_size:3,allow_late:false,questions:[]});
  const [newQ,setNewQ]=useState({text:"",type:"mcq",options:["","","",""],marks:5,correct_answer:0});
  const [assignFile,setAssignFile]=useState(null);
  const [creating,setCreating]=useState(false);
  const [expanded,setExpanded]=useState(null);
  const [subFile,setSubFile]=useState(null);
  const [subComment,setSubComment]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [grading,setGrading]=useState(null);
  const [gradeMarks,setGradeMarks]=useState("");
  const [gradeFeedback,setGradeFeedback]=useState("");
  const [newComment,setNewComment]=useState({});
  const [sendingComment,setSendingComment]=useState({});
  const [wellnessMsg,setWellnessMsg]=useState("");
  const [wellnessSending,setWellnessSending]=useState(false);
  const [wellnessDone,setWellnessDone]=useState(false);
  const [wellnessResponses,setWellnessResponses]=useState([]);
  const [wellnessCheckins,setWellnessCheckins]=useState([]);
  const [ratings,setRatings]=useState({});
  const [ratingDone,setRatingDone]=useState({});
  const [ratingComment,setRatingComment]=useState({});

  const load=async()=>{
    setLoading(true);
    try{
      const {supabase}=await import("./supabase.js");
      const lecRole=role==="lecturer"||role==="admin";
      const [aRes,sRes,eRes,esRes,mRes,wrRes]=await Promise.all([
        supabase.from("assignments").select("*").eq("field",userField).order("created_at",{ascending:false}),
        supabase.from("submissions").select("*"),
        supabase.from("exams").select("*").eq("field",userField).order("created_at",{ascending:false}),
        supabase.from("exam_submissions").select("*"),
        supabase.from("meetings").select("*").eq("field",userField).order("scheduled_at",{ascending:false}),
        supabase.from("wellness_responses").select("*").eq("field",userField).order("created_at",{ascending:false}).limit(10),
      ]);
      setAssignments(aRes.data||[]);
      setSubmissions(sRes.data||[]);
      setExams(eRes.data||[]);
      setExamSubs(esRes.data||[]);
      setMeetings(mRes.data||[]);
      setWellnessResponses(wrRes.data||[]);
      if(lecRole){
        const wcRes=await supabase.from("wellness_checkins").select("*").eq("field",userField).order("created_at",{ascending:false}).limit(30);
        setWellnessCheckins(wcRes.data||[]);
      }
      const aIds=(aRes.data||[]).map(a=>"asgn_"+a.id);
      if(aIds.length>0){
        const cRes=await supabase.from("innovation_comments").select("*").in("innovation_id",aIds);
        const cMap={};
        (cRes.data||[]).forEach(c=>{if(!cMap[c.innovation_id])cMap[c.innovation_id]=[];cMap[c.innovation_id].push(c);});
        setComments(cMap);
      }
    }catch(err){console.error("ClassroomView load error:",err);}
    setLoading(false);
  };
  useEffect(()=>{load();},[userField]);

  const mySubs=submissions.filter(s=>s.student_name===userName);
  const myExamSubs=examSubs.filter(s=>s.student_name===userName);
  const graded=mySubs.filter(s=>s.status==="graded");
  const gradedExams=myExamSubs.filter(s=>s.marks!=null);
  const avgScore=graded.length>0?Math.round(graded.reduce((acc,sub)=>{const a=assignments.find(x=>x.id===sub.assignment_id);return acc+(a&&a.max_marks>0?Math.round(((sub.marks||0)/a.max_marks)*100):0);},0)/graded.length):null;

  const uploadFile=async(file,path)=>{
    const {supabase}=await import("./supabase.js");
    const {data}=await supabase.storage.from("course-materials").upload(path,file,{upsert:true});
    if(!data)return null;
    const {data:url}=supabase.storage.from("course-materials").getPublicUrl(path);
    return url.publicUrl;
  };

  const createAssignment=async()=>{
    if(!newA.title.trim())return;
    setCreating(true);
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    let fileUrl=null;
    if(assignFile){fileUrl=await uploadFile(assignFile,"assignments/"+Date.now()+"_"+assignFile.name);}
    const {questions:qs,assignment_type,group_size,allow_late,...baseData}=newA;
    const payload={title:baseData.title,course_code:baseData.course_code,description:baseData.description,due_date:baseData.due_date?new Date(baseData.due_date).toISOString():null,max_marks:baseData.max_marks,target_year:baseData.target_year,field:userField,file_url:fileUrl||null,assignment_type:assignment_type||"individual",group_size:group_size||3,allow_late:allow_late||false};
    let insertedA,insertErr;
    if(editingA){({data:insertedA,error:insertErr}=await supabase.from("assignments").update(payload).eq("id",editingA).select());if(insertedA)insertedA=insertedA[0];}
    else{({data:insertedA,error:insertErr}=await supabase.from("assignments").insert({...payload,created_by:user.id}).select().single());}
    if(insertErr){console.error("Assignment insert error:",insertErr);if(addNotif)addNotif("❌","Error","Failed to post assignment: "+insertErr.message);setCreating(false);return;}
    // Save questions separately if any
    if(qs&&qs.length>0&&insertedA){
      await supabase.from("assignment_questions").insert(qs.map(q=>({...q,assignment_id:insertedA.id,field:userField})));
    }
    // Email notification to students
    try{
      let q=supabase.from("profiles").select("*").eq("field",userField).eq("status","approved").eq("role","student");if(newA.target_year&&newA.target_year!=="All"){q=q.eq("year_level",newA.target_year);}const {data:students}=await q;
      if(students&&students.length>0){
        const dueStr=newA.due_date?new Date(newA.due_date).toLocaleDateString("en-KE"):"No deadline";
        const emailHtml=`<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0"><div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#1a1a2e;padding:20px 24px;text-align:center"><div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:3px">AKADIMIA</div></div><div style="padding:24px"><p style="font-size:16px;font-weight:700;color:#1a1a2e">New Assignment Posted</p><p style="font-size:14px;color:#444"><strong>${newA.title}</strong> has been posted for ${userField} students.</p><table style="width:100%;border-collapse:collapse;margin:16px 0"><tr><td style="padding:8px 12px;background:#f9f9f9;font-size:12px;color:#888;width:40%">Course Code</td><td style="padding:8px 12px;font-size:13px;color:#333">${newA.course_code||"Not specified"}</td></tr><tr><td style="padding:8px 12px;background:#f9f9f9;font-size:12px;color:#888">Due Date</td><td style="padding:8px 12px;font-size:13px;color:#e00">${dueStr}</td></tr><tr><td style="padding:8px 12px;background:#f9f9f9;font-size:12px;color:#888">Max Marks</td><td style="padding:8px 12px;font-size:13px;color:#333">${newA.max_marks}</td></tr><tr><td style="padding:8px 12px;background:#f9f9f9;font-size:12px;color:#888">Type</td><td style="padding:8px 12px;font-size:13px;color:#333">${newA.assignment_type==="group"?"Group ("+newA.group_size+" members)":"Individual"}</td></tr></table><div style="text-align:center;margin:20px 0"><a href="https://akadimia.co.ke" style="display:inline-block;background:#D4A017;color:#000;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:13px">Open AKADIMIA</a></div><p style="font-size:11px;color:#999;text-align:center">Log in and go to My Classroom to view and submit.</p></div></div></body></html>`;
        await fetch(import.meta.env.VITE_SUPABASE_URL+"/functions/v1/send-email",{method:"POST",headers:{"Content-Type":"application/json","apikey":import.meta.env.VITE_SUPABASE_KEY,"Authorization":"Bearer "+import.meta.env.VITE_SUPABASE_KEY},body:JSON.stringify({to:students.map(s=>s.email||s.id).filter(e=>e&&e.includes("@")),subject:"New Assignment: "+newA.title+" — Due "+dueStr,html:emailHtml})});
      }
    }catch(emailErr){console.log("Email notification error:",emailErr);}
    setNewA({title:"",course_code:"",description:"",due_date:"",max_marks:100,target_year:"All",assignment_type:"individual",group_size:3,allow_late:false,questions:[]});
    setAssignFile(null);setShowCreate(false);setCreating(false);setEditingA(null);
    if(addNotif)addNotif("📋","Assignment Posted","Students can now see and submit this assignment.");
    load();
  };

  const submitAssignment=async(aId)=>{
    if(!subFile){if(addNotif)addNotif("⚠️","File Required","Please attach your file before submitting.");return;}
    setSubmitting(true);
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    let fileUrl=null;
    fileUrl=await uploadFile(subFile,"submissions/"+aId+"_"+user.id+"_"+Date.now()+"_"+subFile.name);
    await supabase.from("submissions").insert({assignment_id:aId,student_id:user.id,student_name:userName,file_url:fileUrl,comment:subComment,status:"submitted"});
    setSubFile(null);setSubComment("");setExpanded(null);setSubmitting(false);
    if(addNotif)addNotif("✅","Submitted","Your assignment has been submitted successfully.");
    load();
  };

  const gradeSubmission=async(subId)=>{
    const {supabase}=await import("./supabase.js");
    await supabase.from("submissions").update({marks:parseFloat(gradeMarks),feedback:gradeFeedback,status:"graded"}).eq("id",subId);
    setGrading(null);setGradeMarks("");setGradeFeedback("");
    if(addNotif)addNotif("✅","Graded","Submission graded successfully.");
    load();
  };

  const postComment=async(aId)=>{
    const key="asgn_"+aId;
    const txt=(newComment[key]||"").trim();
    if(!txt)return;
    setSendingComment(c=>({...c,[key]:true}));
    const {supabase}=await import("./supabase.js");
    await supabase.from("innovation_comments").insert({innovation_id:key,author_name:userName,content:txt,created_at:new Date().toISOString()});
    setNewComment(c=>({...c,[key]:""}));
    setSendingComment(c=>({...c,[key]:false}));
    load();
  };

  const submitWellness=async()=>{
    if(!wellnessMsg.trim())return;
    setWellnessSending(true);
    const {supabase}=await import("./supabase.js");
    await supabase.from("wellness_checkins").insert({field:userField,message:wellnessMsg,created_at:new Date().toISOString()});
    setWellnessDone(true);setWellnessSending(false);
    if(addNotif)addNotif("💚","Sent","Your anonymous message has been received.");
  };

  const submitRating=async(mId)=>{
    if(!ratings[mId])return;
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    await supabase.from("class_ratings").insert({meeting_id:mId,field:userField,rating:ratings[mId],comment:ratingComment[mId]||"",student_id:user.id});
    setRatingDone(r=>({...r,[mId]:true}));
    if(addNotif)addNotif("⭐","Thank you","Your class rating has been submitted.");
  };

  const daysLeft=d=>{if(!d)return null;return Math.ceil((new Date(d)-new Date())/(1000*60*60*24));};
  const isOverdue=d=>d&&new Date(d)<new Date();

  const TABS=isLec
    ?[["assignments","📋 Assignments"],["wellness","💚 Wellness"],["insights","📊 Insights"]]
    :[["assignments","📋 Assignments"],["grades","🎯 My Grades"],["wellness","💚 Wellness"],["ratings","⭐ Rate Classes"]];

  if(loading)return <div style={{...s.card,textAlign:"center",padding:"3rem",color:T.t3}}><div>Loading your classroom...</div><button onClick={()=>setLoading(false)} style={{marginTop:12,fontSize:11,color:T.t3,background:"none",border:"none",cursor:"pointer"}}>Tap if stuck</button></div>;

  return(
    <div>
      <div style={{background:"linear-gradient(135deg,"+rgba(fld?.color||T.ac,0.15)+","+rgba(fld?.color||T.ac,0.04)+")",border:"1px solid "+rgba(fld?.color||T.ac,0.25),borderRadius:14,padding:"1.25rem",marginBottom:"1.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div>
            <h1 style={{...s.h1,marginBottom:4}}>My Classroom</h1>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{background:((fld?.color)||T.ac)+"22",color:(fld?.color)||T.ac,border:"1px solid "+((fld?.color)||T.ac)+"44",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:600,display:"inline-block"}}>{fld?.icon} {fld?.name}</span>
              <span style={{fontSize:11,color:T.t3}}>{isLec?"Lecturer":"Student"} · {userName}</span>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[
              [isLec?submissions.length:mySubs.length,isLec?"Submissions":"Submitted",T.amber],
              [graded.length,"Graded",T.green],
              [avgScore!=null?avgScore+"%":"N/A","Avg Score",avgScore!=null&&avgScore>=70?T.green:avgScore!=null&&avgScore>=50?T.amber:T.red]
            ].map(([v,l,c])=>(
              <div key={l} style={{background:T.bg3,borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                <div style={{fontSize:10,color:T.t3}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:"1.5rem",flexWrap:"wrap"}}>
        {TABS.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{...(tab===id?s.btnP:s.btnS),fontSize:12,padding:"7px 14px"}}>{label}</button>
        ))}
      </div>

      {tab==="assignments"&&(
        <div>
          {isLec&&(
            <div style={{marginBottom:"1rem"}}>
              <button onClick={()=>setShowCreate(!showCreate)} style={{...s.btnP,marginBottom:showCreate?"1rem":0}}>{showCreate?"✕ Cancel":"+ New Assignment"}</button>
              {showCreate&&(
                <div style={{...s.card,border:"1px solid "+rgba(T.ac,0.3)}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Create Assignment</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <div><label style={s.lbl}>TITLE *</label><input style={s.input} value={newA.title} onChange={e=>setNewA(a=>({...a,title:e.target.value}))} placeholder="e.g. Research Paper"/></div>
                    <div><label style={s.lbl}>COURSE CODE</label><input style={s.input} value={newA.course_code} onChange={e=>setNewA(a=>({...a,course_code:e.target.value}))} placeholder="e.g. SAC 301"/></div>
                    <div><label style={s.lbl}>DUE DATE & TIME</label><input style={{...s.input,colorScheme:"dark"}} type="datetime-local" value={newA.due_date} onChange={e=>setNewA(a=>({...a,due_date:e.target.value}))}/></div>
                    <div><label style={s.lbl}>MAX MARKS</label><input style={s.input} type="number" value={newA.max_marks} onChange={e=>setNewA(a=>({...a,max_marks:e.target.value}))}/></div>
                    <div><label style={s.lbl}>TARGET YEAR</label><select style={s.input} value={newA.target_year} onChange={e=>setNewA(a=>({...a,target_year:e.target.value}))}>{["All","Year 1","Year 2","Year 3","Year 4","Masters"].map(y=><option key={y}>{y}</option>)}</select></div>
                  </div>
                  <div style={{marginBottom:10}}><label style={s.lbl}>INSTRUCTIONS (supports $LaTeX$)</label><textarea style={{...s.input,height:80,resize:"vertical"}} value={newA.description} onChange={e=>setNewA(a=>({...a,description:e.target.value}))} placeholder="e.g. Find the derivative of $f(x) = x^2 + 3x$. Show all working."/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                    <div><label style={s.lbl}>ASSIGNMENT TYPE</label>
                      <select style={s.input} value={newA.assignment_type} onChange={e=>setNewA(a=>({...a,assignment_type:e.target.value}))}>
                        <option value="individual">Individual</option>
                        <option value="group">Group</option>
                      </select>
                    </div>
                    {newA.assignment_type==="group"&&<div><label style={s.lbl}>GROUP SIZE</label><input style={s.input} type="number" min={2} max={10} value={newA.group_size} onChange={e=>setNewA(a=>({...a,group_size:parseInt(e.target.value)||3}))}/></div>}
                    <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:20}}>
                      <input type="checkbox" id="allowLate" checked={newA.allow_late} onChange={e=>setNewA(a=>({...a,allow_late:e.target.checked}))}/>
                      <label htmlFor="allowLate" style={{fontSize:12,color:T.t2,cursor:"pointer"}}>Allow late submissions</label>
                    </div>
                  </div>
                  <div style={{...s.card,background:T.bg3,marginBottom:"1rem"}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.t1,marginBottom:"0.75rem"}}>Questions — MCQ with LaTeX support ({newA.questions.length} added)</div>
                    <div style={{fontSize:11,color:T.t3,marginBottom:"0.75rem"}}>Optional: add MCQ questions that students answer directly on the platform. Questions are randomised per student.</div>
                    <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>QUESTION TEXT (use $...$ for LaTeX)</label><input style={s.input} value={newQ.text} onChange={e=>setNewQ({...newQ,text:e.target.value})} placeholder="e.g. What is $\int x^2 dx$?"/></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"0.75rem"}}>
                      <div><label style={s.lbl}>TYPE</label>
                        <select style={s.input} value={newQ.type} onChange={e=>setNewQ({...newQ,type:e.target.value})}>
                          <option value="mcq">Multiple Choice</option>
                          <option value="essay">Open / Essay</option>
                        </select>
                      </div>
                      <div><label style={s.lbl}>MARKS</label><input style={s.input} type="number" value={newQ.marks} onChange={e=>setNewQ({...newQ,marks:parseInt(e.target.value)||5})}/></div>
                    </div>
                    {newQ.type==="mcq"&&(
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"0.75rem"}}>
                        {newQ.options.map((opt,i)=>(
                          <div key={i}><label style={s.lbl}>OPTION {String.fromCharCode(65+i)}</label><input style={s.input} value={opt} onChange={e=>{const ops=[...newQ.options];ops[i]=e.target.value;setNewQ({...newQ,options:ops});}} placeholder={"Option "+String.fromCharCode(65+i)}/></div>
                        ))}
                      </div>
                    )}
                    {newQ.type==="mcq"&&newQ.options.filter(o=>o).length>0&&(
                      <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>CORRECT ANSWER</label>
                        <select style={s.input} value={newQ.correct_answer} onChange={e=>setNewQ({...newQ,correct_answer:parseInt(e.target.value)})}>
                          {newQ.options.map((opt,i)=>opt&&<option key={i} value={i}>Option {String.fromCharCode(65+i)}: {opt.slice(0,40)}</option>)}
                        </select>
                      </div>
                    )}
                    <button onClick={()=>{if(!newQ.text.trim())return;const q={...newQ,id:Date.now(),text:newQ.text.trim()};setNewA(a=>({...a,questions:[...a.questions,q]}));setNewQ({text:"",type:"mcq",options:["","","",""],marks:5,correct_answer:0});}} style={{...s.btnS,fontSize:11,padding:"6px 14px",marginBottom:"0.5rem"}}>+ Add Question</button>
                    {newA.questions.length>0&&(
                      <div style={{marginTop:8,display:"grid",gap:6}}>
                        {newA.questions.map((q,i)=>(
                          <div key={q.id} style={{background:T.bg2,borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div style={{fontSize:12,color:T.t1,flex:1}}>Q{i+1}: {q.text.slice(0,60)}... [{q.type.toUpperCase()} · {q.marks}mk]</div>
                            <button onClick={()=>setNewA(a=>({...a,questions:a.questions.filter(x=>x.id!==q.id)}))} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:14}}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{marginBottom:"1rem"}}>
                    <label style={s.lbl}>ATTACH FILE (optional)</label>
                    <label style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",border:"2px dashed "+(assignFile?T.green:T.bd),borderRadius:8,cursor:"pointer",background:assignFile?rgba(T.green,0.06):T.bg3}}>
                      <span style={{fontSize:22}}>{assignFile?"✅":"📎"}</span>
                      <div><div style={{fontSize:12,color:assignFile?T.green:T.t1}}>{assignFile?assignFile.name:"Tap to attach PDF or document"}</div><div style={{fontSize:10,color:T.t3}}>PDF, Word, image accepted</div></div>
                      <input type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.png,.jpg,.txt" onChange={e=>setAssignFile(e.target.files[0]||null)}/>
                    </label>
                  </div>
                  <button onClick={createAssignment} style={s.btnP} disabled={creating||!newA.title.trim()}>{creating?(editingA?"Saving...":"Posting..."):(editingA?"Save Changes":"Post Assignment")}</button><button onClick={()=>{setShowCreate(false);setEditingA(null);setNewA({title:"",course_code:"",description:"",due_date:"",max_marks:100,target_year:"All",assignment_type:"individual",group_size:3,allow_late:false,questions:[]});}} style={{...s.btnS,marginLeft:8}}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {assignments.length===0?(
            <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
              <div style={{fontSize:48,marginBottom:12}}>📋</div>
              <div style={{fontSize:14,color:T.t2,marginBottom:8}}>{isLec?"No assignments posted yet.":"No assignments yet."}</div>
              <div style={{fontSize:12,color:T.t3}}>{isLec?"Click New Assignment above to get started.":"Your lecturer has not posted any assignments yet."}</div>
            </div>
          ):(
            <div style={{display:"grid",gap:12}}>
              {assignments.map(a=>{
                const mySub=mySubs.find(sub=>sub.assignment_id===a.id);
                const allSubs=submissions.filter(sub=>sub.assignment_id===a.id);
                const days=daysLeft(a.due_date);
                const overdue=isOverdue(a.due_date);
                const urgentColor=overdue?T.red:days!=null&&days<=3?T.amber:T.green;
                const aKey="asgn_"+a.id;
                const aComments=comments[aKey]||[];
                const isOpen=expanded===a.id;
                return(
                  <div key={a.id} style={{...s.card,borderLeft:"4px solid "+urgentColor}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,cursor:"pointer"}} onClick={()=>setExpanded(isOpen?null:a.id)}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                          <span style={{fontSize:14,fontWeight:600,color:T.t1}}>{a.title}</span>
                          {a.course_code&&<span style={{...s.tag(T.ac),fontSize:10}}>{a.course_code}</span>}
                          {!isLec&&mySub&&<span style={{background:(mySub.status==="graded"?T.purple:T.green)+"22",color:mySub.status==="graded"?T.purple:T.green,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600,display:"inline-block"}}>{mySub.status==="graded"?"Graded":"Submitted"}</span>}
                          {!isLec&&!mySub&&overdue&&<span style={{background:T.red+"22",color:T.red,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600,display:"inline-block"}}>Overdue</span>}
                          {!isLec&&!mySub&&!overdue&&<span style={{background:T.amber+"22",color:T.amber,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600,display:"inline-block"}}>Pending</span>}
                        </div>
                        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                          {a.due_date&&<span style={{fontSize:11,color:urgentColor}}>{overdue?"⚠️ Due date passed":days===0?"⚡ Due today!":days===1?"Due tomorrow":"📅 "+days+" days left"} · {new Date(a.due_date).toLocaleDateString("en-KE")} {new Date(a.due_date).toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit",timeZone:"Africa/Nairobi"})}</span>}
                          <span style={{fontSize:11,color:T.t3}}>Max: {a.max_marks} marks</span>
                          {isLec&&<span style={{fontSize:11,color:T.t3}}>{allSubs.length} submission{allSubs.length!==1?"s":""}</span>}
                          {aComments.length>0&&<span style={{fontSize:11,color:T.t3}}>💬 {aComments.length}</span>}
                        </div>
                      </div>
                      <span style={{color:T.t3,fontSize:14,flexShrink:0}}>{isOpen?"▲":"▼"}</span>
                    </div>

                    {isOpen&&(
                      <div style={{marginTop:"1rem",borderTop:"1px solid "+T.bd,paddingTop:"1rem"}}>
                        {a.description&&<div style={{fontSize:13,color:T.t2,lineHeight:1.7,marginBottom:"1rem",background:T.bg3,borderRadius:8,padding:"10px 14px"}}>{a.description}</div>}
                        {a.file_url&&<a href={a.file_url} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:T.ac,textDecoration:"none",background:rgba(T.ac,0.1),borderRadius:8,padding:"6px 14px",marginBottom:"1rem"}}>📎 Download Instructions</a>}

                        {!isLec&&!mySub&&overdue&&(
                          <div style={{background:rgba(T.red,0.06),borderRadius:10,padding:"1rem",marginBottom:"1rem",border:"1px solid "+rgba(T.red,0.2)}}>
                            <div style={{fontSize:13,fontWeight:600,color:T.red,marginBottom:4}}>⛔ Submission Closed</div>
                            <div style={{fontSize:12,color:T.t2}}>The deadline for this assignment has passed. Contact your lecturer if you need an extension.</div>
                          </div>
                        )}
                        {!isLec&&!mySub&&!overdue&&(
                          <div style={{background:rgba(T.ac,0.06),borderRadius:10,padding:"1rem",marginBottom:"1rem",border:"1px solid "+rgba(T.ac,0.2)}}>
                            <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:"0.75rem"}}>Submit Your Work</div>
                            <div style={{marginBottom:"0.75rem"}}>
                              <label style={s.lbl}>ATTACH YOUR FILE *</label>
                              <label style={{display:"flex",alignItems:"center",gap:10,padding:"14px",border:"2px dashed "+(subFile?T.green:T.bd),borderRadius:8,cursor:"pointer",background:subFile?rgba(T.green,0.06):T.bg3,minHeight:56}}>
                                <span style={{fontSize:26}}>{subFile?"✅":"📎"}</span>
                                <div style={{flex:1}}>
                                  <div style={{fontSize:12,color:subFile?T.green:T.t1,fontWeight:subFile?600:400}}>{subFile?subFile.name:"Tap here to attach your file"}</div>
                                  <div style={{fontSize:10,color:T.t3}}>PDF, Word, image or zip accepted</div>
                                </div>
                                <input type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.tex,.txt,.zip" onChange={e=>setSubFile(e.target.files[0]||null)}/>
                              </label>
                            </div>
                            <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>MESSAGE TO LECTURER (optional)</label><textarea style={{...s.input,height:70,resize:"vertical",fontSize:12}} placeholder="Any notes about your submission..." value={subComment} onChange={e=>setSubComment(e.target.value)}/></div>
                            <button onClick={()=>submitAssignment(a.id)} style={{...s.btnP,width:"100%"}} disabled={submitting||!subFile}>{submitting?"Submitting...":"Submit Assignment"}</button>
                            {!subFile&&<div style={{fontSize:10,color:T.amber,marginTop:6,textAlign:"center"}}>Please attach a file to submit.</div>}
                          </div>
                        )}

                        {!isLec&&mySub&&(
                          <div style={{background:rgba(T.green,0.08),border:"1px solid "+rgba(T.green,0.3),borderRadius:10,padding:"1rem",marginBottom:"1rem"}}>
                            <div style={{fontSize:13,fontWeight:600,color:T.green,marginBottom:4}}>✅ Submitted · {new Date(mySub.submitted_at).toLocaleDateString("en-KE")}</div>
                            {mySub.comment&&<div style={{fontSize:12,color:T.t2,marginBottom:6}}>Your note: "{mySub.comment}"</div>}
                            {mySub.file_url&&<a href={mySub.file_url} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:12,color:T.ac,textDecoration:"none",background:rgba(T.ac,0.1),borderRadius:6,padding:"4px 12px",marginBottom:8}}>📎 View your submission</a>}
                            {mySub.status==="graded"&&(
                              <div style={{marginTop:8,background:rgba(T.purple,0.1),borderRadius:8,padding:"12px 14px"}}>
                                <div style={{fontSize:16,fontWeight:700,color:T.purple}}>{mySub.marks}/{a.max_marks} marks · {Math.min(100,Math.round((mySub.marks/a.max_marks)*100))}%</div>
                                {mySub.feedback&&<div style={{fontSize:12,color:T.t2,marginTop:4,fontStyle:"italic"}}>Feedback: "{mySub.feedback}"</div>}
                              </div>
                            )}
                            {mySub.status!=="graded"&&<div style={{fontSize:11,color:T.t3,marginTop:4}}>Awaiting grading...</div>}
                          </div>
                        )}

                        {isLec&&allSubs.length>0&&(
                          <div style={{marginBottom:"1rem"}}>
                            <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:8}}>Submissions ({allSubs.length})</div>
                            <div style={{display:"grid",gap:8}}>
                              {allSubs.map(sub=>(
                                <div key={sub.id} style={{background:T.bg3,borderRadius:10,padding:"12px 14px",border:"1px solid "+T.bd}}>
                                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                                    <div style={{flex:1}}>
                                      <div style={{fontSize:13,fontWeight:600,color:T.t1}}>{sub.student_name}</div>
                                      <div style={{fontSize:11,color:T.t3}}>{new Date(sub.submitted_at).toLocaleDateString("en-KE")} · {sub.status}</div>
                                      {sub.comment&&<div style={{fontSize:12,color:T.t2,marginTop:4,fontStyle:"italic"}}>"{sub.comment}"</div>}
                                      {sub.status==="graded"&&<div style={{fontSize:12,color:T.purple,marginTop:4,fontWeight:600}}>{sub.marks}/{a.max_marks} · {Math.min(100,Math.round((sub.marks/a.max_marks)*100))}%</div>}
                                    </div>
                                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                      {sub.file_url&&<a href={sub.file_url} target="_blank" rel="noreferrer" style={{...s.btnS,textDecoration:"none",fontSize:11,padding:"5px 12px"}}>📎 View</a>}
                                      <button onClick={()=>setGrading(grading===sub.id?null:sub.id)} style={{...s.btnP,fontSize:11,padding:"5px 12px"}}>{sub.status==="graded"?"Re-grade":"Grade"}</button>
                                      {sub.file_url&&sub.file_url.toLowerCase().endsWith(".pdf")&&<button onClick={async()=>{if(addNotif)addNotif("🤖","AI Grading","Analysing submission, please wait...");try{const resp=await fetch(sub.file_url);const blob=await resp.blob();const b64=await new Promise(r=>{const reader=new FileReader();reader.onload=()=>r(reader.result.split(",")[1]);reader.readAsDataURL(blob);});const gemKey=import.meta.env.VITE_GEMINI_KEY;const res=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key="+gemKey,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{inline_data:{mime_type:"application/pdf",data:b64}},{text:"You are an academic examiner. Grade this student submission.\n\nAssignment: "+a.title+"\nInstructions: "+(a.description||"Complete the assignment as instructed.")+"\nMax Marks: "+a.max_marks+"\n\nReturn ONLY this JSON: {\"marks\": NUMBER, \"feedback\": \"STRING\"}"}]}],generationConfig:{maxOutputTokens:500}})});const d=await res.json();const txt=d.candidates?.[0]?.content?.parts?.[0]?.text||"{}";const clean=txt.replace(/```json|```/g,"").trim();const parsed=JSON.parse(clean.slice(clean.indexOf("{"),clean.lastIndexOf("}")+1));setGrading(sub.id);setGradeMarks(Math.min(a.max_marks,Math.max(0,parsed.marks||0)));setGradeFeedback(parsed.feedback||"");if(addNotif)addNotif("✅","AI Grading Done","Review the suggested marks and feedback, then save.");}catch(e){if(addNotif)addNotif("❌","AI Grading Failed",e.message);}}} style={{background:"none",border:"1px solid "+T.purple,color:T.purple,borderRadius:6,cursor:"pointer",fontSize:11,padding:"5px 12px"}}>🤖 AI Grade</button>}
                                    </div>
                                  </div>
                                  {grading===sub.id&&(
                                    <div style={{marginTop:10,display:"grid",gridTemplateColumns:"120px 1fr auto",gap:8,alignItems:"end"}}>
                                      <div><label style={s.lbl}>MARKS/{a.max_marks}</label><input style={s.input} type="number" value={gradeMarks} onChange={e=>setGradeMarks(Math.min(a.max_marks,Math.max(0,e.target.value)))} placeholder="0" min="0" max={a.max_marks}/></div>
                                      <div><label style={s.lbl}>FEEDBACK</label><input style={s.input} value={gradeFeedback} onChange={e=>setGradeFeedback(e.target.value)} placeholder="Write your feedback..."/></div>
                                      <button onClick={()=>gradeSubmission(sub.id)} style={{...s.btnP,padding:"8px 16px"}}>Save</button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{borderTop:"1px solid "+T.bd,paddingTop:"1rem"}}>
                          <div style={{fontSize:12,fontWeight:600,color:T.t2,marginBottom:8}}>💬 Discussion ({aComments.length})</div>
                          {aComments.length>0&&(
                            <div style={{display:"grid",gap:6,marginBottom:10}}>
                              {aComments.map((c,i)=>(
                                <div key={i} style={{background:T.bg3,borderRadius:8,padding:"8px 12px"}}>
                                  <div style={{fontSize:11,fontWeight:600,color:T.ac}}>{c.author_name}</div>
                                  <div style={{fontSize:12,color:T.t2,marginTop:2,lineHeight:1.6}}>{c.content}</div>
                                  <div style={{fontSize:10,color:T.t3,marginTop:2}}>{new Date(c.created_at).toLocaleDateString("en-KE")}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{display:"flex",gap:8}}>
                            <input style={{...s.input,flex:1,fontSize:12}} placeholder="Ask a question or comment..." value={newComment[aKey]||""} onChange={e=>setNewComment(c=>({...c,[aKey]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&!(e.target.value||"").trim()===false)postComment(a.id);}}/>
                            <button onClick={()=>postComment(a.id)} style={{...s.btnP,padding:"8px 14px",fontSize:12}} disabled={sendingComment[aKey]||!(newComment[aKey]||"").trim()}>Send</button>
                          </div>
                        </div>

                        {isLec&&(
                          <div style={{marginTop:"0.75rem",display:"flex",justifyContent:"flex-end"}}>
                            <button onClick={()=>{setEditingA(a.id);setNewA({title:a.title,course_code:a.course_code||"",description:a.description||"",due_date:a.due_date?(()=>{const d=new Date(a.due_date);const pad=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes());})():"",max_marks:a.max_marks||100,target_year:a.target_year||"All",assignment_type:a.assignment_type||"individual",group_size:a.group_size||3,allow_late:a.allow_late||false,questions:[]});setShowCreate(true);}} style={{background:"none",border:"none",color:T.ac,cursor:"pointer",fontSize:12,padding:"4px 8px"}}>✏ Edit Assignment</button><button onClick={async()=>{if(!confirm("Delete this assignment and all its submissions?"))return;const{supabase}=await import("./supabase.js");await supabase.from("assignments").delete().eq("id",a.id);load();}} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:12,padding:"4px 8px"}}>🗑 Delete Assignment</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab==="grades"&&!isLec&&(
        <div>
          {graded.length===0&&gradedExams.length===0?(
            <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
              <div style={{fontSize:48,marginBottom:12}}>🎯</div>
              <div style={{fontSize:14,color:T.t2}}>No graded work yet. Submit assignments to see your grades here.</div>
            </div>
          ):(
            <>
              {graded.length>0&&(
                <>
                  <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:"0.75rem"}}>Assignment Grades</div>
                  <div style={{display:"grid",gap:8,marginBottom:"1.5rem"}}>
                    {graded.map(sub=>{
                      const a=assignments.find(x=>x.id===sub.assignment_id);
                      const pct=a?Math.round((sub.marks/a.max_marks)*100):0;
                      const col=pct>=70?T.green:pct>=50?T.amber:T.red;
                      return(
                        <div key={sub.id} style={{...s.card,borderLeft:"4px solid "+col}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:600,color:T.t1}}>{a?.title||"Assignment"}</div>
                              <div style={{fontSize:11,color:T.t3}}>{a?.course_code} · {new Date(sub.submitted_at).toLocaleDateString("en-KE")}</div>
                              {sub.feedback&&<div style={{fontSize:12,color:T.t2,marginTop:4,fontStyle:"italic"}}>"{sub.feedback}"</div>}
                            </div>
                            <div style={{textAlign:"center",background:rgba(col,0.12),borderRadius:10,padding:"8px 14px",flexShrink:0}}>
                              <div style={{fontSize:20,fontWeight:700,color:col}}>{pct}%</div>
                              <div style={{fontSize:10,color:T.t3}}>{sub.marks}/{a?.max_marks}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {gradedExams.length>0&&(
                <>
                  <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:"0.75rem"}}>Exam Results</div>
                  <div style={{display:"grid",gap:8}}>
                    {gradedExams.map(sub=>{
                      const ex=exams.find(x=>x.id===sub.exam_id);
                      const pct=ex?Math.round((sub.marks/ex.total_marks)*100):0;
                      const col=pct>=70?T.green:pct>=50?T.amber:T.red;
                      return(
                        <div key={sub.id} style={{...s.card,borderLeft:"4px solid "+col}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:600,color:T.t1}}>{ex?.title||"Exam"}</div>
                              <div style={{fontSize:11,color:T.t3}}>{ex?.course_code}</div>
                              {sub.feedback&&<div style={{fontSize:12,color:T.t2,marginTop:4,fontStyle:"italic"}}>"{sub.feedback}"</div>}
                            </div>
                            <div style={{textAlign:"center",background:rgba(col,0.12),borderRadius:10,padding:"8px 14px",flexShrink:0}}>
                              <div style={{fontSize:20,fontWeight:700,color:col}}>{pct}%</div>
                              <div style={{fontSize:10,color:T.t3}}>{sub.marks}/{ex?.total_marks}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {tab==="wellness"&&(
        <div>
          {wellnessResponses.length>0&&(
            <div style={{marginBottom:"1.5rem"}}>
              <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:8}}>Messages from Wellness Team</div>
              <div style={{display:"grid",gap:8}}>
                {wellnessResponses.map(r=>(
                  <div key={r.id} style={{background:rgba(T.blue,0.08),border:"1px solid "+rgba(T.blue,0.25),borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:11,fontWeight:600,color:T.blue,marginBottom:4}}>💙 Wellness Team</div>
                    <div style={{fontSize:13,color:T.t1,lineHeight:1.7}}>{r.message}</div>
                    <div style={{fontSize:10,color:T.t3,marginTop:4}}>{new Date(r.created_at).toLocaleDateString("en-KE")}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {isLec&&(
            <div style={{marginBottom:"1.5rem"}}>
              <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:8}}>Anonymous Student Check-ins ({wellnessCheckins.length})</div>
              {wellnessCheckins.length===0?<div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>No wellness messages yet from students.</div>:(
                <div style={{display:"grid",gap:8}}>
                  {wellnessCheckins.map((w,i)=>(
                    <div key={i} style={{...s.card,borderLeft:"3px solid "+T.green}}>
                      <div style={{fontSize:12,color:T.t2,lineHeight:1.7}}>{w.message}</div>
                      <div style={{fontSize:10,color:T.t3,marginTop:4}}>{new Date(w.created_at).toLocaleDateString("en-KE")} · Anonymous</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!isLec&&(!wellnessDone?(
            <div style={{...s.card,border:"1px solid "+rgba(T.green,0.35)}}>
              <div style={{fontSize:14,fontWeight:600,color:T.green,marginBottom:4}}>💚 Anonymous Wellness Check-in</div>
              <div style={{fontSize:12,color:T.t2,marginBottom:"1rem",lineHeight:1.7}}>This is completely anonymous. Your name is never attached. Share how you are feeling academically, emotionally or personally.</div>
              <div style={{display:"grid",gap:8,marginBottom:"1rem"}}>
                {["I am struggling with coursework and deadlines","I am feeling overwhelmed or stressed","I have personal challenges affecting my studies","I need financial support","I feel isolated or disconnected","I am doing well — just checking in"].map(opt=>(
                  <div key={opt} onClick={()=>setWellnessMsg(opt)} style={{padding:"10px 14px",borderRadius:8,border:"1px solid "+(wellnessMsg===opt?T.green:T.bd),background:wellnessMsg===opt?rgba(T.green,0.1):T.bg3,cursor:"pointer",fontSize:12,color:T.t1}}>
                    {wellnessMsg===opt?"✓ ":""}{opt}
                  </div>
                ))}
              </div>
              <div style={{marginBottom:"1rem"}}><label style={s.lbl}>OR WRITE YOUR OWN</label><textarea style={{...s.input,height:80,resize:"vertical",fontSize:12}} placeholder="Share anything on your mind..." value={wellnessMsg} onChange={e=>setWellnessMsg(e.target.value)}/></div>
              <button onClick={submitWellness} style={{...s.btnP,background:T.green,width:"100%"}} disabled={!wellnessMsg.trim()||wellnessSending}>{wellnessSending?"Sending...":"Send Anonymously"}</button>
            </div>
          ):(
            <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
              <div style={{fontSize:48,marginBottom:12}}>💚</div>
              <div style={{fontSize:16,fontWeight:600,color:T.green,marginBottom:8}}>Thank you for sharing</div>
              <div style={{fontSize:13,color:T.t2,marginBottom:"1.5rem",lineHeight:1.7}}>Your message has been sent anonymously. You are not alone.</div>
              <button onClick={()=>{setWellnessDone(false);setWellnessMsg("");}} style={s.btnS}>Send Another Message</button>
            </div>
          ))}
        </div>
      )}

      {tab==="ratings"&&!isLec&&(
        <div>
          <div style={{fontSize:12,color:T.t2,marginBottom:"1rem",lineHeight:1.7}}>Rate your recent classes anonymously.</div>
          {(!meetings||meetings.length===0)?<div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>No classes to rate yet. Classes will appear here once scheduled.</div>:(
            <div style={{display:"grid",gap:12}}>
              {meetings.slice(0,10).map(m=>(
                <div key={m.id} style={s.card}>
                  <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:2}}>{m.title}</div>
                  <div style={{fontSize:11,color:T.t3,marginBottom:10}}>{m.host} · {new Date(m.scheduled_at).toLocaleDateString("en-KE")} · {m.platform}</div>
                  {ratingDone[m.id]?<div style={{fontSize:12,color:T.green}}>✓ Rated {ratings[m.id]}/5 — Thank you!</div>:(
                    <div>
                      <div style={{display:"flex",gap:8,marginBottom:8}}>
                        {[1,2,3,4,5].map(n=>(
                          <button key={n} onClick={()=>setRatings(r=>({...r,[m.id]:n}))} style={{background:ratings[m.id]>=n?T.amber:"none",border:"1px solid "+(ratings[m.id]>=n?T.amber:T.bd),borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:18,color:ratings[m.id]>=n?"#000":T.t3}}>★</button>
                        ))}
                        {ratings[m.id]&&<span style={{fontSize:11,color:T.t3,alignSelf:"center"}}>{ratings[m.id]}/5</span>}
                      </div>
                      <input style={{...s.input,fontSize:12,marginBottom:8}} placeholder="Optional comment (anonymous)..." value={ratingComment[m.id]||""} onChange={e=>setRatingComment(r=>({...r,[m.id]:e.target.value}))}/>
                      <button onClick={()=>submitRating(m.id)} style={{...s.btnP,fontSize:11,padding:"6px 18px"}} disabled={!ratings[m.id]}>Submit Rating</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="insights"&&isLec&&(
        <LecturerInsights userField={userField} assignments={assignments} submissions={submissions} exams={exams} examSubs={examSubs} meetings={meetings} T={T} s={s}/>
      )}
    </div>
  );
};

const EventsView=({userField,role,userName})=>{
  const T=useT();const s=sx(T);
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:"",description:"",event_type:"bootcamp",date:"",location:"",link:"",field:"all"});
  const [submitting,setSubmitting]=useState(false);
  const isStaff=role==="lecturer"||role==="admin";

  const EVENT_TYPES={bootcamp:{icon:"💻",color:"#3B82F6"},hackathon:{icon:"⚡",color:"#F59E0B"},trip:{icon:"✈️",color:"#10B981"},seminar:{icon:"🎤",color:"#8B5CF6"},workshop:{icon:"🔧",color:"#EF4444"},career:{icon:"💼",color:"#F97316"},social:{icon:"🎉",color:"#EC4899"},other:{icon:"📌",color:"#6B7280"}};

  const load=async()=>{
    setLoading(true);
    const {supabase}=await import("./supabase.js");
    const {data}=await supabase.from("events").select("*").order("date",{ascending:true});
    setEvents(data||[]);setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const submit=async()=>{
    if(!form.title||!form.date)return;
    setSubmitting(true);
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    await supabase.from("events").insert({...form,author_name:userName,author_id:user.id,created_at:new Date().toISOString()});
    setSubmitting(false);setShowForm(false);setForm({title:"",description:"",event_type:"bootcamp",date:"",location:"",link:"",field:"all"});load();
  };

  const upcoming=events.filter(e=>new Date(e.date)>=new Date());
  const past=events.filter(e=>new Date(e.date)<new Date());

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={s.h1}>Events</h1>
          <p style={s.sub}>Bootcamps, hackathons, trips, seminars and more</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={s.btnP}>+ Post Event</button>
      </div>

      {showForm&&(
        <div style={{...s.card,marginBottom:"1.5rem",border:"1px solid "+rgba(T.ac,0.3)}}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Post a New Event</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{gridColumn:"1/-1"}}><label style={s.lbl}>EVENT TITLE</label><input style={s.input} placeholder="e.g. Python Bootcamp 2025" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
            <div><label style={s.lbl}>EVENT TYPE</label>
              <select style={s.input} value={form.event_type} onChange={e=>setForm({...form,event_type:e.target.value})}>
                {Object.keys(EVENT_TYPES).map(t=><option key={t} value={t}>{EVENT_TYPES[t].icon} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div><label style={s.lbl}>DATE</label><input style={s.input} type="datetime-local" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
            <div><label style={s.lbl}>LOCATION / VENUE</label><input style={s.input} placeholder="e.g. JOOUST Main Campus Hall" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div>
            <div><label style={s.lbl}>REGISTER / INFO LINK</label><input style={s.input} placeholder="https://..." value={form.link} onChange={e=>setForm({...form,link:e.target.value})}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={s.lbl}>DESCRIPTION</label><textarea style={{...s.input,height:70,resize:"vertical",fontSize:12}} placeholder="Describe the event..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
            <div><label style={s.lbl}>TARGET FIELD</label>
              <select style={s.input} value={form.field} onChange={e=>setForm({...form,field:e.target.value})}>
                <option value="all">All Fields</option>
                {Object.entries(FIELDS).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={submit} style={s.btnP} disabled={submitting||!form.title||!form.date}>{submitting?"Posting...":"Post Event"}</button>
            <button onClick={()=>setShowForm(false)} style={s.btnS}>Cancel</button>
          </div>
        </div>
      )}

      {loading?<div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>Loading events...</div>:(
        <div>
          {upcoming.length>0&&(
            <div style={{marginBottom:"2rem"}}>
              <div style={{fontSize:12,fontWeight:700,color:T.ac,letterSpacing:1,marginBottom:"1rem",textTransform:"uppercase"}}>Upcoming Events ({upcoming.length})</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                {upcoming.map(ev=>{
                  const et=EVENT_TYPES[ev.event_type]||EVENT_TYPES.other;
                  const daysLeft=Math.ceil((new Date(ev.date)-new Date())/(1000*60*60*24));
                  return(
                    <div key={ev.id} style={{background:T.bg2,borderRadius:12,border:"1px solid "+T.bd,overflow:"hidden"}}>
                      <div style={{background:et.color+"22",borderBottom:"1px solid "+T.bd,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:20}}>{et.icon}</span>
                          <span style={{fontSize:11,fontWeight:700,color:et.color,textTransform:"uppercase"}}>{ev.event_type}</span>
                        </div>
                        <span style={{fontSize:11,fontWeight:600,color:daysLeft<=3?T.red:daysLeft<=7?T.amber:T.green}}>{daysLeft===0?"Today":daysLeft===1?"Tomorrow":daysLeft+" days away"}</span>
                      </div>
                      <div style={{padding:"12px 16px"}}>
                        <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:6}}>{ev.title}</div>
                        {ev.description&&<div style={{fontSize:12,color:T.t2,lineHeight:1.6,marginBottom:8}}>{ev.description}</div>}
                        <div style={{fontSize:11,color:T.t3,marginBottom:4}}>📅 {new Date(ev.date).toLocaleDateString("en-KE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
                        {ev.location&&<div style={{fontSize:11,color:T.t3,marginBottom:4}}>📍 {ev.location}</div>}
                        <div style={{fontSize:11,color:T.t3,marginBottom:10}}>Posted by {ev.author_name}</div>
                        <div style={{display:"flex",gap:8}}>
                          {ev.link&&<a href={ev.link} target="_blank" rel="noreferrer" style={{...s.btnP,textDecoration:"none",fontSize:11,padding:"6px 14px",flex:1,textAlign:"center"}}>Register / Learn More</a>}
                          {isStaff&&<button onClick={async()=>{const {supabase}=await import("./supabase.js");await supabase.from("events").delete().eq("id",ev.id);load();}} style={{background:"none",border:"1px solid "+T.red+"44",borderRadius:6,color:T.red,cursor:"pointer",fontSize:11,padding:"6px 10px"}}>🗑</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {upcoming.length===0&&<div style={{...s.card,textAlign:"center",padding:"2rem"}}>
            <div style={{fontSize:32,marginBottom:8}}>📅</div>
            <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:4}}>No upcoming events</div>
            <div style={{fontSize:12,color:T.t3}}>Be the first to post an event for your peers.</div>
          </div>}
          {past.length>0&&(
            <div>
              <div style={{fontSize:12,fontWeight:700,color:T.t3,letterSpacing:1,marginBottom:"1rem",textTransform:"uppercase"}}>Past Events ({past.length})</div>
              <div style={{display:"grid",gap:8}}>
                {past.slice(0,5).map(ev=>(
                  <div key={ev.id} style={{...s.card,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:0.6}}>
                    <div>
                      <span style={{fontSize:14,marginRight:8}}>{EVENT_TYPES[ev.event_type]?.icon||"📌"}</span>
                      <span style={{fontSize:13,color:T.t1}}>{ev.title}</span>
                    </div>
                    <span style={{fontSize:11,color:T.t3}}>{new Date(ev.date).toLocaleDateString("en-KE")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ServicesView=({userField})=>{
  const T=useT();const s=sx(T);
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("all");

  const SERVICES=[
    {name:"HELB — Higher Education Loans Board",icon:"🎓",cat:"education",desc:"Apply for student loans and bursaries for university education in Kenya.",link:"https://www.helb.co.ke",action:"Apply / Check Status",color:"#1E3A8A",free:true},
    {name:"NITSA — National Industrial Training Authority",icon:"🏭",cat:"education",desc:"Register for industrial attachment and get your NITA certificate.",link:"https://www.nita.go.ke",action:"Register",color:"#065F46",free:true},
    {name:"eCitizen — Kenya Government Portal",icon:"🇰🇪",cat:"government",desc:"Apply for national ID, passport, business registration, driving licence and more.",link:"https://www.ecitizen.go.ke",action:"Open Portal",color:"#1D4ED8",free:false},
    {name:"Kenya Revenue Authority (KRA) — PIN",icon:"📋",cat:"government",desc:"Register for a KRA PIN — required for employment and financial transactions.",link:"https://itax.kra.go.ke",action:"Get KRA PIN",color:"#7C3AED",free:true},
    {name:"NHIF — National Hospital Insurance Fund",icon:"🏥",cat:"health",desc:"Register for NHIF student cover — affordable medical insurance for university students.",link:"https://www.nhif.or.ke",action:"Register",color:"#059669",free:false},
    {name:"NSSF — National Social Security Fund",icon:"🏦",cat:"finance",desc:"Register and contribute to NSSF for retirement benefits.",link:"https://www.nssf.or.ke",action:"Register",color:"#0284C7",free:false},
    {name:"Tala — Instant Mobile Loans",icon:"💰",cat:"lending",desc:"Instant mobile loans up to KES 50,000. No collateral required. Via M-Pesa.",link:"https://tala.co.ke",action:"Apply on App",color:"#7C3AED",free:false},
    {name:"Branch — Mobile Lending",icon:"🌿",cat:"lending",desc:"Borrow up to KES 70,000 instantly on your phone. Flexible repayment.",link:"https://branch.co.ke",action:"Download App",color:"#059669",free:false},
    {name:"Fuliza — M-Pesa Overdraft",icon:"📱",cat:"lending",desc:"M-Pesa overdraft facility. Borrow from KES 10 to KES 70,000 automatically.",link:"https://www.safaricom.co.ke/personal/m-pesa/do-more-with-m-pesa/fuliza-m-pesa",action:"Activate on M-Pesa",color:"#00A550",free:false},
    {name:"KCB M-Pesa — Mobile Banking Loan",icon:"🏦",cat:"lending",desc:"KCB bank loans via M-Pesa. Up to KES 1,000,000 for eligible customers.",link:"https://ke.kcbgroup.com/personal/borrow/kcb-mpesa",action:"Apply via M-Pesa",color:"#1D4ED8",free:false},
    {name:"Stawi — SME Mobile Loan",icon:"📈",cat:"lending",desc:"CBK-regulated mobile loan for small businesses. Up to KES 250,000.",link:"https://www.centralbank.go.ke",action:"Learn More",color:"#D97706",free:false},
    {name:"Zidisha — P2P Microloans",icon:"🌍",cat:"lending",desc:"International peer-to-peer micro-lending platform. Low interest, no collateral.",link:"https://www.zidisha.org",action:"Apply Online",color:"#DC2626",free:false},
    {name:"Kenya Youth Employment & Opportunities",icon:"👩‍💼",cat:"employment",desc:"Government programme for youth employment, internships and entrepreneurship funding.",link:"https://www.kenyayouth.go.ke",action:"Explore Opportunities",color:"#0369A1",free:true},
    {name:"Ajira Digital — Remote Work",icon:"💻",cat:"employment",desc:"Government platform for digital jobs and remote work training for Kenyan youth.",link:"https://www.ajiradigital.go.ke",action:"Get Started",color:"#7C3AED",free:true},
    {name:"Uwezo Fund — Youth & Women",icon:"✊",cat:"finance",desc:"Government fund for youth, women and persons with disability groups. Up to KES 500,000.",link:"https://www.uwezo.go.ke",action:"Apply",color:"#B45309",free:true},
    {name:"Kenya National Qualifications Authority",icon:"📜",cat:"education",desc:"Verify and accredit your qualifications. Important for employment and further studies.",link:"https://www.knqa.go.ke",action:"Verify Certificate",color:"#1E3A8A",free:false},
    {name:"TSC — Teachers Service Commission",icon:"✏️",cat:"employment",desc:"Register as a teacher and apply for TSC posts in Kenya.",link:"https://www.tsc.go.ke",action:"Register",color:"#065F46",free:false},
    {name:"CPA Kenya — ICPAK",icon:"💼",cat:"education",desc:"Register for CPA examinations and professional accounting certification.",link:"https://www.icpak.com",action:"Register for CPA",color:"#0284C7",free:false},
    {name:"Kenya Law — Free Legal Resources",icon:"⚖️",cat:"education",desc:"Free access to Kenya legislation, case law and legal notices.",link:"http://kenyalaw.org",action:"Access for Free",color:"#7C3AED",free:true},
    {name:"M-Shwari — CBA Savings & Loans",icon:"💚",cat:"lending",desc:"Save and borrow via M-Pesa. Lock savings and access emergency loans.",link:"https://www.safaricom.co.ke/personal/m-pesa/do-more-with-m-pesa/m-shwari",action:"Activate on M-Pesa",color:"#059669",free:false},
  ];

  const CATS=[["all","All Services"],["education","Education"],["government","Government"],["health","Health"],["finance","Finance"],["lending","Loans & Lending"],["employment","Employment"]];

  const filtered=SERVICES.filter(s=>{
    if(cat!=="all"&&s.cat!==cat)return false;
    if(search&&!s.name.toLowerCase().includes(search.toLowerCase())&&!s.desc.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  return(
    <div>
      <h1 style={s.h1}>Student Services</h1>
      <p style={s.sub}>Government services, financial assistance, loans and professional registration relevant to Kenyan students</p>

      <div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {CATS.map(([id,label])=>(
            <button key={id} onClick={()=>setCat(id)} style={{...(cat===id?s.btnP:s.btnS),fontSize:11,padding:"6px 12px"}}>{label}</button>
          ))}
        </div>
        <input style={{...s.input,flex:1,minWidth:160,fontSize:12}} placeholder="🔍 Search services..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div style={{fontSize:12,color:T.t3,marginBottom:"1rem"}}>{filtered.length} services · <span style={{color:T.green}}>🆓 Free to use</span> marked below</div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {filtered.map(svc=>(
          <div key={svc.name} style={{background:T.bg2,borderRadius:12,border:"1px solid "+T.bd,overflow:"hidden"}}>
            <div style={{background:svc.color+"22",borderBottom:"1px solid "+T.bd,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>{svc.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:T.t1,lineHeight:1.3}}>{svc.name}</div>
                <div style={{display:"flex",gap:6,marginTop:3}}>
                  <span style={{background:rgba(svc.color,0.2),color:svc.color,borderRadius:4,padding:"1px 7px",fontSize:9,fontWeight:700,textTransform:"uppercase"}}>{svc.cat}</span>
                  {svc.free&&<span style={{background:rgba(T.green,0.15),color:T.green,borderRadius:4,padding:"1px 7px",fontSize:9,fontWeight:700}}>🆓 FREE</span>}
                </div>
              </div>
            </div>
            <div style={{padding:"12px 16px"}}>
              <div style={{fontSize:12,color:T.t2,lineHeight:1.6,marginBottom:12}}>{svc.desc}</div>
              <a href={svc.link} target="_blank" rel="noreferrer" style={{...s.btnP,display:"block",textAlign:"center",textDecoration:"none",fontSize:12,padding:"8px",background:svc.color,border:"none"}}>{svc.action} →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const exportCSV=(filename,headers,rows)=>{
  const csv=[headers.join(","),...rows.map(r=>r.map(c=>'"'+(String(c||"").replace(/"/g,'""'))+'"').join(","))].join("\n");
  const a=document.createElement("a");
  a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
  a.download=filename+".csv";a.click();
};

const exportPDF=(title,subtitle,headers,rows)=>{
  const tableRows=rows.map(r=>"<tr>"+r.map(c=>"<td style='padding:6px 10px;border:1px solid #e0e0e0;font-size:11px;color:#333'>"+String(c||"")+"</td>").join("")+"</tr>").join("");
  const html=`<!DOCTYPE html><html><head><title>${title}</title><style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Arial,sans-serif;background:#fff;color:#1a1a2e;padding:32px;}
    .header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #D4A017;padding-bottom:16px;margin-bottom:24px;}
    .brand{display:flex;flex-direction:column;}
    .logo{font-size:26px;font-weight:800;letter-spacing:3px;color:#1a1a2e;}
    .tagline{font-size:11px;color:#D4A017;font-style:italic;}
    .meta{text-align:right;font-size:11px;color:#888;}
    .report-title{font-size:20px;font-weight:700;color:#1a1a2e;margin-bottom:4px;}
    .report-sub{font-size:13px;color:#555;margin-bottom:20px;}
    .confidential{background:#FFF8E7;border-left:4px solid #D4A017;padding:8px 14px;font-size:11px;color:#856404;margin-bottom:20px;border-radius:0 4px 4px 0;}
    table{width:100%;border-collapse:collapse;margin-top:8px;}
    th{background:#1a1a2e;color:#D4A017;padding:9px 10px;text-align:left;font-size:11px;font-weight:600;letter-spacing:0.5px;}
    tr:nth-child(even){background:#f9f9f9;}
    tr:hover{background:#f0f4ff;}
    .footer{margin-top:24px;padding-top:12px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:10px;color:#aaa;}
    .print-btn{position:fixed;bottom:24px;right:24px;background:#D4A017;color:#000;border:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);}
    @media print{.print-btn{display:none;} body{padding:16px;}}
  </style></head><body>
    <div class="header">
      <div class="brand">
        <div class="logo">AKADIMIA</div>
        <div class="tagline">Ujuzi Bila Mipaka — Every Field. Every Student. One Platform.</div>
      </div>
      <div class="meta">
        <div>Generated: ${new Date().toLocaleDateString("en-KE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        <div>${new Date().toLocaleTimeString("en-KE")}</div>
        <div>akadimia.co.ke</div>
      </div>
    </div>
    <div class="report-title">${title}</div>
    <div class="report-sub">${subtitle}</div>
    <div class="confidential">CONFIDENTIAL — This document contains personal data protected under the Kenya Data Protection Act 2019. Authorised personnel only.</div>
    <table><thead><tr>${headers.map(h=>"<th>"+h+"</th>").join("")}</tr></thead><tbody>${tableRows}</tbody></table>
    <div class="footer">
      <span>AKADIMIA Academic Platform — akadimia.co.ke</span>
      <span>Total records: ${rows.length}</span>
      <span>Kenya Data Protection Act 2019 compliant</span>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
  </body></html>`;
  const w=window.open("","_blank");
  w.document.write(html);w.document.close();
};

const FeedbackAdminView=({T,s})=>{
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");
  useEffect(()=>{(async()=>{
    const {supabase}=await import("./supabase.js");
    const {data}=await supabase.from("feedback").select("*").order("created_at",{ascending:false});
    setItems(data||[]);setLoading(false);
  })();},[]);
  const cats={general:"💬",bug:"🐛",feature:"✨",content:"📚",ux:"🎨",praise:"⭐"};
  const filtered=filter==="all"?items:items.filter(i=>i.category===filter);
  return(
    <div>
      <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>User Feedback ({items.length})</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem"}}>
        {[["all","All"],["bug","🐛 Bugs"],["feature","✨ Features"],["general","💬 General"],["praise","⭐ Praise"],["ux","🎨 Design"],["content","📚 Content"]].map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{...(filter===id?s.btnP:s.btnS),fontSize:11,padding:"5px 10px"}}>{label}</button>
        ))}
      </div>
      {loading?<div style={{color:T.t3}}>Loading...</div>:filtered.length===0?<div style={{color:T.t3}}>No feedback yet.</div>:(
        <div style={{display:"grid",gap:8}}>
          {filtered.map(f=>(
            <div key={f.id} style={{background:T.bg2,borderRadius:10,padding:"12px 16px",border:"1px solid "+T.bd}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:16}}>{cats[f.category]||"💬"}</span>
                  <span style={{fontSize:12,fontWeight:600,color:T.t1}}>{f.user_name||"Anonymous"}</span>
                  <span style={{background:T.bg3,borderRadius:4,padding:"1px 8px",fontSize:10,color:T.t3,textTransform:"uppercase"}}>{f.category}</span>
                </div>
                <span style={{fontSize:10,color:T.t3}}>{new Date(f.created_at).toLocaleDateString("en-KE")}</span>
              </div>
              <div style={{fontSize:12,color:T.t2,lineHeight:1.7}}>{f.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminView=()=>{
  const T=useT();const t=useLang();const s=sx(T);
  const [editUser,setEditUser]=useState(null);
  const [editData,setEditData]=useState({});
  const [msgUser,setMsgUser]=useState(null);
  const [msgText,setMsgText]=useState("");
  const [msgSending,setMsgSending]=useState(false);
  const [pending,setPending]=useState([]);
  const [approved,setApproved]=useState([]);
  const [rejected,setRejected]=useState([]);
  const [atab,setAtab]=useState("approvals");
  const [loading,setLoading]=useState(true);

  const loadUsers=async()=>{
    setLoading(true);
    const {supabase}=await import("./supabase.js");
    const {data:pend}=await supabase.from("profiles").select("*").eq("status","pending").order("created_at",{ascending:false});
    const {data:appr}=await supabase.from("profiles").select("*").eq("status","approved").order("created_at",{ascending:false});
    const {data:rejt}=await supabase.from("profiles").select("*").eq("status","rejected").order("created_at",{ascending:false});
    setPending(pend||[]);
    setApproved(appr||[]);
    setRejected(rejt||[]);
    setLoading(false);
  };

  useEffect(()=>{loadUsers();},[]);

  const approve=async(id)=>{
    const user=pending.find(u=>u.id===id);
    // Update UI immediately
    setPending(p=>p.filter(u=>u.id!==id));
    if(user) setApproved(a=>[{...user,status:"approved"},...a]);
    // Update database
    const {supabase}=await import("./supabase.js");
    await supabase.from("profiles").update({status:"approved"}).eq("id",id);
    // Send email
    if(user&&user.email){
      try{
        const {sendApprovalEmail}=await import("./email.js");
        const field=(FIELDS[user.field]&&FIELDS[user.field].name)||user.field||"your field";
        await sendApprovalEmail(user.email,user.full_name||"Student",field);
      }catch(e){console.error("Email error:",e);}
    }
  };

  const reject=async(id)=>{
    const user=pending.find(u=>u.id===id);
    // Update UI immediately
    setPending(p=>p.filter(u=>u.id!==id));
    if(user) setRejected(r=>[{...user,status:"rejected"},...r]);
    // Update database
    const {supabase}=await import("./supabase.js");
    await supabase.from("profiles").update({status:"rejected"}).eq("id",id);
    // Send email
    if(user&&user.email){
      try{
        const {sendRejectionEmail}=await import("./email.js");
        await sendRejectionEmail(user.email,user.full_name||"Student");
      }catch(e){console.error("Email error:",e);}
    }
  };

  const changeRole=async(id,role)=>{
    const {supabase}=await import("./supabase.js");
    await supabase.from("profiles").update({role}).eq("id",id);
    loadUsers();
  };

  const atabs=[["approvals","Pending ("+pending.length+")"],["approved","Approved ("+approved.length+")"],["rejected","Rejected ("+rejected.length+")"],["roles","Roles"],["feedback","💬 Feedback"],["security","Security"]];
  const secControls=[["Registration Approval",true,T.green],["2-Factor Authentication",true,T.green],["Email Verification",true,T.green],["Audit Trail Logging",true,T.green],["Rate Limiting",true,T.green],["Session Timeout (30min)",true,T.green],["Role-Based Access (RBAC)",true,T.green],["AES-256 Encryption",true,T.green],["Institutional Email Only",true,T.green],["IP Allowlisting",false,T.amber]];

  const UserCard=({u,actions})=>(
    <div style={{...s.card,borderLeft:`3px solid ${u.status==="pending"?T.amber:u.status==="approved"?T.green:T.red}`}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
        <Av name={u.full_name||"?"} size={44} bg={u.role==="lecturer"||u.role==="admin"?T.blue:T.purple}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
            <span style={{fontSize:14,fontWeight:600,color:T.t1}}>{u.full_name||"Unknown"}</span>
            <Pill text={u.role||"student"} color={u.role==="lecturer"||u.role==="admin"?T.blue:T.purple}/>
            {FIELDS[u.field]&&<Pill text={FIELDS[u.field].icon+" "+FIELDS[u.field].name} color={FIELDS[u.field].color}/>}
          </div>
          <div style={{fontSize:12,color:T.t3}}>
            {u.student_id&&<span style={{marginRight:8}}>{u.student_id}</span>}
            {new Date(u.created_at).toLocaleDateString()}
          </div>
        </div>
        {actions&&<div style={{display:"flex",gap:8,flexShrink:0}}>{actions(u)}</div>}
      </div>
    </div>
  );

  return(
    <div>
      <h1 style={s.h1}>{t("admin")}</h1>
      <p style={s.sub}>User management · Approvals · Roles · Security</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.25rem"}}>
        <StatCard label="Pending" value={pending.length} sub="Awaiting review" color={T.amber} icon="W"/>
        <StatCard label="Active Users" value={approved.length} sub="Approved" color={T.green} icon="U"/>
        <StatCard label="Fields" value={Object.keys(FIELDS).length} sub="Academic disciplines" color={T.blue} icon="F"/>
        <StatCard label="Security" value="OK" sub="All systems nominal" color={T.teal} icon="S"/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:"1.25rem",flexWrap:"wrap"}}>
        {atabs.map(at=>(
          <button key={at[0]} onClick={()=>setAtab(at[0])} style={{...(atab===at[0]?s.btnP:s.btnS),fontSize:12,padding:"7px 14px"}}>{at[1]}</button>
        ))}
      </div>
      {loading&&<div style={{...s.card,textAlign:"center",padding:"2rem",color:T.t3}}>Loading users from database...</div>}
      {msgUser&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:T.bg1,borderRadius:16,padding:"1.5rem",width:"100%",maxWidth:480,border:"1px solid "+T.bd}}>
            <div style={{fontSize:16,fontWeight:700,color:T.t1,marginBottom:4}}>💬 Message — {msgUser.full_name}</div>
            <div style={{fontSize:11,color:T.t3,marginBottom:"1rem"}}>{msgUser.student_id?"Adm: "+msgUser.student_id:"No admission number"} · {msgUser.field} · {msgUser.year_level||"Year not set"}</div>
            <div style={{fontSize:11,fontWeight:600,color:T.t3,marginBottom:6}}>QUICK PRESETS</div>
            <div style={{display:"grid",gap:5,marginBottom:"1rem"}}>
              {[
                "Please update your admission number in your profile — it appears to be missing or incorrect.",
                "Your full name on the system does not match your admission records. Please contact admin to correct it.",
                "Please confirm your field of study — you appear to be registered under the wrong programme.",
                "Your year of study needs to be updated. Please contact admin or visit the office.",
                "Your registration is incomplete. Please provide your official student ID to admin.",
                "Action required: Please visit the academic office to verify your registration details.",
              ].map((preset,i)=>(
                <button key={i} onClick={()=>setMsgText(preset)} style={{...s.btnS,fontSize:11,textAlign:"left",padding:"7px 10px",borderColor:msgText===preset?T.purple:T.bd,color:msgText===preset?T.purple:T.t2}}>{preset}</button>
              ))}
            </div>
            <label style={s.lbl}>CUSTOM MESSAGE</label>
            <textarea style={{...s.input,height:80,resize:"vertical",fontSize:12,marginBottom:"1rem"}} placeholder="Type a custom message to this student..." value={msgText} onChange={e=>setMsgText(e.target.value)}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={async()=>{
                if(!msgText.trim())return;
                setMsgSending(true);
                const {supabase}=await import("./supabase.js");
                await supabase.from("admin_messages").insert({
                  recipient_id:msgUser.id,
                  recipient_name:msgUser.full_name,
                  sender_name:"Admin",
                  message:msgText.trim(),
                  read:false
                });
                setMsgSending(false);setMsgUser(null);setMsgText("");
                alert("Message sent to "+msgUser.full_name);
              }} style={s.btnP} disabled={!msgText.trim()||msgSending}>{msgSending?"Sending...":"Send Message"}</button>
              <button onClick={()=>{setMsgUser(null);setMsgText("");}} style={s.btnS}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {editUser&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:T.bg1,borderRadius:16,padding:"1.5rem",width:"100%",maxWidth:500,border:"1px solid "+T.bd}}>
            <div style={{fontSize:16,fontWeight:700,color:T.t1,marginBottom:"1rem"}}>Edit User — {editUser.full_name}</div>
            <div style={{display:"grid",gap:10,marginBottom:"1rem"}}>
              <div><label style={s.lbl}>FULL NAME</label><input style={s.input} value={editData.full_name||""} onChange={e=>setEditData({...editData,full_name:e.target.value})}/></div>
              <div><label style={s.lbl}>ADMISSION / STUDENT NUMBER</label><input style={s.input} value={editData.student_id||""} onChange={e=>setEditData({...editData,student_id:e.target.value})}/></div>
              <div><label style={s.lbl}>FIELD OF STUDY</label>
                <select style={s.input} value={editData.field||""} onChange={e=>setEditData({...editData,field:e.target.value})}>
                  {Object.entries(FIELDS).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={s.lbl}>YEAR LEVEL</label>
                  <select style={s.input} value={editData.year_level||""} onChange={e=>setEditData({...editData,year_level:e.target.value})}>
                    <option value="">Not set</option>
                    {["Year 1","Year 2","Year 3","Year 4","Masters Sem 1","Masters Sem 2","PhD Year 1","PhD Year 2","PhD Year 3+"].map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
                <div><label style={s.lbl}>ROLE</label>
                  <select style={s.input} value={editData.role||"student"} onChange={e=>setEditData({...editData,role:e.target.value})}>
                    {["student","lecturer","researcher","admin"].map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={s.lbl}>PROGRAMME LEVEL</label>
                <select style={s.input} value={editData.programme_level||"undergraduate"} onChange={e=>setEditData({...editData,programme_level:e.target.value})}>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="masters">Masters</option>
                  <option value="phd">PhD</option>
                  <option value="tvet">TVET</option>
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={async()=>{
                const {supabase}=await import("./supabase.js");
                await supabase.from("profiles").update({full_name:editData.full_name,student_id:editData.student_id,field:editData.field,year_level:editData.year_level,role:editData.role,programme_level:editData.programme_level}).eq("id",editUser.id);
                setEditUser(null);loadUsers();
              }} style={s.btnP}>Save Changes</button>
              <button onClick={()=>setEditUser(null)} style={s.btnS}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {!loading&&atab==="feedback"&&(
        <FeedbackAdminView T={T} s={s}/>
      )}
      {atab==="approvals"&&(pending.length===0?(
        <div style={{...s.card,textAlign:"center",padding:"2.5rem"}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <div style={{fontSize:14,color:T.t2}}>No pending registrations.</div>
        </div>
      ):(
        <div style={{display:"grid",gap:10}}>
          {pending.map(u=>(
            <UserCard key={u.id} u={u} actions={u=>(<>
              <button onClick={()=>approve(u.id)} style={{...s.btnP,fontSize:12,padding:"7px 16px"}}>Approve</button>
              <button onClick={()=>reject(u.id)} style={{...s.btnD,fontSize:12,padding:"7px 16px"}}>Reject</button>
              <button onClick={async()=>{if(!confirm("Delete "+u.full_name+" completely from AKADIMIA? They will be able to re-register with the same email."))return;const {supabase}=await import("./supabase.js");const res=await fetch(import.meta.env.VITE_SUPABASE_URL+"/functions/v1/delete-user",{method:"POST",headers:{"Content-Type":"application/json","apikey":import.meta.env.VITE_SUPABASE_KEY,"Authorization":"Bearer "+import.meta.env.VITE_SUPABASE_KEY},body:JSON.stringify({userId:u.id})});const result=await res.json();if(result.success){loadUsers();}else{alert("Delete failed: "+result.error);}}} style={{background:"none",border:"1px solid "+T.red+"55",borderRadius:6,color:T.red,cursor:"pointer",fontSize:12,padding:"7px 10px"}}>🗑</button>
            </>)}/>
          ))}
        </div>
      ))}
      {!loading&&atab==="approved"&&(approved.length===0?(
        <div style={{...s.card,textAlign:"center",padding:"2rem",fontSize:13,color:T.t2}}>No approved users yet.</div>
      ):(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap"}}>
            <button onClick={()=>exportCSV("AKADIMIA_Students_"+new Date().toISOString().slice(0,10),["Full Name","Email","Field","Year Level","Programme","Role","Status"],approved.map(u=>[u.full_name,u.email,FIELDS[u.field]?.name||u.field,u.year_level||"",u.programme_level||"",u.role,u.status]))} style={{...s.btnS,fontSize:11,padding:"6px 14px"}}>📥 Export CSV</button>
            <button onClick={()=>exportPDF("Student Register","All Approved Students — AKADIMIA",["Full Name","Email","Field","Year Level","Role"],approved.map(u=>[u.full_name,u.email,FIELDS[u.field]?.name||u.field,u.year_level||"N/A",u.role]),"AKADIMIA_Students")} style={{...s.btnS,fontSize:11,padding:"6px 14px"}}>📄 Export PDF</button>
            <span style={{fontSize:11,color:T.t3,alignSelf:"center"}}>{approved.length} students total</span>
          </div>
          <div style={{display:"grid",gap:10}}>
          {approved.map(u=>(
            <UserCard key={u.id} u={u} actions={u=>(<>
              <select defaultValue={u.role} onChange={e=>changeRole(u.id,e.target.value)} style={{...s.input,fontSize:12,padding:"6px 10px",width:"auto"}} onClick={e=>e.stopPropagation()}>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
                <option value="researcher">Researcher</option>
              </select>
              <button onClick={()=>{setEditUser(u);setEditData({full_name:u.full_name,student_id:u.student_id||"",field:u.field,year_level:u.year_level||"",programme_level:u.programme_level||"undergraduate",role:u.role});}} style={{background:"none",border:"1px solid "+T.blue+"55",borderRadius:6,color:T.blue,cursor:"pointer",fontSize:11,padding:"6px 10px"}}>✏️ Edit</button>
              <button onClick={()=>setMsgUser(u)} style={{background:"none",border:"1px solid "+T.purple+"55",borderRadius:6,color:T.purple,cursor:"pointer",fontSize:11,padding:"6px 10px"}}>💬 Message</button>
              <button onClick={async()=>{if(!confirm("Remove "+u.full_name+" completely? They can re-register with the same email afterwards."))return;const res2=await fetch(import.meta.env.VITE_SUPABASE_URL+"/functions/v1/delete-user",{method:"POST",headers:{"Content-Type":"application/json","apikey":import.meta.env.VITE_SUPABASE_KEY,"Authorization":"Bearer "+import.meta.env.VITE_SUPABASE_KEY},body:JSON.stringify({userId:u.id})});const result2=await res2.json();if(result2.success){loadUsers();}else{alert("Delete failed: "+result2.error);}}} style={{background:"none",border:"1px solid "+T.red+"55",borderRadius:6,color:T.red,cursor:"pointer",fontSize:12,padding:"6px 10px"}}>🗑 Remove</button>
              <button onClick={()=>reject(u.id)} style={{...s.btnD,fontSize:12,padding:"7px 12px"}}>Revoke</button>
            </>)}/>
          ))}
          </div>
        </div>
      ))}
      {!loading&&atab==="rejected"&&(rejected.length===0?(
        <div style={{...s.card,textAlign:"center",padding:"2rem",fontSize:13,color:T.t2}}>No rejected users.</div>
      ):(
        <div style={{display:"grid",gap:10}}>
          {rejected.map(u=>(
            <UserCard key={u.id} u={u} actions={u=>(<>
              <button onClick={()=>approve(u.id)} style={{...s.btnP,fontSize:12,padding:"7px 16px"}}>Re-approve</button>
            </>)}/>
          ))}
        </div>
      ))}
      {atab==="roles"&&(
        <div style={{...s.card}}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Role Definitions</div>
          {[["student","Can view materials, submit assignments, take exams",T.purple],["lecturer","Can upload materials, create exams, grade assignments",T.blue],["researcher","Can submit research, access research portal",T.teal],["admin","Full platform access and user management",T.red]].map(r=>(
            <div key={r[0]} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.bd}`}}>
              <Pill text={r[0]} color={r[2]}/>
              <span style={{fontSize:13,color:T.t2}}>{r[1]}</span>
            </div>
          ))}
        </div>
      )}
      {atab==="security"&&(
        <div style={{...s.card}}>
          <div style={{marginBottom:"1.5rem",padding:"1rem",background:rgba(T.green,0.08),border:"1px solid "+rgba(T.green,0.25),borderRadius:8}}>
            <div style={{fontSize:13,fontWeight:600,color:T.green,marginBottom:6}}>🔒 Data Protection — Kenya Data Protection Act 2019</div>
            <div style={{fontSize:12,color:T.t2,lineHeight:1.8}}>AKADIMIA collects and processes personal data including name, email, student ID, field of study, year level, submitted assignments and exam responses. This data is used solely for academic administration. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Data is stored on Supabase EU-West servers. Users may request deletion via their institution administrator. AKADIMIA does not sell or share personal data with third parties.</div>
          </div>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Security Controls</div>
          <div style={{display:"grid",gap:8}}>
            {secControls.map((sc,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.bd}`}}>
                <span style={{fontSize:13,color:T.t1}}>{sc[0]}</span>
                <span style={{fontSize:11,fontWeight:600,color:sc[2],background:rgba(sc[2],0.12),borderRadius:6,padding:"3px 10px"}}>{sc[1]?"ACTIVE":"INACTIVE"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const SettingsView=({lang,setLang,themeId,setThemeId,userField,setUserField,fontSize,setFontSize,highContrast,setHighContrast,userId,userName})=>{
  const [profTab,setProfTab]=useState("appearance");
  const [bio,setBio]=useState("");
  const [phone,setPhone]=useState("");
  const [linkedin,setLinkedin]=useState("");
  const [github,setGithub]=useState("");
  const [twitter,setTwitter]=useState("");
  const [avatarUrl,setAvatarUrl]=useState("");
  const [uploading,setUploading]=useState(false);
  const [profSaved,setProfSaved]=useState(false);

  useEffect(()=>{
    if(!userId)return;
    (async()=>{
      const {supabase}=await import("./supabase.js");
      const {data}=await supabase.from("profiles").select("bio,phone,linkedin,github,twitter,avatar_url").eq("id",userId).single();
      if(data){setBio(data.bio||"");setPhone(data.phone||"");setLinkedin(data.linkedin||"");setGithub(data.github||"");setTwitter(data.twitter||"");setAvatarUrl(data.avatar_url||"");}
    })();
  },[userId]);

  const saveProfile=async()=>{
    const {supabase}=await import("./supabase.js");
    await supabase.from("profiles").update({bio,phone,linkedin,github,twitter,avatar_url:avatarUrl}).eq("id",userId);
    setProfSaved(true);setTimeout(()=>setProfSaved(false),2500);
  };

  const uploadAvatar=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    setUploading(true);
    const {supabase}=await import("./supabase.js");
    const path="avatars/"+userId+"/"+Date.now()+"_"+file.name;
    const {data}=await supabase.storage.from("course-materials").upload(path,file,{upsert:true});
    if(data){const {data:url}=supabase.storage.from("course-materials").getPublicUrl(path);setAvatarUrl(url.publicUrl);}
    setUploading(false);
  };
  const T=useT();const t=useLang();const s=sx(T);
  const langOpts=Object.entries(LANGS);
  const themeOpts=Object.values(THEMES);
  const fieldOpts=Object.values(FIELDS);
  return(
    <div>
      <h1 style={s.h1}>{t("settings")}</h1>
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem",flexWrap:"wrap"}}>
        {[["appearance","🎨 Appearance"],["profile","👤 My Profile"],["security","🔒 Security & Data"]].map(([id,label])=>(
          <button key={id} onClick={()=>setProfTab(id)} style={{...(profTab===id?s.btnP:s.btnS),fontSize:12}}>{label}</button>
        ))}
      </div>
      {profTab==="profile"&&(
        <div style={{display:"grid",gap:"1rem",marginBottom:"1.5rem"}}>
          <div style={s.card}>
            <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Profile Photo</div>
            <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
              <div style={{width:80,height:80,borderRadius:"50%",background:T.bg3,border:"2px solid "+T.ac,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>
                {avatarUrl?<img src={avatarUrl} alt="av" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(userName||"U")[0].toUpperCase()}
              </div>
              <div>
                <label style={{...s.btnS,fontSize:12,cursor:"pointer",display:"inline-block",padding:"7px 14px"}}>
                  {uploading?"Uploading...":"📷 Upload Photo"}
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={uploadAvatar} disabled={uploading}/>
                </label>
                <div style={{fontSize:11,color:T.t3,marginTop:4}}>JPG, PNG or WebP.</div>
              </div>
            </div>
          </div>
          <div style={s.card}>
            <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>About Me</div>
            <div style={{display:"grid",gap:10}}>
              <div><label style={s.lbl}>SHORT BIO</label><textarea style={{...s.input,height:70,resize:"vertical",fontSize:12}} placeholder="Tell others a bit about yourself..." value={bio} onChange={e=>setBio(e.target.value)}/></div>
              <div><label style={s.lbl}>PHONE / WHATSAPP</label><input style={s.input} placeholder="+254 7xx xxx xxx" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
            </div>
          </div>
          <div style={s.card}>
            <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Social & Professional Links</div>
            <div style={{display:"grid",gap:10}}>
              <div><label style={s.lbl}>LINKEDIN</label><input style={s.input} placeholder="https://linkedin.com/in/yourname" value={linkedin} onChange={e=>setLinkedin(e.target.value)}/></div>
              <div><label style={s.lbl}>GITHUB</label><input style={s.input} placeholder="https://github.com/yourname" value={github} onChange={e=>setGithub(e.target.value)}/></div>
              <div><label style={s.lbl}>TWITTER / X</label><input style={s.input} placeholder="https://x.com/yourname" value={twitter} onChange={e=>setTwitter(e.target.value)}/></div>
            </div>
          </div>
          {profSaved&&<div style={{background:rgba(T.green,0.1),border:"1px solid "+rgba(T.green,0.3),borderRadius:8,padding:"10px 14px",fontSize:12,color:T.green}}>✓ Profile saved.</div>}
          <button onClick={saveProfile} style={s.btnP}>Save Profile</button>
        </div>
      )}
      {profTab==="security"&&<div style={{marginBottom:"1.5rem"}}><div style={{...s.card,border:"1px solid "+rgba(T.red,0.2)}}><div style={{fontSize:13,fontWeight:600,color:T.red,marginBottom:8}}>🔒 Data & Privacy</div><div style={{fontSize:12,color:T.t2,lineHeight:1.7}}>Your data is protected under the Kenya Data Protection Act 2019. AKADIMIA does not sell your personal data. To request deletion of your account and data, contact your institution administrator.</div></div></div>}
      {profTab==="appearance"&&(<div><p style={s.sub}>Language · Theme · Field of Study</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Language</div>
          <div style={{display:"grid",gap:7}}>
            {langOpts.map(lo=>(
              <div key={lo[0]} onClick={()=>{setLang(lo[0]);localStorage.setItem("ak_lang",lo[0]);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:`1px solid ${lang===lo[0]?T.ac:T.bd}`,background:lang===lo[0]?rgba(T.ac,0.1):T.bg3,cursor:"pointer"}}>
                <span style={{fontSize:18}}>{lo[1].flag}</span>
                <span style={{fontSize:12,fontWeight:lang===lo[0]?600:400,color:lang===lo[0]?T.ac:T.t1,flex:1}}>{lo[1].name}</span>
                {lang===lo[0]&&<span style={{color:T.ac}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Colour Theme</div>
          <div style={{display:"grid",gap:7}}>
            {themeOpts.map(th=>(
              <div key={th.id} onClick={()=>setThemeId(th.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:`1px solid ${themeId===th.id?T.ac:T.bd}`,background:themeId===th.id?rgba(T.ac,0.1):T.bg3,cursor:"pointer"}}>
                <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${th.ac},${th.acL})`,flexShrink:0}}/>
                <div style={{fontSize:12,fontWeight:themeId===th.id?600:400,color:themeId===th.id?T.ac:T.t1}}>{th.emoji} {th.name}</div>
                {themeId===th.id&&<span style={{color:T.ac,marginLeft:"auto"}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Field of Study</div>
          <div style={{display:"grid",gap:7}}>
            {fieldOpts.map(f=>(
              <div key={f.id} onClick={()=>setUserField(f.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,border:`1px solid ${userField===f.id?f.color:T.bd}`,background:userField===f.id?rgba(f.color,0.14):T.bg3,cursor:"pointer"}}>
                <span style={{fontSize:16}}>{f.icon}</span>
                <span style={{fontSize:11,fontWeight:userField===f.id?600:400,color:userField===f.id?f.color:T.t1,flex:1}}>{f.name}</span>
                {userField===f.id&&<span style={{color:f.color,fontSize:12}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{...s.card,marginTop:16}}>
        <div style={{fontSize:14,fontWeight:500,color:T.t1,marginBottom:"1rem"}}>Accessibility</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={{fontSize:12,color:T.t2,marginBottom:8}}>Text size</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>setFontSize(f=>Math.max(12,f-1))} style={{...s.btnS,padding:"6px 14px",fontSize:16}}>A-</button>
              <span style={{fontSize:13,color:T.t1,minWidth:40,textAlign:"center"}}>{fontSize}px</span>
              <button onClick={()=>setFontSize(f=>Math.min(20,f+1))} style={{...s.btnS,padding:"6px 14px",fontSize:16}}>A+</button>
            </div>
          </div>
          <div>
            <div style={{fontSize:12,color:T.t2,marginBottom:8}}>High contrast mode</div>
            <div onClick={()=>setHighContrast(h=>!h)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:`1px solid ${highContrast?T.ac:T.bd}`,background:highContrast?rgba(T.ac,0.1):T.bg3,cursor:"pointer"}}>
              <div style={{width:36,height:20,borderRadius:10,background:highContrast?T.ac:T.bg4,position:"relative",transition:"background 0.2s"}}>
                <div style={{position:"absolute",top:2,left:highContrast?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
              </div>
              <span style={{fontSize:12,color:T.t1}}>{highContrast?"On":"Off"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>)}
  </div>
  );
};

const FeedbackModal=({userId,userName})=>{
  const T=useT();const s=sx(T);
  const [open,setOpen]=useState(false);
  const [cat,setCat]=useState("general");
  const [msg,setMsg]=useState("");
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);

  useEffect(()=>{
    const handler=()=>setOpen(true);
    document.addEventListener('openFeedback',handler);
    return()=>document.removeEventListener('openFeedback',handler);
  },[]);

  const send=async()=>{
    if(!msg.trim())return;
    setSending(true);
    const {supabase}=await import("./supabase.js");
    await supabase.from("feedback").insert({user_id:userId,user_name:userName,category:cat,message:msg.trim()});
    setSending(false);setSent(true);setMsg("");
    setTimeout(()=>{setSent(false);setOpen(false);},2500);
  };

  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:T.bg1,borderRadius:16,padding:"1.5rem",width:"100%",maxWidth:460,border:"1px solid "+T.bd,boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:T.t1}}>💬 Share Your Feedback</div>
            <div style={{fontSize:11,color:T.t3}}>Your feedback shapes what gets built next</div>
          </div>
          <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        {sent?(
          <div style={{textAlign:"center",padding:"1.5rem"}}>
            <div style={{fontSize:32,marginBottom:8}}>🙏</div>
            <div style={{fontSize:14,fontWeight:600,color:T.green}}>Thank you! Feedback received.</div>
            <div style={{fontSize:12,color:T.t3,marginTop:4}}>Every submission is read and acted on.</div>
          </div>
        ):(
          <>
            <label style={s.lbl}>CATEGORY</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem"}}>
              {[["general","💬 General"],["bug","🐛 Bug Report"],["feature","✨ Feature Request"],["content","📚 Content"],["ux","🎨 Design / UX"],["praise","⭐ Praise"]].map(([id,label])=>(
                <button key={id} onClick={()=>setCat(id)} style={{...(cat===id?s.btnP:s.btnS),fontSize:10,padding:"5px 10px"}}>{label}</button>
              ))}
            </div>
            <label style={s.lbl}>YOUR MESSAGE</label>
            <textarea style={{...s.input,height:100,resize:"vertical",fontSize:12,marginBottom:"1rem"}} placeholder="Tell us what you think, what's broken, or what you'd love to see..." value={msg} onChange={e=>setMsg(e.target.value)}/>
            <div style={{fontSize:11,color:T.t3,marginBottom:"1rem"}}>Submitted as {userName||"Anonymous"}. Responses go to the admin team.</div>
            <button onClick={send} style={{...s.btnP,width:"100%"}} disabled={!msg.trim()||sending}>{sending?"Sending...":"Send Feedback"}</button>
          </>
        )}
      </div>
    </div>
  );
};

const AdminMessagesBanner=({userId})=>{
  const T=useT();const s=sx(T);
  const [messages,setMessages]=useState([]);
  const [dismissed,setDismissed]=useState(new Set());

  useEffect(()=>{
    if(!userId)return;
    (async()=>{
      const {supabase}=await import("./supabase.js");
      const {data}=await supabase.from("admin_messages")
        .select("*").eq("recipient_id",userId).eq("read",false)
        .order("created_at",{ascending:false});
      setMessages(data||[]);
    })();
  },[userId]);

  const dismiss=async(id)=>{
    const {supabase}=await import("./supabase.js");
    await supabase.from("admin_messages").update({read:true}).eq("id",id);
    setDismissed(prev=>new Set([...prev,id]));
  };

  const visible=messages.filter(m=>!dismissed.has(m.id));
  if(visible.length===0)return null;
  return(
    <div style={{position:"fixed",top:16,right:16,zIndex:2000,display:"flex",flexDirection:"column",gap:8,maxWidth:380}}>
      {visible.map(m=>(
        <div key={m.id} style={{background:T.bg1,border:"2px solid "+T.amber,borderRadius:12,padding:"14px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>📬</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:T.amber}}>Message from {m.sender_name}</div>
                <div style={{fontSize:10,color:T.t3}}>{new Date(m.created_at).toLocaleDateString("en-KE")}</div>
              </div>
            </div>
            <button onClick={()=>dismiss(m.id)} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:16,padding:"0 4px"}}>✕</button>
          </div>
          <div style={{fontSize:12,color:T.t1,lineHeight:1.7,marginBottom:10}}>{m.message}</div>
          <button onClick={()=>dismiss(m.id)} style={{...s.btnP,fontSize:11,width:"100%",background:T.amber,color:"#000"}}>Acknowledged ✓</button>
        </div>
      ))}
    </div>
  );
};

export default function App(){
  const [showLanding,setShowLanding]=useState(()=>!localStorage.getItem('ak_visited'));
  const [themeId,setThemeId]=useState(()=>localStorage.getItem('ak_theme')||'navy'),[lang,setLang]=useState(()=>localStorage.getItem('ak_lang')||'en'),[fontSize,setFontSize]=useState(14),[highContrast,setHighContrast]=useState(false);
  const [userField,setUserField]=useState("actuarial"),[role,setRole]=useState("student");
  const [userName,setUserName]=useState(""),[authed,setAuthed]=useState(false);
  const [userId,setUserId]=useState(null);
  const [showTerms,setShowTerms]=useState(false);
  const [pendingLogin,setPendingLogin]=useState(null);
  const [tab,setTab]=useState(()=>localStorage.getItem("ak_tab")||"dashboard"),[sideOpen,setSideOpen]=useState(window.innerWidth > 768);
  const origSetTab=setTab;
  const persistTab=(t)=>{localStorage.setItem("ak_tab",t);origSetTab(t);};
  Object.defineProperty(window,"__setTab",{value:persistTab,writable:true});
  const [offline,setOffline]=useState(false),[toast,setToast]=useState(null);
  useEffect(()=>{loadFonts();},[]);
  const [resetMode,setResetMode]=useState(false);
  const [notifs,setNotifs]=useState([]);
  const addNotif=(icon,title,body)=>setNotifs(n=>[{icon,title,body,time:new Date().toLocaleTimeString()},...n].slice(0,20));
  const [newPass,setNewPass]=useState("");
  const [newPass2,setNewPass2]=useState("");
  const [resetMsg,setResetMsg]=useState("");
  const [resetLoading,setResetLoading]=useState(false);
  const [sessionChecked,setSessionChecked]=useState(false);

  useEffect(()=>{
    const init=async()=>{
      const {supabase}=await import("./supabase.js");

      // FIRST: check hash BEFORE any Supabase calls
      const hash=window.location.hash;
      const params=new URLSearchParams(window.location.search);
      const isRecovery=hash.includes("type=recovery")||params.get("type")==="recovery";

      if(isRecovery){
        setResetMode(true);
        // Keep recovery session alive - needed for updateUser call
        return;
      }

      // Listen for PASSWORD_RECOVERY event
      const {data:{subscription}}=supabase.auth.onAuthStateChange(async(event,session)=>{
        if(event==="PASSWORD_RECOVERY"){
          setResetMode(true);
          setAuthed(false);
        }
      });

      // Normal session restore only if not recovery
      const {data:{session}}=await supabase.auth.getSession();
      if(session&&session.user){
        const {data}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
        if(data&&data.status==="approved"){
          const termsKey="ak_terms_"+session.user.id;
          if(!localStorage.getItem(termsKey)){
            setPendingLogin({role:data.role||"student",field:data.field||"actuarial",name:data.full_name||session.user.email,termsKey});
            setShowTerms(true);
          } else {
            setRole(data.role||"student");
            setUserField(data.field||"actuarial");
            setUserName(data.full_name||session.user.email);
            setUserId(session.user.id);
            setAuthed(true);
          }
        }
      }

      setSessionChecked(true);
      return ()=>subscription.unsubscribe();
    };
    init();
  },[]);
  const flash=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};

  // Auto logout after 30 minutes of inactivity
  useEffect(()=>{
    if(!authed) return;
    let timer;
    const reset=()=>{
      clearTimeout(timer);
      timer=setTimeout(async()=>{
        const {supabase}=await import("./supabase.js");
        await supabase.auth.signOut();
        setAuthed(false);setRole("student");setUserName("");setUserId(null);
        localStorage.removeItem("ak_tab");
        flash("Session expired. Please sign in again.","error");
      },5*60*1000);
    };
    const events=["mousemove","keydown","click","scroll","touchstart"];
    events.forEach(e=>window.addEventListener(e,reset));
    reset();
    return()=>{clearTimeout(timer);events.forEach(e=>window.removeEventListener(e,reset));};
  },[authed]);
  const handleLogin=(r,f,n)=>{setRole(r||"student");setUserField(f||"actuarial");setUserName(n||"User");setAuthed(true);flash((LS[lang]||LS.en).welcome+", "+(n||"User").split(" ")[0]+"!");};
  const handleRealLogin=async(email,password)=>{
    const {handleSignIn}=await import("./auth.js");
    const result=await handleSignIn(email,password);
    if(result.error)return result.error;
    const p=result.profile;
    const termsKey="ak_terms_"+p.id;
    if(!localStorage.getItem(termsKey)){
      setPendingLogin({role:p.role||"student",field:p.field||"actuarial",name:p.full_name||email,termsKey});
      setShowTerms(true);
    } else {
      setRole(p.role||"student");setUserField(p.field||"actuarial");setUserId(p.id);
      setUserName(p.full_name||email);setAuthed(true);
      flash((LS[lang]||LS.en).welcome+", "+(p.full_name||email).split(" ")[0]+"!");
    }
    return null;
  };
  const handleRealSignUp=async(email,password,meta)=>{
    const {handleSignUp}=await import("./auth.js");
    const result=await handleSignUp(email,password,meta);
    if(result.error)return result.error;

    // Send welcome email via Edge Function
    try{
      const firstName=(meta.full_name||email).split(" ")[0];
      const role=meta.role||"student";
      const isStaff=role==="lecturer"||role==="researcher"||role==="admin";
      const roleLabel=role==="lecturer"?"Lecturer":role==="researcher"?"Researcher":role==="admin"?"Administrator":"Student";

      const studentFeatures=`
        <div style="margin-bottom:10px;font-size:13px;color:#333;">📚 <strong>Courses and Assignments</strong> — all your academic content in one place</div>
        <div style="margin-bottom:10px;font-size:13px;color:#333;">🤖 <strong>AI Tutor</strong> — ask anything, 24 hours a day, 7 days a week</div>
        <div style="margin-bottom:10px;font-size:13px;color:#333;">⚙️ <strong>Tools Hub</strong> — GPA, pension, bond pricing, currency converter and more</div>
        <div style="margin-bottom:10px;font-size:13px;color:#333;">🎓 <strong>Programme Structure</strong> — your full curriculum with descriptions and free references</div>
        <div style="margin-bottom:10px;font-size:13px;color:#333;">🏛️ <strong>Student Services</strong> — HELB, NHIF, KRA PIN, mobile loans and more</div>
        <div style="font-size:13px;color:#333;">💬 <strong>Community Chat</strong> — connect with students across all fields</div>`;

      const staffFeatures=`
        <div style="margin-bottom:10px;font-size:13px;color:#333;">📋 <strong>Assignments and Exams</strong> — post, manage and grade student work in one place</div>
        <div style="margin-bottom:10px;font-size:13px;color:#333;">🏫 <strong>My Classroom</strong> — class insights, wellness flags and student feedback</div>
        <div style="margin-bottom:10px;font-size:13px;color:#333;">📣 <strong>Events</strong> — post bootcamps, seminars, workshops and trips for students</div>
        <div style="margin-bottom:10px;font-size:13px;color:#333;">🤖 <strong>AI Tools</strong> — AI Tutor, research assistant and career analytics</div>
        <div style="margin-bottom:10px;font-size:13px;color:#333;">💡 <strong>Innovation Hub</strong> — post challenges and mentor student ideas</div>
        <div style="font-size:13px;color:#333;">💬 <strong>Community Chat</strong> — engage with students and fellow staff across fields</div>`;

      const intro=role==="lecturer"
        ? `Having you on board as a <strong>Lecturer</strong> means a great deal. AKADIMIA was built with educators in mind — a space where you can manage classes, post assignments, engage students and track their wellbeing without the usual administrative burden. Your contribution to your students through this platform will be significant.`
        : role==="researcher"
        ? `Having you join as a <strong>Researcher</strong> is exactly the kind of presence AKADIMIA needs. The platform gives you a space to share work, engage with students on innovation, and collaborate across disciplines. We are building something meaningful here and your expertise adds to that.`
        : role==="admin"
        ? `Welcome as an <strong>Administrator</strong> on AKADIMIA. You are now one of the people who keeps this platform running well for everyone. The admin tools give you full control over registrations, communications and platform content. We are counting on you.`
        : `I built this platform with one conviction: every Kenyan student deserves a proper academic home. Somewhere that keeps your assignments, your grades, your wellness and your future in one place. That is AKADIMIA.`;

      const closing=role==="lecturer"||role==="researcher"||role==="admin"
        ? `The platform is ready for you. If there is anything that does not work the way you expect, or anything you would like to see added, use the Feedback button inside the platform. Every message is read and acted on personally.`
        : `Once you are approved and inside, take ten minutes to explore everything. Set up your profile, check your field tools, run your GPA through the calculator, and say hello in the Community Chat. This platform was built for you. Use it fully.`;

      const welcomeHtml=`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="background:#1a1a2e;padding:32px 36px;text-align:center;">
      <div style="font-size:30px;font-weight:900;color:#ffffff;letter-spacing:4px;">AKADIMIA</div>
      <div style="font-size:13px;color:#D4A017;font-style:italic;margin-top:6px;">Ujuzi Bila Mipaka — Knowledge Without Borders</div>
    </div>
    <div style="padding:36px;">
      <p style="font-size:18px;font-weight:700;color:#1a1a2e;margin:0 0 16px;">Welcome, ${firstName}! 🎓</p>
      <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 16px;">
        My name is <strong>Dr. Jeffar Oburu</strong>, founder and developer of AKADIMIA. ${intro}
      </p>
      <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 16px;">
        Your registration has been received and is awaiting approval from the administrator. You will gain access shortly.
      </p>
      <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 16px;">Here is what awaits you on the platform:</p>
      <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px;">
        ${isStaff?staffFeatures:studentFeatures}
      </div>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="https://akadimia.co.ke/about" style="display:inline-block;background:#D4A017;color:#000;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:0.5px;">Learn About AKADIMIA</a>
      </div>
      <p style="font-size:13px;color:#666;line-height:1.8;margin:0 0 8px;">${closing}</p>
      <p style="font-size:13px;color:#666;line-height:1.8;margin:0;">Welcome to the AKADIMIA family, ${firstName}. Let us make this journey count.</p>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #eee;">
        <p style="font-size:13px;color:#1a1a2e;font-weight:700;margin:0;">Dr. Jeffar Junior Oburu</p>
        <p style="font-size:12px;color:#888;margin:4px 0 0;">Founder and Developer, AKADIMIA</p>
        <p style="font-size:12px;color:#888;margin:2px 0 0;">akadimia.co.ke</p>
      </div>
    </div>
    <div style="background:#1a1a2e;padding:16px 36px;text-align:center;">
      <p style="font-size:11px;color:#666;margin:0;">© 2025 AKADIMIA · Kenya Data Protection Act 2019 Compliant</p>
      <p style="font-size:11px;color:#555;margin:4px 0 0;">You received this because you registered at akadimia.co.ke</p>
    </div>
  </div>
</body>
</html>`;

      await fetch(import.meta.env.VITE_SUPABASE_URL+"/functions/v1/send-email",{
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":import.meta.env.VITE_SUPABASE_KEY,"Authorization":"Bearer "+import.meta.env.VITE_SUPABASE_KEY},
        body:JSON.stringify({to:email,subject:"Welcome to AKADIMIA, "+firstName+" — Ujuzi Bila Mipaka",html:welcomeHtml})
      });
    }catch(e){console.log("Welcome email error:",e);}

    return null;
  };
  const T=THEMES[themeId];
  const VIEWS={
    dashboard:<DashboardView setTab={persistTab} userName={userName} userField={userField}/>,
    courses:<CoursesView userField={userField} role={role} userName={userName}/>,
    exams:<ExamsView userField={userField} role={role} userName={userName} addNotif={addNotif}/>,
    assignments:<ClassroomView userField={userField} role={role} userName={userName} userId={userId} addNotif={addNotif}/>,
    research:<ResearchView userField={userField}/>,
    ai:<AIView lang={lang} userField={userField} role={role}/>,
    calendar:<CalendarView setTab={persistTab}/>,
    meetings:<MeetingsView role={role} userField={userField} userName={userName}/>,
    opps:<OppsView userField={userField}/>,
    analytics:<AnalyticsView userField={userField} userName={userName} role={role}/>,
    tools:<ToolsView userField={userField} userName={userName}/>,
    transcript:<TranscriptView userField={userField}/>,
    peers:<PeersView setTab={persistTab} userField={userField} userName={userName} userId={userId}/>,
    innovation:<InnovationHub userName={userName} role={role} userField={userField}/>,
    programme:<ProgrammeView userField={userField} role={role} userName={userName}/>,
    events:<EventsView userField={userField} role={role} userName={userName}/>,
    services:<ServicesView userField={userField}/>,
    classroom:<ClassroomView userField={userField} role={role} userName={userName} userId={userId} addNotif={addNotif}/>,
    admin:<AdminView/>,
    settings:<SettingsView lang={lang} setLang={setLang} themeId={themeId} setThemeId={(t)=>{localStorage.setItem("ak_theme",t);setThemeId(t);}} userField={userField} setUserField={setUserField} fontSize={fontSize} setFontSize={setFontSize} highContrast={highContrast} setHighContrast={setHighContrast} userId={userId} userName={userName}/>,
  };
  return(
    <ThemeCtx.Provider value={themeId}>
      <LangCtx.Provider value={lang}>
        <Toast n={toast}/>
        {!sessionChecked&&!resetMode?<div style={{minHeight:"100vh",background:"#0d1117"}}/>:resetMode?(
          <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0d1117"}}>
            <div style={{background:"#1a1f2e",borderRadius:16,width:"100%",maxWidth:420,padding:"2rem",margin:"1rem",border:"1px solid #2a3040"}}>
              <div style={{fontFamily:"serif",fontSize:22,fontWeight:700,color:"#fff",marginBottom:4}}>AKADIMIA</div>
              <div style={{fontSize:12,color:"#aaa",marginBottom:"1.5rem"}}>Set your new password</div>
              {resetMsg&&<div style={{background:resetMsg.includes("Error")?"rgba(239,68,68,0.12)":"rgba(34,197,94,0.12)",border:resetMsg.includes("Error")?"1px solid rgba(239,68,68,0.3)":"1px solid rgba(34,197,94,0.3)",color:resetMsg.includes("Error")?"#ef4444":"#22c55e",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:"1rem"}}>{resetMsg}</div>}
              {!resetMsg.includes("updated")&&<>
                <input type="password" style={{width:"100%",background:"#0d1117",border:"1px solid #2a3040",borderRadius:8,padding:"10px 14px",color:"#fff",fontSize:13,marginBottom:"0.75rem",boxSizing:"border-box"}} placeholder="New password (min 8 characters)" value={newPass} onChange={e=>setNewPass(e.target.value)}/>
                <input type="password" style={{width:"100%",background:"#0d1117",border:"1px solid #2a3040",borderRadius:8,padding:"10px 14px",color:"#fff",fontSize:13,marginBottom:"1rem",boxSizing:"border-box"}} placeholder="Confirm new password" value={newPass2} onChange={e=>setNewPass2(e.target.value)}/>
                <button onClick={async()=>{
                  if(newPass.length<8){setResetMsg("Password must be at least 8 characters.");setTimeout(()=>setResetMsg(""),3000);return;}
                  if(newPass!==newPass2){setResetMsg("Passwords do not match.");setTimeout(()=>setResetMsg(""),3000);return;}
                  setResetLoading(true);
                  const {supabase}=await import("./supabase.js");
                  const {error}=await supabase.auth.updateUser({password:newPass});
                  setResetLoading(false);
                  if(error){setResetMsg("Error: "+error.message);setTimeout(()=>setResetMsg(""),4000);}
                  else{setResetMsg("Password updated! Redirecting to login...");const {supabase}=await import("./supabase.js");await supabase.auth.signOut();setTimeout(()=>{setResetMode(false);setAuthed(false);window.location.hash="";},2000);}
                }} style={{width:"100%",background:"#d4a017",border:"none",borderRadius:8,padding:"12px",color:"#000",fontSize:14,fontWeight:600,cursor:resetLoading?"not-allowed":"pointer"}} disabled={resetLoading}>{resetLoading?"Updating...":"Set New Password"}</button>
              </>}
            </div>
          </div>
        ):showTerms&&pendingLogin?(
          <div style={{minHeight:"100vh",background:"#0f0f1a",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"2rem 1rem",overflowY:"auto"}}>
            <div style={{width:"100%",maxWidth:700,background:"#16162a",borderRadius:16,border:"1px solid #2a2a4a",padding:"2rem"}}>
              <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
                <img src="/logo2.png" style={{height:52,width:52,objectFit:"contain",marginBottom:8}}/>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#fff",letterSpacing:2}}>AKADIMIA</div>
                <div style={{fontSize:11,color:"#D4A017",fontStyle:"italic",marginBottom:8}}>Ujuzi Bila Mipaka</div>
                <div style={{fontSize:16,fontWeight:600,color:"#fff"}}>Terms of Use & Data Privacy Consent</div>
                <div style={{fontSize:12,color:"#888",marginTop:4}}>Please read carefully and accept before accessing the platform</div>
              </div>
              <div style={{maxHeight:"50vh",overflowY:"auto",padding:"1rem",background:"#0f0f1a",borderRadius:8,border:"1px solid #2a2a4a",marginBottom:"1.5rem",fontSize:12,color:"#ccc",lineHeight:1.8}}>
                <div style={{fontSize:13,fontWeight:600,color:"#D4A017",marginBottom:6}}>1. Kenya Data Protection Act 2019 (KDPA)</div>
                <p style={{marginBottom:12}}>AKADIMIA processes your personal data under the Kenya Data Protection Act 2019 (Act No. 24 of 2019). By using this platform you consent to collection and processing of: full name, email, student ID, field of study, year level, assignments, exam responses, and activity logs. Data is used solely for academic administration.</p>
                <div style={{fontSize:13,fontWeight:600,color:"#D4A017",marginBottom:6}}>2. Legal Basis for Processing</div>
                <p style={{marginBottom:12}}>Processing is based on your consent (Section 30, KDPA 2019) and legitimate academic interest. You may withdraw consent by contacting your institution administrator, however this will affect your platform access.</p>
                <div style={{fontSize:13,fontWeight:600,color:"#D4A017",marginBottom:6}}>3. Computer Misuse and Cybercrimes Act 2018</div>
                <p style={{marginBottom:12}}>Under the Computer Misuse and Cybercrimes Act 2018 (Act No. 5 of 2018), unauthorized access, misuse or interference with this platform is a criminal offence punishable under Sections 3, 4 and 5 of the Act.</p>
                <div style={{fontSize:13,fontWeight:600,color:"#D4A017",marginBottom:6}}>4. Academic Integrity</div>
                <p style={{marginBottom:12}}>You agree to uphold academic integrity. Sharing exam questions, answers or using unauthorized assistance constitutes academic fraud and may be referred to your institution disciplinary committee. AKADIMIA may flag suspicious exam behaviour.</p>
                <div style={{fontSize:13,fontWeight:600,color:"#D4A017",marginBottom:6}}>5. Data Security</div>
                <p style={{marginBottom:12}}>Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Stored on Supabase EU-West servers. AKADIMIA does not sell or share personal data with third parties except as required by Kenyan law or court order.</p>
                <div style={{fontSize:13,fontWeight:600,color:"#D4A017",marginBottom:6}}>6. Your Rights Under KDPA 2019</div>
                <p style={{marginBottom:12}}>You have the right to: access your data (S.26); correct inaccurate data (S.27); request deletion (S.38); object to processing (S.35); and lodge a complaint with the Office of the Data Protection Commissioner at odpc.go.ke.</p>
                <div style={{fontSize:13,fontWeight:600,color:"#D4A017",marginBottom:6}}>7. Wellness & Ratings Data</div>
                <p style={{marginBottom:12}}>Wellness check-ins are fully anonymous — never linked to your identity. Raw wellness data is deleted after 90 days. Class ratings are anonymous and used only to improve teaching quality.</p>
                <div style={{fontSize:13,fontWeight:600,color:"#D4A017",marginBottom:6}}>8. Governing Law</div>
                <p>These terms are governed by the laws of Kenya including: KDPA 2019, Computer Misuse and Cybercrimes Act 2018, Kenya ICT Act Cap. 411A, and Consumer Protection Act 2012.</p>
              </div>
              <div style={{background:"#1a1a2e",borderRadius:8,padding:"12px 16px",marginBottom:"1.5rem",fontSize:12,color:"#aaa",border:"1px solid #2a2a4a"}}>
                Logged in as <strong style={{color:"#fff"}}>{pendingLogin.name}</strong> — by accepting you confirm this account belongs to you and all registration information is accurate.
              </div>
              <div style={{display:"flex",gap:12}}>
                <button onClick={()=>{localStorage.setItem(pendingLogin.termsKey,"1");setRole(pendingLogin.role);setUserField(pendingLogin.field);setUserName(pendingLogin.name);setAuthed(true);setShowTerms(false);setPendingLogin(null);flash("Welcome, "+pendingLogin.name.split(" ")[0]+"!");}} style={{flex:1,background:"#D4A017",color:"#000",border:"none",borderRadius:8,padding:"14px",fontSize:14,fontWeight:700,cursor:"pointer"}}>I Accept — Enter AKADIMIA</button>
                <button onClick={async()=>{const {supabase}=await import("./supabase.js");await supabase.auth.signOut();setShowTerms(false);setPendingLogin(null);}} style={{background:"none",border:"1px solid #444",borderRadius:8,padding:"14px 20px",fontSize:13,color:"#888",cursor:"pointer"}}>Decline & Sign Out</button>
              </div>
              <div style={{fontSize:10,color:"#444",textAlign:"center",marginTop:12}}>Kenya Data Protection Act 2019 · Computer Misuse and Cybercrimes Act 2018 · Kenya ICT Act Cap. 411A</div>
            </div>
          </div>
        ):showLanding?(
          <Landing onEnter={()=>{localStorage.setItem('ak_visited','1');setShowLanding(false);}}/>
        ):!authed?(
          <AuthScreen onLogin={handleLogin} onRealLogin={handleRealLogin} onRealSignUp={handleRealSignUp} lang={lang} setLang={setLang} themeId={themeId} setThemeId={(t)=>{localStorage.setItem("ak_theme",t);setThemeId(t);}}/>
        ):(
          <div style={{display:"flex",height:"100vh",background:highContrast?"#000000":T.bg0,fontFamily:"'DM Sans',sans-serif",color:highContrast?"#ffffff":T.t1,overflow:"hidden",fontSize:fontSize}}>
            <Sidebar tab={tab} setTab={persistTab} open={sideOpen} role={role} userName={userName} userField={userField} offline={offline} setOffline={setOffline} onLogout={async()=>{const {supabase}=await import("./supabase.js");await supabase.auth.signOut();setAuthed(false);setRole("student");setUserName("");setTab("dashboard");}}/>
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <AdminMessagesBanner userId={userId}/>
              <FeedbackModal userId={userId} userName={userName}/>
              <Topbar toggle={()=>setSideOpen(o=>!o)} tab={tab} lang={lang} setLang={setLang} themeId={themeId} setThemeId={(t)=>{localStorage.setItem("ak_theme",t);setThemeId(t);}} notifs={notifs} setNotifs={setNotifs}/>
              <div style={{flex:1,overflowY:"auto",padding:"1.5rem",display:"flex",flexDirection:"column",alignItems:"stretch"}}><div style={{maxWidth:1280,width:"100%",margin:"0 auto",flex:1}}>
                {VIEWS[tab]||VIEWS.dashboard}
              </div></div>
            </div>
            {offline&&(
              <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.amber,padding:"9px 1.5rem",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:999}}>
                <span style={{fontSize:13,color:"#0D1226",fontWeight:500}}>Offline Mode — Cached content. Changes sync on reconnect.</span>
                <button onClick={()=>setOffline(false)} style={{background:"#0D1226",border:"none",borderRadius:6,padding:"5px 14px",fontSize:12,color:T.amber,cursor:"pointer",fontWeight:600}}>Go Online</button>
              </div>
            )}
          </div>
        )}
      </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}
