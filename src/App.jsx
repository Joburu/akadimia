import{useState,useEffect,useRef,createContext,useContext}from"react";
import ReactMarkdown from"react-markdown";
import remarkMath from"remark-math";
import rehypeKatex from"rehype-katex";
import{supabase}from"./supabase.js";
import{askClaude,signIn,signUp,signOut,getProfile,getPendingUsers,updateUserStatus}from"./api.js";
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
  kik:{welcome:"Karibuni tena",dashboard:"Dashibodi",courses:"Masomo",exams:"Mitihani",assignments:"Kazi",research:"Utafiti",ai:"Msaidizi AI",calendar:"Kalenda",meetings:"Mikutano",opps:"Fursa",analytics:"Uchambuzi",tools:"Zana",transcript:"Rekodi",peers:"Anzake",classroom:"Darasa Langu",admin:"Msimamizi",settings:"Mipangilio",signIn:"Ingia",register:"Jisajili",pending:"Ingoja Idhini",fieldSelect:"Chagua Taaluma",approve:"Idhini",reject:"Kataa",pendingApprovals:"Wanasubiri",online:"Mtandaoni",offline:"Nje ya Mtandao",send:"Tuma",ask:"Uliza chochote..."},
  luh:{welcome:"Mulembe mwana",dashboard:"Dashibodi",courses:"Masomo",exams:"Mitihani",assignments:"Kazi",research:"Utafiti",ai:"Msaidizi AI",calendar:"Kalenda",meetings:"Makutano",opps:"Nafasi",analytics:"Uchambuzi",tools:"Vifaa",transcript:"Rekodi",peers:"Marafiki",classroom:"Darasa Langu",admin:"Msimamizi",settings:"Mipangilio",signIn:"Ingia",register:"Jiandikishe",pending:"Subiri Idhini",fieldSelect:"Chagua Taaluma",approve:"Idhini",reject:"Kataa",pendingApprovals:"Wanasubiri",online:"Mtandaoni",offline:"Nje ya Mtandao",send:"Tuma",ask:"Uliza chochote..."},
  kal:{welcome:"Chamgei",dashboard:"Dashboard",courses:"Masomo",exams:"Mitihani",assignments:"Kazi",research:"Utafiti",ai:"AI Tutor",calendar:"Kalenda",meetings:"Mikutano",opps:"Nafasi",analytics:"Uchambuzi",tools:"Zana",transcript:"Rekodi",peers:"Marafiki",classroom:"Darasa Langu",admin:"Msimamizi",settings:"Mipangilio",signIn:"Ingia",register:"Jisajili",pending:"Subiri Idhini",fieldSelect:"Chagua Taaluma",approve:"Idhini",reject:"Kataa",pendingApprovals:"Wanasubiri",online:"Mtandaoni",offline:"Nje ya Mtandao",send:"Tuma",ask:"Uliza chochote..."},
  som:{welcome:"Ku soo dhawoow",dashboard:"Bogga Guud",courses:"Koorsooyin",exams:"Imtixaanno",assignments:"Hawlo",research:"Cilmi-baadhis",ai:"Kaaliye AI",calendar:"Kalandarka",meetings:"Shirarka",opps:"Fursadaha",analytics:"Falanqaynta",tools:"Qaladaadka",transcript:"Diiwaanka",peers:"Saaxiibada",classroom:"Fasalkaygii",admin:"Maamulaha",settings:"Dejinta",signIn:"Gal",register:"Diiwaan geli",pending:"Sugaya Oggolaanshaha",fieldSelect:"Dooro Cilmiga",approve:"Oggolow",reject:"Diiyi",pendingApprovals:"Sugayaan",online:"Online",offline:"Offline",send:"Dir",ask:"Weydii EduBot wax..."},
  fr:{welcome:"Bon retour",dashboard:"Tableau de bord",courses:"Cours",exams:"Examens",assignments:"Devoirs",research:"Recherche",ai:"Tuteur IA",calendar:"Calendrier",meetings:"Réunions",opps:"Opportunités",analytics:"Analytique",tools:"Outils",transcript:"Relevé de notes",peers:"Pairs",classroom:"Ma salle",admin:"Admin",settings:"Paramètres",signIn:"Se connecter",register:"S'inscrire",pending:"En attente",fieldSelect:"Choisir un domaine",approve:"Approuver",reject:"Rejeter",pendingApprovals:"En attente",online:"En ligne",offline:"Hors ligne",send:"Envoyer",ask:"Demandez à EduBot..."},
  ar:{welcome:"مرحباً بعودتك",dashboard:"لوحة التحكم",courses:"المقررات",exams:"الامتحانات",assignments:"الواجبات",research:"البحث",ai:"المعلم الذكي",calendar:"التقويم",meetings:"الاجتماعات",opps:"الفرص",analytics:"التحليلات",tools:"الأدوات",transcript:"السجل الأكاديمي",peers:"الأقران",classroom:"فصلي",admin:"الإدارة",settings:"الإعدادات",signIn:"تسجيل الدخول",register:"التسجيل",pending:"في انتظار الموافقة",fieldSelect:"اختر تخصصك",approve:"موافقة",reject:"رفض",pendingApprovals:"في الانتظار",online:"متصل",offline:"غير متصل",send:"إرسال",ask:"اسأل EduBot..."},
  zh:{welcome:"欢迎回来",dashboard:"仪表板",courses:"课程",exams:"考试",assignments:"作业",research:"研究",ai:"AI辅导",calendar:"日历",meetings:"会议",opps:"机会",analytics:"分析",tools:"工具",transcript:"成绩单",peers:"同学",classroom:"我的课堂",admin:"管理",settings:"设置",signIn:"登录",register:"注册",pending:"待审批",fieldSelect:"选择专业",approve:"批准",reject:"拒绝",pendingApprovals:"待审批",online:"在线",offline:"离线",send:"发送",ask:"向EduBot提问..."},
  ja:{welcome:"お帰りなさい",dashboard:"ダッシュボード",courses:"コース",exams:"試験",assignments:"課題",research:"研究",ai:"AIチューター",calendar:"カレンダー",meetings:"ミーティング",opps:"機会",analytics:"分析",tools:"ツール",transcript:"成績証明書",peers:"仲間",classroom:"マイクラス",admin:"管理",settings:"設定",signIn:"サインイン",register:"登録",pending:"承認待ち",fieldSelect:"分野を選択",approve:"承認",reject:"拒否",pendingApprovals:"承認待ち",online:"オンライン",offline:"オフライン",send:"送信",ask:"EduBotに質問..."},
  es:{welcome:"Bienvenido de nuevo",dashboard:"Panel",courses:"Cursos",exams:"Exámenes",assignments:"Tareas",research:"Investigación",ai:"Tutor IA",calendar:"Calendario",meetings:"Reuniones",opps:"Oportunidades",analytics:"Análisis",tools:"Herramientas",transcript:"Expediente",peers:"Compañeros",classroom:"Mi aula",admin:"Admin",settings:"Configuración",signIn:"Iniciar sesión",register:"Registrarse",pending:"Pendiente",fieldSelect:"Elegir campo",approve:"Aprobar",reject:"Rechazar",pendingApprovals:"Pendientes",online:"En línea",offline:"Sin conexión",send:"Enviar",ask:"Pregunta a EduBot..."},
  zu:{welcome:"Wamukelekile futhi",dashboard:"Ibhodi",courses:"Izifundo",exams:"Izivivinyo",assignments:"Imisebenzi",research:"Ucwaningo",ai:"Umfundisi we-AI",calendar:"Ikhalenda",meetings:"Izihlangano",opps:"Amathuba",analytics:"Ukuhlaziya",tools:"Amathuluzi",transcript:"Irekhodi",peers:"Izintanga",classroom:"Ikilasi Lami",admin:"Umlawuli",settings:"Izilungiselelo",signIn:"Ngena",register:"Bhalisa",pending:"Ilindile",fieldSelect:"Khetha inkundla",approve:"Vuma",reject:"Nqaba",pendingApprovals:"Balindile",online:"Ku-intanethi",offline:"Ngaphandle kwe-intanethi",send:"Thumela",ask:"Buza u-EduBot..."},
};
const LS_STUB={welcome:"Karibu",dashboard:"Dashboard",courses:"Courses",exams:"Exams",assignments:"Assignments",research:"Research",ai:"AI",calendar:"Calendar",meetings:"Meetings",opps:"Opportunities",analytics:"Analytics",tools:"Tools",transcript:"Transcript",peers:"Peers",classroom:"Classroom",admin:"Admin",settings:"Settings",signIn:"Sign In",register:"Register",pending:"Pending",fieldSelect:"Choose Field",approve:"Approve",reject:"Reject",pendingApprovals:"Pending",online:"Online",offline:"Offline",send:"Send",ask:"Ask..."};

const FIELDS={
  actuarial:   {id:"actuarial",   name:"Actuarial Science",   icon:"📊",color:"#D4A843",group:"Sciences",   desc:"Risk, insurance & financial modelling"},
  medicine:    {id:"medicine",    name:"Medicine & Surgery",   icon:"🩺",color:"#EF4444",group:"Health",     desc:"Clinical medicine, surgery & health sciences"},
  law:         {id:"law",         name:"Law",                  icon:"⚖️",color:"#7C3AED",group:"Social Sci.",desc:"Legal studies, jurisprudence & constitutional law"},
  engineering: {id:"engineering", name:"Engineering",          icon:"⚙️",color:"#3B82F6",group:"Technology", desc:"Civil, electrical, mechanical & structural"},
  compsci:     {id:"compsci",     name:"Computer Science",     icon:"💻",color:"#0D9488",group:"Technology", desc:"Algorithms, AI, systems & software development"},
  business:    {id:"business",    name:"Business & Commerce",  icon:"💼",color:"#F59E0B",group:"Social Sci.",desc:"Accounting, finance, marketing & strategy"},
  education:   {id:"education",   name:"Education",            icon:"✏️",color:"#10B981",group:"Social Sci.",desc:"Pedagogy, curriculum & educational psychology"},
  agriculture: {id:"agriculture", name:"Agriculture",          icon:"🌾",color:"#84CC16",group:"Sciences",   desc:"Crop science, soil science & agribusiness"},
  nursing:     {id:"nursing",     name:"Nursing & Midwifery",  icon:"💊",color:"#EC4899",group:"Health",     desc:"Clinical nursing, pharmacology & maternal health"},
  architecture:{id:"architecture",name:"Architecture",         icon:"🏛️",color:"#6366F1",group:"Technology", desc:"Design, structural analysis & urban planning"},
  puremaths:   {id:"puremaths",   name:"Pure Mathematics",     icon:"∞",  color:"#8B5CF6",group:"Sciences",   desc:"Abstract algebra, analysis, topology & number theory"},
  appliedmaths:{id:"appliedmaths",name:"Applied Mathematics",  icon:"📐", color:"#06B6D4",group:"Sciences",   desc:"Mathematical modelling, ODEs, numerical methods"},
  appstats:    {id:"appstats",    name:"Applied Statistics",   icon:"📈", color:"#F97316",group:"Sciences",   desc:"Statistical inference, data analysis & biostatistics"},
  entrepreneurship:{id:"entrepreneurship",name:"Entrepreneurship",icon:"🚀",color:"#EAB308",group:"Social Sci.",desc:"Startup ecosystems, innovation & business development"},
  publichealth:{id:"publichealth",name:"Public Health",        icon:"🏥", color:"#14B8A6",group:"Health",     desc:"Epidemiology, health policy & community health"},
  economics:   {id:"economics",   name:"Economics",            icon:"💹", color:"#A855F7",group:"Social Sci.",desc:"Micro/macro economics, econometrics & development"},
  pharmacy:    {id:"pharmacy",    name:"Pharmacy",             icon:"💉", color:"#F43F5E",group:"Health",     desc:"Pharmacology, clinical pharmacy & drug development"},
  psychology:  {id:"psychology",  name:"Psychology",           icon:"🧠", color:"#8B5CF6",group:"Social Sci.",desc:"Behavioural science, counselling & neuropsychology"},
  envscience:  {id:"envscience",  name:"Environmental Science",icon:"🌍", color:"#22C55E",group:"Sciences",   desc:"Climate change, ecology & environmental management"},
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
  {d:10,type:"meeting",label:"Study Group",time:"3:00 PM",col:"#3B82F6"},
  {d:14,type:"class",label:"Online Lecture",time:"8:00 AM",col:"#0D9488"},
  {d:17,type:"deadline",label:"Research Draft Due",time:"5:00 PM",col:"#7C3AED"},
  {d:21,type:"exam",label:"CAT 2",time:"2:00 PM",col:"#EF4444"},
  {d:25,type:"class",label:"Industry Talk",time:"10:00 AM",col:"#16A34A"},
  {d:28,type:"deadline",label:"Portfolio Submission",time:"11:59 PM",col:"#D97706"},
];
const MEETINGS=[
  {id:1,title:"Weekly Tutorial",host:"Dr. Ochieng",date:"Mar 21",time:"10:00 AM",dur:"1h",platform:"zoom",att:28,rec:false,type:"class"},
  {id:2,title:"Research Supervision",host:"Prof. Wanjiku",date:"Mar 22",time:"2:00 PM",dur:"45min",platform:"meet",att:3,rec:false,type:"research"},
  {id:3,title:"Study Group",host:"Amara Osei",date:"Mar 23",time:"4:00 PM",dur:"1.5h",platform:"teams",att:6,rec:false,type:"peer"},
  {id:4,title:"Industry Webinar",host:"Guest Speaker",date:"Mar 25",time:"10:00 AM",dur:"2h",platform:"zoom",att:150,rec:true,type:"industry"},
];
const PENDING_REGS=[
  {id:101,name:"Brian Otieno",email:"b.otieno@student.buc.ke",field:"medicine",date:"Mar 18",sid:"BUC/MED/2026/023",role:"student"},
  {id:102,name:"Grace Mutua",email:"g.mutua@student.buc.ke",field:"law",date:"Mar 19",sid:"BUC/LAW/2026/011",role:"student"},
  {id:103,name:"James Kariuki",email:"j.kariuki@student.buc.ke",field:"actuarial",date:"Mar 20",sid:"BUC/AS/2026/045",role:"student"},
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
  const demoRoles=[["student","Student"],["lecturer","Lecturer"],["admin","Admin"]];
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
              <img src="/logo2.png" alt="AKADIMIA" style={{height:90,width:90,objectFit:"contain"}}/>
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

const NAV_BASE=[{id:"dashboard",icon:"⊞"},{id:"courses",icon:"📚"},{id:"exams",icon:"✏"},{id:"assignments",icon:"📋"},{id:"research",icon:"🔬"},{id:"ai",icon:"🤖"},{id:"calendar",icon:"📅"},{id:"meetings",icon:"📹"},{id:"opps",icon:"🌐"},{id:"analytics",icon:"📊"},{id:"tools",icon:"⚙"},{id:"transcript",icon:"🗂"},{id:"peers",icon:"👥"}];

const Sidebar=({tab,setTab,open,role,userName,userField,offline,setOffline,onLogout})=>{
  const T=useT();const t=useLang();const fld=FIELDS[userField];const s=sx(T);
  const L={dashboard:t("dashboard"),courses:t("courses"),exams:t("exams"),assignments:t("assignments"),research:t("research"),ai:t("ai"),calendar:t("calendar"),meetings:t("meetings"),opps:t("opps"),analytics:t("analytics"),tools:t("tools"),transcript:t("transcript"),peers:t("peers"),classroom:t("classroom"),admin:t("admin"),settings:t("settings")};
  const nav=[...NAV_BASE,...(role==="lecturer"||role==="admin"?[{id:"classroom",icon:"🎓"}]:[]),...(role==="admin"?[{id:"admin",icon:"🛡"}]:[]),{id:"settings",icon:"⚙"}];
  return(
    <div style={{width:open?256:0,minWidth:open?256:0,background:T.bg1,borderRight:`1px solid ${T.bd}`,display:"flex",flexDirection:"column",transition:"width 0.3s",overflow:"hidden",flexShrink:0}}>
      <div style={{padding:"1.1rem 1rem",borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:38,height:38,background:`linear-gradient(135deg,${T.ac},${T.acL})`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <img src="/logo2.png" alt="A" style={{height:36,width:36,objectFit:"contain"}}/>
        </div>
        {open&&<div><div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:13,color:T.t1,letterSpacing:2.5}}><img src="/logo2.png" alt="AKADIMIA" style={{height:44,width:44,objectFit:"contain",marginRight:8}}/>AKADIMIA</div><div style={{fontSize:9,color:T.ac,fontStyle:"italic"}}>Ujuzi Bila Mipaka</div></div>}
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
  const L={dashboard:t("dashboard"),courses:t("courses"),exams:t("exams"),assignments:t("assignments"),research:t("research"),ai:t("ai"),calendar:t("calendar"),meetings:t("meetings"),opps:t("opps"),analytics:t("analytics"),tools:t("tools"),transcript:t("transcript"),peers:t("peers"),classroom:t("classroom"),admin:t("admin"),settings:t("settings")};
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
      <select value={lang} onChange={e=>setLang(e.target.value)} style={{background:T.bg2,border:`1px solid ${T.bd}`,borderRadius:7,padding:"5px 8px",color:T.t2,fontSize:11,cursor:"pointer",outline:"none"}}>
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
  const [news,setNews]=useState([]);
  const [stocks,setStocks]=useState([]);
  const [newsLoading,setNewsLoading]=useState(false);
  const showStocks=["actuarial","business","economics","appstats","appliedmaths","puremaths","entrepreneurship"].includes(userField);

  useEffect(()=>{
    const load=async()=>{
      const {supabase}=await import("./supabase.js");
      const {data:asgn}=await supabase.from("assignments").select("*").eq("field",userField).order("created_at",{ascending:false}).limit(5);
      const {data:mats}=await supabase.from("course_materials").select("*").eq("field",userField).order("created_at",{ascending:false}).limit(3);
      setAssignments(asgn||[]);
      setMaterials(mats||[]);
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
  const schedule=[["8:00 AM","Morning Lecture",T.teal],["2:00 PM","Tutorial",T.blue],["4:00 PM","Study Group",T.purple]];
  const perfData=[{w:"W1",sc:67},{w:"W2",sc:72},{w:"W3",sc:69},{w:"W4",sc:74},{w:"W5",sc:78},{w:"W6",sc:75},{w:"W7",sc:82},{w:"W8",sc:88}];

  return(
    <div>
      <h1 style={s.h1}>{t("welcome")}, {userName.split(" ")[0]}</h1>
      <p style={s.sub}><span style={{...s.tag(fld.color),marginRight:8}}>{fld.icon} {fld.name}</span>Semester 1, 2026 · AKADIMIA</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.25rem"}}>
        <StatCard label="GPA" value="3.5" sub="Above average" color={T.green} icon="🎯"/>
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
            <div style={{fontSize:12,fontWeight:600,color:T.t1,marginBottom:8}}>Today</div>
            {schedule.map((sc,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:7}}>
                <span style={{fontSize:10,color:T.t3,width:50,flexShrink:0}}>{sc[0]}</span>
                <div style={{width:3,height:26,background:sc[2],borderRadius:2}}/>
                <span style={{fontSize:11,color:T.t1}}>{sc[1]}</span>
              </div>
            ))}
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
const ExamsView=({userField})=>{
  const T=useT();const t=useLang();const s=sx(T);
  const [active,setActive]=useState(false),[answers,setAnswers]=useState({}),[result,setResult]=useState(null),[timer,setTimer]=useState(900);
  const tmr=useRef(null);const courses=(FIELD_DATA[userField]&&FIELD_DATA[userField].courses)||[];const fld=FIELDS[userField];
  useEffect(()=>{
    if(active){tmr.current=setInterval(()=>setTimer(prev=>{if(prev<=1){clearInterval(tmr.current);submit();return 0;}return prev-1;}),1000);}
    return()=>clearInterval(tmr.current);
  },[active]);
  const QS=[
    {id:1,q:"A probability density function (PDF) is best described as:",opts:["Can take negative values","Area under curve equals 1","Equals the CDF","Only for discrete variables"],ans:1,marks:5,expl:"The defining property of any PDF is that the total area integrates to exactly 1."},
    {id:2,q:"Which measure is most resistant to outliers?",opts:["Mean","Variance","Median","Standard deviation"],ans:2,marks:5,expl:"The median is the middle value, unaffected by extreme values."},
    {id:3,q:"By the Central Limit Theorem (n=100), the sampling distribution of the mean is:",opts:["Uniform","Binomial","Approximately Normal","Exponential"],ans:2,marks:5,expl:"For large n, CLT guarantees the sampling distribution approaches normality."},
  ];
  const submit=()=>{
    clearInterval(tmr.current);
    let sc=0,mx=0;
    const d=QS.map(q=>{mx+=q.marks;const ok=answers[q.id]===q.ans;if(ok)sc+=q.marks;return{...q,chosen:answers[q.id],ok};});
    setResult({score:sc,max:mx,pct:Math.round(sc/mx*100),detail:d});
    setActive(false);
  };
  const fmt=sec=>String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
  if(active)return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
        <div>
          <h1 style={{...s.h1,margin:0}}>Mid-Semester Examination</h1>
          <p style={{...s.sub,margin:0}}>{(courses[0]&&courses[0].name)||(fld&&fld.name)}</p>
        </div>
        <div style={{textAlign:"center",background:timer<120?rgba(T.red,0.2):T.bg2,border:`1px solid ${timer<120?T.red:T.bd}`,borderRadius:12,padding:"10px 20px"}}>
          <div style={{fontSize:10,color:T.t3}}>TIME</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:timer<120?T.red:T.ac}}>{fmt(timer)}</div>
        </div>
      </div>
      {QS.map((q,qi)=>(
        <div key={q.id} style={{...s.card,marginBottom:12}}>
          <div style={{fontSize:12,color:T.t3,marginBottom:8}}>Q{qi+1} · {q.marks} marks</div>
          <div style={{fontSize:14,fontWeight:500,color:T.t1,marginBottom:"1rem",lineHeight:1.65}}>{q.q}</div>
          {q.opts.map((opt,oi)=>{
            const sel=answers[q.id]===oi;
            return(
              <div key={oi} onClick={()=>setAnswers(a=>({...a,[q.id]:oi}))} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,marginBottom:6,border:`1px solid ${sel?T.ac:T.bd}`,background:sel?rgba(T.ac,0.12):T.bg3,cursor:"pointer"}}>
                <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${sel?T.ac:T.t3}`,background:sel?T.ac:"transparent",flexShrink:0}}/>
                <span style={{fontSize:13,color:T.t1}}>{opt}</span>
              </div>
            );
          })}
        </div>
      ))}
      <button onClick={submit} style={{...s.btnP,padding:"12px 32px",fontSize:14}}>Submit</button>
    </div>
  );
  if(result)return(
    <div>
      <div style={{...s.acCard,textAlign:"center",marginBottom:"1.5rem"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:result.pct>=70?T.green:result.pct>=50?T.amber:T.red}}>{result.pct}%</div>
        <div style={{fontSize:14,color:T.t1,marginTop:4}}>{result.score}/{result.max} marks · {result.pct>=70?"PASS":"FAIL"}</div>
      </div>
      {result.detail.map((q,qi)=>(
        <div key={q.id} style={{...s.card,marginBottom:10,borderLeft:`3px solid ${q.ok?T.green:T.red}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,color:T.t1,fontWeight:500}}>Q{qi+1}: {q.q.slice(0,55)}...</span>
            <Pill text={q.ok?"+"+q.marks:"+0"} color={q.ok?T.green:T.red}/>
          </div>
          <div style={{fontSize:12,color:T.t2}}>
            <span style={{color:q.ok?T.green:T.red}}>Your answer: {q.opts[q.chosen]||"-"}</span>
            {!q.ok&&<span style={{color:T.green,marginLeft:16}}>Correct: {q.opts[q.ans]}</span>}
          </div>
          <div style={{fontSize:11,color:T.t3,marginTop:6,fontStyle:"italic"}}>{q.expl}</div>
        </div>
      ))}
      <button onClick={()=>{setResult(null);setAnswers({});setTimer(900);}} style={s.btnS}>Back to Exams</button>
    </div>
  );
  const examList=[
    {title:"Mid-Semester Examination",code:(courses[0]&&courses[0].code)||"",date:"Mar 21, 2026",dur:"45 min",status:"open",total:20,score:null},
    {title:"CAT 2 Assessment",code:(courses[1]&&courses[1].code)||"",date:"Mar 24, 2026",dur:"30 min",status:"upcoming",total:30,score:null},
    {title:"CAT 1 — Completed",code:(courses[0]&&courses[0].code)||"",date:"Mar 10, 2026",dur:"30 min",status:"done",total:20,score:17},
  ];
  return(
    <div>
      <h1 style={s.h1}>{t("exams")}</h1>
      <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{(fld&&fld.icon)} {(fld&&fld.name)}</span>Scheduled exams and CATs</p>
      <div style={{display:"grid",gap:12}}>
        {examList.map((ex,i)=>(
          <div key={i} style={{...s.card,display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,background:ex.status==="open"?rgba(T.green,0.18):ex.status==="done"?rgba(T.t3,0.18):rgba(T.amber,0.18),borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
              {ex.status==="open"?"E":ex.status==="done"?"C":"S"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:T.t1}}>{ex.title}</div>
              <div style={{fontSize:11,color:T.t3,marginTop:3}}>{ex.code} · {ex.date} · {ex.dur} · {ex.total} marks</div>
              {ex.score!==null&&<div style={{fontSize:12,color:T.green,marginTop:3}}>Score: {ex.score}/{ex.total} ({Math.round(ex.score/ex.total*100)}%)</div>}
            </div>
            {ex.status==="open"&&<button onClick={()=>{setActive(true);setAnswers({});setTimer(900);setResult(null);}} style={s.btnP}>Start</button>}
            {ex.status==="upcoming"&&<Pill text="Scheduled" color={T.amber}/>}
            {ex.status==="done"&&<Pill text="Done" color={T.green}/>}
          </div>
        ))}
      </div>
    </div>
  );
};

const AssignmentsView=({userField,role,userName,userId})=>{
  const T=useT();const s=sx(T);
  const [assignments,setAssignments]=useState([]);
  const [submissions,setSubmissions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showCreate,setShowCreate]=useState(false);
  const [selected,setSelected]=useState(null);
  const [submitting,setSubmitting]=useState(false);
  const [grading,setGrading]=useState(null);
  const [newA,setNewA]=useState({title:"",description:"",course_code:"",due_date:"",max_marks:100,target_year:"all"});
  const [assignmentFile,setAssignmentFile]=useState(null);
  const assignFileRef=useRef(null);
  const [subComment,setSubComment]=useState("");
  const [subFile,setSubFile]=useState(null);
  const [gradeFeedback,setGradeFeedback]=useState("");
  const [gradeMarks,setGradeMarks]=useState("");
  const fileRef=useRef(null);
  const isLec=role==="lecturer"||role==="admin";

  const load=async()=>{
    setLoading(true);
    const {supabase}=await import("./supabase.js");
    const {data:asgn}=await supabase.from("assignments").select("*").eq("field",userField).order("created_at",{ascending:false});
    const {data:subs}=await supabase.from("submissions").select("*").order("submitted_at",{ascending:false});
    setAssignments(asgn||[]);
    setSubmissions(subs||[]);
    setLoading(false);
  };

  useEffect(()=>{load();},[userField]);

  const createAssignment=async()=>{
    if(!newA.title||!newA.course_code){return;}
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    let fileUrl="";
    if(assignmentFile){
      const path=`assignments/${userField}/${Date.now()}_${assignmentFile.name.replace(/\s+/g,"_")}`;
      const {data:upData}=await supabase.storage.from("course-materials").upload(path,assignmentFile);
      if(upData){const {data:urlData}=supabase.storage.from("course-materials").getPublicUrl(path);fileUrl=urlData.publicUrl;}
    }
    await supabase.from("assignments").insert({...newA,field:userField,created_by:user.id,file_url:fileUrl||null});
    // Notify relevant students by email
    try{
      const query=supabase.from("profiles").select("*").eq("status","approved").eq("role","student").eq("field",userField);
      const {data:students}=newA.target_year==="all"?await query:await query.eq("year_level",newA.target_year);
      if(students&&students.length>0){
        const {sendAssignmentEmail}=await import("./email.js");
        for(const st of students){
          if(st.email) await sendAssignmentEmail(st.email,st.full_name||"Student",{...newA,field:userField});
        }
      }
    }catch(e){console.error("Email error:",e);}
    setShowCreate(false);setNewA({title:"",description:"",course_code:"",due_date:"",max_marks:100,target_year:"all"});setAssignmentFile(null);
    load();
  };

  const submitAssignment=async(assignmentId)=>{
    if(!subFile&&!subComment){return;}
    setSubmitting(true);
    const {supabase}=await import("./supabase.js");
    const {data:{user}}=await supabase.auth.getUser();
    let fileUrl="";
    if(subFile){
      const path=`submissions/${assignmentId}/${user.id}_${Date.now()}_${subFile.name}`;
      const {data:upData}=await supabase.storage.from("course-materials").upload(path,subFile);
      if(upData){const {data:urlData}=supabase.storage.from("course-materials").getPublicUrl(path);fileUrl=urlData.publicUrl;}
    }
    await supabase.from("submissions").insert({
      assignment_id:assignmentId,student_id:user.id,student_name:userName,
      file_url:fileUrl,comment:subComment,status:"submitted"
    });
    setSubComment("");setSubFile(null);setSelected(null);
    load();setSubmitting(false);
  };

  const gradeSubmission=async(subId)=>{
    if(!gradeMarks){return;}
    const {supabase}=await import("./supabase.js");
    await supabase.from("submissions").update({marks:parseInt(gradeMarks),feedback:gradeFeedback,status:"graded"}).eq("id",subId);
    setGrading(null);setGradeFeedback("");setGradeMarks("");
    load();
  };

  const mySubmission=(aId)=>submissions.find(s=>s.assignment_id===aId&&s.student_name===userName);
  const asgSubmissions=(aId)=>submissions.filter(s=>s.assignment_id===aId);
  const isOverdue=(d)=>d&&new Date(d)<new Date();

  if(loading) return <div style={{...s.card,textAlign:"center",padding:"3rem",color:T.t3}}>Loading assignments...</div>;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div>
          <h1 style={s.h1}>Assignments</h1>
          <p style={s.sub}>{assignments.length} assignment{assignments.length!==1?"s":""} · {userField}</p>
        </div>
        {isLec&&<button onClick={()=>setShowCreate(!showCreate)} style={s.btnP}>+ New Assignment</button>}
      </div>

      {isLec&&showCreate&&(
        <div style={{...s.card,marginBottom:"1.25rem",border:`1px solid ${rgba(T.ac,0.3)}`}}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Create Assignment</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} placeholder="e.g. Risk Theory Problem Set 1" value={newA.title} onChange={e=>setNewA({...newA,title:e.target.value})}/></div>
            <div><label style={s.lbl}>COURSE CODE</label><input style={s.input} placeholder="e.g. SAC 406" value={newA.course_code} onChange={e=>setNewA({...newA,course_code:e.target.value})}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>DUE DATE</label><input style={s.input} type="date" value={newA.due_date} onChange={e=>setNewA({...newA,due_date:e.target.value})}/></div>
            <div><label style={s.lbl}>MAX MARKS</label><input style={s.input} type="number" value={newA.max_marks} onChange={e=>setNewA({...newA,max_marks:parseInt(e.target.value)||100})}/></div>
          </div>
          <div style={{marginBottom:"0.75rem"}}>
            <label style={s.lbl}>TARGET YEAR GROUP</label>
            <select style={s.input} value={newA.target_year} onChange={e=>setNewA({...newA,target_year:e.target.value})}>
              <option value="all">All Students (All Years)</option>
              <option value="Year 1">Year 1 Only</option>
              <option value="Year 2">Year 2 Only</option>
              <option value="Year 3">Year 3 Only</option>
              <option value="Year 4">Year 4 Only</option>
              <option value="Masters Sem 1">Masters Sem 1</option>
              <option value="Masters Sem 2">Masters Sem 2</option>
              <option value="PhD Year 1">PhD Year 1</option>
              <option value="PhD Year 2">PhD Year 2</option>
              <option value="PhD Year 3+">PhD Year 3+</option>
            </select>
          </div>
          <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>DESCRIPTION / INSTRUCTIONS</label><textarea style={{...s.input,height:80,resize:"vertical"}} placeholder="Assignment instructions..." value={newA.description} onChange={e=>setNewA({...newA,description:e.target.value})}/></div>
          <div style={{marginBottom:"1rem"}}>
            <label style={s.lbl}>ATTACH ASSIGNMENT FILE (PDF, Word, LaTeX — optional)</label>
            <div onClick={()=>assignFileRef.current&&assignFileRef.current.click()} style={{border:`2px dashed ${assignmentFile?T.green:T.bd}`,borderRadius:8,padding:"0.75rem",textAlign:"center",cursor:"pointer",color:assignmentFile?T.green:T.t3,fontSize:12}}>
              {assignmentFile?"✓ "+assignmentFile.name+" ("+(assignmentFile.size/1024/1024).toFixed(1)+"MB)":"Click to attach assignment document"}
            </div>
            <input ref={assignFileRef} type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.tex,.txt" onChange={e=>setAssignmentFile(e.target.files[0]||null)}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={createAssignment} style={s.btnP}>Create Assignment</button>
            <button onClick={()=>setShowCreate(false)} style={s.btnS}>Cancel</button>
          </div>
        </div>
      )}

      {assignments.length===0?(
        <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
          <div style={{fontSize:40,marginBottom:12}}>📋</div>
          <div style={{fontSize:14,color:T.t2,marginBottom:8}}>No assignments yet.</div>
          {isLec&&<div style={{fontSize:12,color:T.t3}}>Click "+ New Assignment" to create one.</div>}
        </div>
      ):(
        <div style={{display:"grid",gap:12}}>
          {assignments.map(a=>{
            const mySub=mySubmission(a.id);
            const subs=asgSubmissions(a.id);
            const overdue=isOverdue(a.due_date);
            const submitted=!!mySub;
            return(
              <div key={a.id} style={{...s.card,borderLeft:`3px solid ${submitted?T.green:overdue?T.red:T.ac}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:15,fontWeight:600,color:T.t1}}>{a.title}</span>
                      <span style={{background:rgba(T.ac,0.15),color:T.ac,borderRadius:4,padding:"1px 8px",fontSize:10,fontWeight:600}}>{a.course_code}</span>
                      {submitted&&<span style={{background:rgba(T.green,0.15),color:T.green,borderRadius:4,padding:"1px 8px",fontSize:10,fontWeight:600}}>✓ Submitted</span>}
                      {mySub&&mySub.status==="graded"&&<span style={{background:rgba(T.purple,0.15),color:T.purple,borderRadius:4,padding:"1px 8px",fontSize:10,fontWeight:600}}>Graded: {mySub.marks}/{a.max_marks}</span>}
                      {overdue&&!submitted&&<span style={{background:rgba(T.red,0.15),color:T.red,borderRadius:4,padding:"1px 8px",fontSize:10,fontWeight:600}}>Overdue</span>}
                    </div>
                    {a.description&&<div style={{fontSize:12,color:T.t2,marginBottom:6,lineHeight:1.6}}>{a.description}</div>}
                    {a.file_url&&<a href={a.file_url} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,color:T.ac,marginBottom:6,textDecoration:"none",background:rgba(T.ac,0.1),borderRadius:6,padding:"4px 10px",border:`1px solid ${rgba(T.ac,0.3)}`}}>📎 Download Assignment Document</a>}
                    <div style={{fontSize:11,color:T.t3}}>
                      {a.due_date&&<span style={{marginRight:12}}>📅 Due: {new Date(a.due_date).toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"})}</span>}
                      <span>Max: {a.max_marks} marks</span>
                      {isLec&&<span style={{marginLeft:12}}>📥 {subs.length} submission{subs.length!==1?"s":""}</span>}
                    </div>
                    {mySub&&mySub.feedback&&<div style={{marginTop:8,padding:"8px 12px",background:rgba(T.purple,0.1),border:`1px solid ${rgba(T.purple,0.3)}`,borderRadius:8,fontSize:12,color:T.t1}}>💬 Feedback: {mySub.feedback}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                    {!isLec&&!submitted&&!overdue&&<button onClick={()=>setSelected(selected===a.id?null:a.id)} style={s.btnP}>Submit →</button>}
                    {!isLec&&submitted&&mySub.file_url&&<a href={mySub.file_url} target="_blank" rel="noreferrer" style={{...s.btnS,textDecoration:"none",fontSize:11,padding:"5px 12px"}}>View My Submission</a>}
                    {isLec&&subs.length>0&&<button onClick={()=>setSelected(selected===a.id?null:a.id)} style={{...s.btnS,fontSize:11}}>View Submissions ({subs.length})</button>}
                  </div>
                </div>

                {selected===a.id&&!isLec&&!submitted&&(
                  <div style={{marginTop:"1rem",borderTop:`1px solid ${T.bd}`,paddingTop:"1rem"}}>
                    <div style={{fontSize:13,fontWeight:500,color:T.t1,marginBottom:"0.75rem"}}>Submit Your Work</div>
                    <div style={{marginBottom:"0.75rem"}}>
                      <label style={s.lbl}>UPLOAD FILE (PDF, Word, images)</label>
                      <div onClick={()=>fileRef.current&&fileRef.current.click()} style={{border:`2px dashed ${subFile?T.green:T.bd}`,borderRadius:8,padding:"0.75rem",textAlign:"center",cursor:"pointer",color:subFile?T.green:T.t3,fontSize:12,marginBottom:6}}>
                        {subFile?"✓ "+subFile.name:"Click to attach file"}
                      </div>
                      <input ref={fileRef} type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e=>setSubFile(e.target.files[0]||null)}/>
                    </div>
                    <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>COMMENT (optional)</label><textarea style={{...s.input,height:60,resize:"vertical"}} placeholder="Any notes for your lecturer..." value={subComment} onChange={e=>setSubComment(e.target.value)}/></div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>submitAssignment(a.id)} style={s.btnP} disabled={submitting}>{submitting?"Submitting...":"Submit Assignment"}</button>
                      <button onClick={()=>setSelected(null)} style={s.btnS}>Cancel</button>
                    </div>
                  </div>
                )}

                {selected===a.id&&isLec&&subs.length>0&&(
                  <div style={{marginTop:"1rem",borderTop:`1px solid ${T.bd}`,paddingTop:"1rem"}}>
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
                              {sub.feedback&&<div style={{fontSize:12,color:T.t2,marginTop:4}}>Feedback: {sub.feedback}</div>}
                            </div>
                            <div style={{display:"flex",gap:6,flexShrink:0}}>
                              {sub.file_url&&<a href={sub.file_url} target="_blank" rel="noreferrer" style={{...s.btnS,fontSize:11,padding:"5px 10px",textDecoration:"none"}}>📄 View</a>}
                              <button onClick={()=>setGrading(grading===sub.id?null:sub.id)} style={{...s.btnP,fontSize:11,padding:"5px 10px"}}>{sub.status==="graded"?"Re-grade":"Grade"}</button>
                            </div>
                          </div>
                          {grading===sub.id&&(
                            <div style={{marginTop:10,display:"grid",gridTemplateColumns:"100px 1fr auto",gap:8,alignItems:"end"}}>
                              <div><label style={s.lbl}>MARKS /{a.max_marks}</label><input style={s.input} type="number" placeholder="0" value={gradeMarks} onChange={e=>setGradeMarks(e.target.value)}/></div>
                              <div><label style={s.lbl}>FEEDBACK</label><input style={s.input} placeholder="Comments for student..." value={gradeFeedback} onChange={e=>setGradeFeedback(e.target.value)}/></div>
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
const ResearchView=({userField})=>{
  const T=useT();const t=useLang();const s=sx(T);const fld=FIELDS[userField];
  const [mode,setMode]=useState("check");
  const [file,setFile]=useState(null);
  const [text,setText]=useState("");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const fileRef=useRef(null);
  const modeBtns=[{id:"check",label:"Plagiarism & AI Check"},{id:"submit",label:"Submit Research"},{id:"library",label:"Research Library"}];

  const analyzeText=async(content)=>{
    setLoading(true);setError("");setResult(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:2000,
          messages:[{role:"user",content:`You are an expert academic integrity analyst with the accuracy of Turnitin and GPTZero combined. Analyze the following academic text and provide a detailed assessment.

TEXT TO ANALYZE:
"""
${content.slice(0,8000)}
"""

Provide your analysis as a JSON object with these exact fields:
{
  "similarity_index": <number 0-100, estimated plagiarism similarity percentage>,
  "ai_content_percentage": <number 0-100, percentage likely AI-generated>,
  "human_content_percentage": <number 0-100, percentage likely human-written>,
  "word_count": <number>,
  "sentence_count": <number>,
  "readability_score": <number 0-100, Flesch reading ease>,
  "readability_label": <"Very Easy"|"Easy"|"Fairly Easy"|"Standard"|"Fairly Difficult"|"Difficult"|"Very Difficult">,
  "ai_indicators": [<list of specific phrases or patterns that suggest AI generation>],
  "originality_indicators": [<list of specific phrases or patterns that suggest human/original writing>],
  "suspicious_sections": [<list of sentences that may be copied or AI-generated>],
  "overall_verdict": <"Likely Original"|"Possibly AI-Assisted"|"Likely AI-Generated"|"Potentially Plagiarized">,
  "confidence": <number 0-100>,
  "recommendations": [<list of specific actionable improvements>],
  "summary": <2-3 sentence overall assessment>
}

Be thorough, accurate and specific. Return ONLY the JSON object, no other text.`}]
        })
      });
      const d=await res.json();
      const txt=d.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"{}";
      const clean=txt.replace(/```json|```/g,"").trim();
      const jsonStart=clean.indexOf("{");const jsonEnd=clean.lastIndexOf("}");
      const parsed=JSON.parse(clean.slice(jsonStart,jsonEnd+1));
      setResult(parsed);
    }catch(e){
      setError("Analysis failed: "+e.message+". Please try again.");
      console.error("Research analysis error:",e);
    }
    setLoading(false);
  };

  const handleFile=async(f)=>{
    setFile(f);
    if(f.type==="text/plain"){
      const reader=new FileReader();
      reader.onload=e=>setText(e.target.result);
      reader.readAsText(f);
    } else if(f.type==="application/pdf"){
      // Read PDF as base64 and send to Claude for extraction
      const reader=new FileReader();
      reader.onload=async(e)=>{
        const base64=e.target.result.split(",")[1];
        setLoading(true);
        try{
          const res=await fetch("https://api.anthropic.com/v1/messages",{
            method:"POST",
            headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
            body:JSON.stringify({
              model:"claude-sonnet-4-20250514",
              max_tokens:4000,
              messages:[{role:"user",content:[
                {type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},
                {type:"text",text:"Extract and return ALL the text content from this PDF document. Return only the raw text, preserving paragraphs. No summaries, no comments."}
              ]}]
            })
          });
          const d=await res.json();
          const extracted=d.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"";
          setText(extracted);
        }catch(e){
          setText("");
          setError("Could not read PDF. Please paste the text manually.");
        }
        setLoading(false);
      };
      reader.readAsDataURL(f);
    } else {
      // For Word docs, ask user to paste text
      setText("");
      setError("For Word documents, please copy and paste the text into the text area below.");
    }
  };

  const verdictColor=(v)=>{
    if(v==="Likely Original") return T.green;
    if(v==="Possibly AI-Assisted") return T.amber;
    if(v==="Likely AI-Generated"||v==="Potentially Plagiarized") return T.red;
    return T.t2;
  };

  const ScoreRing=({value,label,color})=>(
    <div style={{textAlign:"center",padding:"1rem"}}>
      <div style={{position:"relative",width:80,height:80,margin:"0 auto 8px"}}>
        <svg viewBox="0 0 80 80" style={{transform:"rotate(-90deg)"}}>
          <circle cx="40" cy="40" r="32" fill="none" stroke={T.bg3} strokeWidth="8"/>
          <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${2*Math.PI*32}`}
            strokeDashoffset={`${2*Math.PI*32*(1-value/100)}`}
            strokeLinecap="round"/>
        </svg>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:16,fontWeight:700,color}}>{value}%</div>
      </div>
      <div style={{fontSize:11,color:T.t2,fontWeight:500}}>{label}</div>
    </div>
  );

  return(
    <div>
      <h1 style={s.h1}>{t("research")}</h1>
      <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{fld&&fld.icon} {fld&&fld.name}</span>Plagiarism detection · AI content analysis · Academic integrity</p>
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
        {modeBtns.map(mb=>(
          <button key={mb.id} onClick={()=>setMode(mb.id)} style={{...(mode===mb.id?s.btnP:s.btnS),fontSize:12}}>{mb.label}</button>
        ))}
      </div>

      {mode==="check"&&(
        <div>
          {!result&&!loading&&(
            <div style={s.card}>
              <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Upload or Paste Your Text</div>
              <div style={{border:`2px dashed ${file?T.green:T.bd}`,borderRadius:8,padding:"1.5rem",textAlign:"center",color:file?T.green:T.t3,marginBottom:"1rem",fontSize:12,transition:"all 0.2s"}}>
                {file?(
                  <div>
                    <div style={{fontSize:24,marginBottom:4}}>✓</div>
                    <div style={{fontWeight:500}}>{file.name}</div>
                    <div style={{fontSize:11,marginTop:4}}>({(file.size/1024).toFixed(0)} KB)</div>
                  </div>
                ):(
                  <div>
                    <div style={{fontSize:32,marginBottom:8}}>📄</div>
                    <div style={{fontWeight:500,marginBottom:4}}>Upload PDF, DOCX, or TXT</div>
                    <div style={{fontSize:11,marginBottom:12}}>Max 10MB — or paste text below</div>
                  </div>
                )}
                <label style={{...s.btnS,cursor:"pointer",display:"inline-block",fontSize:12,padding:"7px 18px"}}>
                  {file?"Change File":"Choose File"}
                  <input type="file" style={{display:"none"}} accept=".txt,.pdf,.doc,.docx" onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
                </label>
              </div>
              <div style={{marginBottom:"1rem"}}>
                <label style={s.lbl}>PASTE TEXT FOR ANALYSIS</label>
                <textarea style={{...s.input,height:160,resize:"vertical",fontSize:12,lineHeight:1.6}} placeholder="Paste your essay, research paper, or any academic text here..." value={text} onChange={e=>setText(e.target.value)}/>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={()=>text.trim().length>50?analyzeText(text):setError("Please provide at least 50 characters of text to analyze.")} style={{...s.btnP,fontSize:13,padding:"10px 24px"}} disabled={loading||!text.trim()}>
                  {loading?"Analyzing...":"🔍 Analyze Text"}
                </button>
                <span style={{fontSize:11,color:T.t3}}>Powered by Claude AI · Results in 10-20 seconds</span>
              </div>
              {error&&<div style={{marginTop:8,fontSize:12,color:T.red}}>{error}</div>}
            </div>
          )}

          {loading&&(
            <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
              <div style={{fontSize:40,marginBottom:16}}>🔍</div>
              <div style={{fontSize:16,fontWeight:600,color:T.t1,marginBottom:8}}>Analyzing your text...</div>
              <div style={{fontSize:12,color:T.t3,marginBottom:"1.5rem"}}>Checking for plagiarism patterns, AI indicators, and readability</div>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                {["Scanning for similarity","Detecting AI patterns","Measuring readability","Generating report"].map((s,i)=>(
                  <div key={i} style={{background:T.bg3,borderRadius:20,padding:"4px 12px",fontSize:11,color:T.t2}}>⟳ {s}</div>
                ))}
              </div>
            </div>
          )}

          {result&&!loading&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
                <h2 style={{...s.h1,marginBottom:0}}>Analysis Report</h2>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{setResult(null);setFile(null);setText("");}} style={s.btnS}>New Analysis</button>
                </div>
              </div>

              <div style={{...s.card,borderLeft:`4px solid ${verdictColor(result.overall_verdict)}`,marginBottom:"1rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                  <div>
                    <div style={{fontSize:11,color:T.t3,marginBottom:4}}>OVERALL VERDICT</div>
                    <div style={{fontSize:20,fontWeight:700,color:verdictColor(result.overall_verdict)}}>{result.overall_verdict}</div>
                    <div style={{fontSize:12,color:T.t2,marginTop:4}}>{result.summary}</div>
                  </div>
                  <div style={{background:T.bg3,borderRadius:8,padding:"8px 16px",textAlign:"center"}}>
                    <div style={{fontSize:11,color:T.t3}}>CONFIDENCE</div>
                    <div style={{fontSize:22,fontWeight:700,color:T.ac}}>{result.confidence}%</div>
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1rem"}}>
                <div style={s.card}>
                  <ScoreRing value={result.similarity_index} label="Similarity Index" color={result.similarity_index>30?T.red:result.similarity_index>15?T.amber:T.green}/>
                </div>
                <div style={s.card}>
                  <ScoreRing value={result.ai_content_percentage} label="AI Content" color={result.ai_content_percentage>50?T.red:result.ai_content_percentage>25?T.amber:T.green}/>
                </div>
                <div style={s.card}>
                  <ScoreRing value={result.human_content_percentage} label="Human Written" color={result.human_content_percentage>70?T.green:result.human_content_percentage>50?T.amber:T.red}/>
                </div>
                <div style={s.card}>
                  <ScoreRing value={result.readability_score} label={result.readability_label||"Readability"} color={T.blue}/>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
                <div style={s.card}>
                  <div style={{fontSize:12,fontWeight:600,color:T.t1,marginBottom:8}}>Document Stats</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[["Words",result.word_count],["Sentences",result.sentence_count]].map(([k,v])=>(
                      <div key={k} style={{background:T.bg3,borderRadius:6,padding:"8px 10px"}}>
                        <div style={{fontSize:10,color:T.t3}}>{k.toUpperCase()}</div>
                        <div style={{fontSize:16,fontWeight:600,color:T.t1}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={s.card}>
                  <div style={{fontSize:12,fontWeight:600,color:T.t1,marginBottom:8}}>Recommendations</div>
                  <div style={{display:"grid",gap:6}}>
                    {(result.recommendations||[]).slice(0,3).map((r,i)=>(
                      <div key={i} style={{fontSize:11,color:T.t2,display:"flex",gap:6}}>
                        <span style={{color:T.ac,flexShrink:0}}>→</span>{r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {result.suspicious_sections&&result.suspicious_sections.length>0&&(
                <div style={{...s.card,marginBottom:"1rem"}}>
                  <div style={{fontSize:12,fontWeight:600,color:T.red,marginBottom:8}}>⚠ Flagged Sections</div>
                  <div style={{display:"grid",gap:6}}>
                    {result.suspicious_sections.slice(0,5).map((sec,i)=>(
                      <div key={i} style={{background:rgba(T.red,0.08),border:`1px solid ${rgba(T.red,0.2)}`,borderRadius:6,padding:"8px 10px",fontSize:11,color:T.t1,lineHeight:1.5,fontStyle:"italic"}}>"{sec}"</div>
                    ))}
                  </div>
                </div>
              )}

              {result.ai_indicators&&result.ai_indicators.length>0&&(
                <div style={s.card}>
                  <div style={{fontSize:12,fontWeight:600,color:T.amber,marginBottom:8}}>🤖 AI Writing Indicators</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {result.ai_indicators.slice(0,6).map((ind,i)=>(
                      <span key={i} style={{background:rgba(T.amber,0.12),color:T.amber,borderRadius:6,padding:"3px 10px",fontSize:11}}>{ind}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {mode==="submit"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>New Research Submission</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} placeholder="Research title"/></div>
            <div><label style={s.lbl}>AUTHOR(S)</label><input style={s.input} placeholder="All authors"/></div>
            <div><label style={s.lbl}>SUPERVISOR</label><input style={s.input} placeholder="Supervisor name"/></div>
            <div><label style={s.lbl}>TYPE</label><select style={s.input}>{["Undergraduate Project","Masters Dissertation","PhD Thesis","Conference Paper"].map(v=><option key={v}>{v}</option>)}</select></div>
          </div>
          <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>ABSTRACT</label><textarea style={{...s.input,minHeight:80,resize:"vertical"}} placeholder="Summary..."/></div>
          <div style={{border:`2px dashed ${T.bd}`,borderRadius:8,padding:"1.5rem",textAlign:"center",color:T.t3,cursor:"pointer",marginBottom:"1rem",fontSize:12}}>Upload PDF or DOCX · Max 50MB</div>
          <button style={s.btnP}>Submit</button>
        </div>
      )}

      {mode==="library"&&(
        <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
          <div style={{fontSize:40,marginBottom:12}}>📚</div>
          <div style={{fontSize:14,color:T.t2}}>Research library coming soon.</div>
          <div style={{fontSize:12,color:T.t3,marginTop:4}}>Browse and share research papers within AKADIMIA.</div>
        </div>
      )}
    </div>
  );
};
const AIView=({lang,userField})=>{
  const T=useT();const t=useLang();const s=sx(T);const fld=FIELDS[userField];
  const [msgs,setMsgs]=useState([{role:"bot",text:`Karibu! I'm EduBot, AKADIMIA's AI tutor. I specialise in ${(fld&&fld.name)}. Ask me anything about your coursework, assignments, research or career — available 24/7!`}]);
  const [inp,setInp]=useState(""),[loading,setL]=useState(false);const scrollRef=useRef(null);
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[msgs]);
  const R={
    assignment:`For ${(fld&&fld.name)} assignments: read the rubric carefully, break work into sections, cite all sources properly, and review before submission.`,
    exam:`Exam prep for ${(fld&&fld.name)}: review past papers for patterns, make concise notes, practice timed questions, and form study groups.`,
    career:`Strong career paths in ${(fld&&fld.name)} in East Africa include: ${(FIELD_DATA[userField]&&FIELD_DATA[userField].bodies).slice(0,2).join(", ")}. Joining a professional body early builds your network.`,
    research:`Strong research needs: clear problem statement, justified methodology, honest limitations, and conclusions tied to objectives.`,
    trend:`Current trends in ${(fld&&fld.name)}: ${(FIELD_DATA[userField]&&FIELD_DATA[userField].trends)?.join(" · ")}.`,
    default:`Great question about ${(fld&&fld.name)}! Could you give more context — which course is this for, and is it for an assignment, exam, or research?`,
  };
  const send=async()=>{
    if(!inp.trim())return;
    const q=inp.trim();setInp("");setL(true);setMsgs(m=>[...m,{role:"user",text:q}]);
    try {
      const {askClaude}=await import("./api.js");
      const reply=await askClaude(q,fld?.name||"Actuarial Science",lang);
      setMsgs(m=>[...m,{role:"bot",text:reply}]);
    } catch(e) {
      const key=Object.keys(R).find(k=>q.toLowerCase().includes(k))||"default";
      setMsgs(m=>[...m,{role:"bot",text:R[key]}]);
    }
    setL(false);
  };
  const topicBtns=["Assignment help","Exam prep","Career guidance","Emerging trends","Research tips"];
  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
      <h1 style={s.h1}>EduBot — AI Tutor</h1>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.75rem",flexWrap:"wrap"}}>
        <Pill text={(fld&&fld.icon)+" "+(fld&&fld.name)} color={(fld&&fld.color)||T.teal}/>
        <Pill text={(LANGS[lang]&&LANGS[lang].name)} color={T.teal}/>
        <Pill text="Anthropic Claude" color={T.purple}/>
        <Pill text="24/7" color={T.green}/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap"}}>
        {topicBtns.map(tp=><button key={tp} onClick={()=>setInp(tp)} style={{...s.btnS,fontSize:11,padding:"5px 12px"}}>{tp}</button>)}
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:"0.5rem"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            {m.role==="bot"&&<div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.ac},${T.acL})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginRight:8,marginTop:4}}>AI</div>}
            <div style={{maxWidth:"75%",background:m.role==="user"?`linear-gradient(135deg,${rgba(T.ac,0.25)},${rgba(T.ac,0.12)})`:T.bg3,border:`1px solid ${m.role==="user"?rgba(T.ac,0.3):T.bd}`,borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",fontSize:13,color:T.t1,lineHeight:1.65}}>
              {m.role==="bot"?<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{m.text}</ReactMarkdown>:m.text}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.ac},${T.acL})`,display:"flex",alignItems:"center",justifyContent:"center"}}>AI</div>
            <div style={{background:T.bg3,border:`1px solid ${T.bd}`,borderRadius:18,padding:"12px 18px"}}>
              <div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.t3}}/>)}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:8,paddingTop:"0.75rem",borderTop:`1px solid ${T.bd}`}}>
        <input style={{...s.input,flex:1}} placeholder={t("ask")} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
        <button onClick={send} style={{...s.btnP,flexShrink:0,padding:"9px 20px"}}>{t("send")}</button>
      </div>
    </div>
  );
};

const CalendarView=({setTab})=>{
  const T=useT();const t=useLang();const s=sx(T);const [sel,setSel]=useState(null);const today=20;
  const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const cells=[...Array(6).fill(null),...Array(31).fill(0).map((_,i)=>i+1)];
  const evOn=d=>CAL_EVENTS.filter(e=>e.d===d);
  return(
    <div>
      <h1 style={s.h1}>{t("calendar")}</h1>
      <p style={s.sub}>March 2026 · Academic schedule · Deadlines · Classes</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:12}}>
        <div style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
            <button style={{...s.btnS,fontSize:12,padding:"5px 12px"}}>Feb</button>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,color:T.t1}}>March 2026</span>
            <button style={{...s.btnS,fontSize:12,padding:"5px 12px"}}>Apr</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:8}}>
            {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:T.t3,padding:"4px 0",fontWeight:500}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {cells.map((d,i)=>{
              if(!d)return <div key={i}/>;
              const evs=evOn(d);const isT=d===today;const isS=d===sel;
              return(
                <div key={i} onClick={()=>setSel(d===sel?null:d)} style={{minHeight:50,background:isS?rgba(T.ac,0.18):isT?rgba(T.blue,0.2):T.bg3,border:`1px solid ${isS?T.ac:isT?T.blue:T.bd}`,borderRadius:7,padding:"4px 3px",cursor:"pointer"}}>
                  <div style={{fontSize:11,fontWeight:isT||isS?700:400,color:isT?T.blue:isS?T.ac:T.t2,textAlign:"center",marginBottom:2}}>{d}</div>
                  {evs.slice(0,2).map((ev,ei)=><div key={ei} style={{width:"100%",height:3,borderRadius:2,background:ev.col,marginBottom:2}}/>)}
                  {evs.length>2&&<div style={{fontSize:8,color:T.t3,textAlign:"center"}}>+{evs.length-2}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {sel?(
            <div style={s.card}>
              <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:"0.85rem"}}>{sel} March {sel===today&&<Pill text="Today" color={T.blue}/>}</div>
              {evOn(sel).length===0?<div style={{fontSize:12,color:T.t3}}>No events.</div>:evOn(sel).map((ev,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.bd}`}}>
                  <div style={{width:32,height:32,borderRadius:7,background:rgba(ev.col,0.18),display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>E</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:T.t1}}>{ev.label}</div>
                    <div style={{fontSize:11,color:T.t3,marginTop:2}}>{ev.time}</div>
                  </div>
                </div>
              ))}
              {evOn(sel).some(e=>e.type==="meeting")&&<button onClick={()=>setTab("meetings")} style={{...s.btnP,width:"100%",marginTop:"0.75rem",fontSize:12}}>Join Meeting</button>}
            </div>
          ):<div style={s.card}><div style={{fontSize:12,color:T.t2}}>Click a date to see events.</div></div>}
          <div style={s.card}>
            <div style={{fontSize:12,fontWeight:600,color:T.t1,marginBottom:"0.85rem"}}>Coming Up</div>
            {CAL_EVENTS.filter(e=>e.d>=today).slice(0,5).map((ev,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:7}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:ev.col,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:11,color:T.t1}}>{ev.label}</div>
                  <div style={{fontSize:10,color:T.t3}}>Mar {ev.d} · {ev.time}</div>
                </div>
              </div>
            ))}
            <button style={{...s.btnS,width:"100%",fontSize:11,marginTop:"0.5rem"}}>+ Add Event</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetingsView=()=>{
  const T=useT();const t=useLang();const s=sx(T);const [showSched,setShowSched]=useState(false);
  const PC={zoom:"#2D8CFF",meet:"#0F9D58",teams:"#6264A7"};
  const TC={class:T.teal,research:T.purple,peer:T.blue,industry:T.green,admin:T.amber};
  const durOpts=["30 min","1 hour","1.5 hours","2 hours"];
  const platOpts=["Zoom","Google Meet","Teams"];
  const typeOpts=["Class","Research","Peer","Industry","Admin"];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div><h1 style={s.h1}>{t("meetings")}</h1><p style={s.sub}>Zoom · Google Meet · Microsoft Teams</p></div>
        <button onClick={()=>setShowSched(!showSched)} style={s.btnP}>+ Schedule</button>
      </div>
      {showSched&&(
        <div style={{...s.card,marginBottom:"1.25rem",border:`1px solid ${rgba(T.ac,0.3)}`}}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Schedule Meeting</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} placeholder="Title"/></div>
            <div><label style={s.lbl}>DATE</label><input style={s.input} type="date"/></div>
            <div><label style={s.lbl}>TIME</label><input style={s.input} type="time"/></div>
            <div><label style={s.lbl}>DURATION</label><select style={s.input}>{durOpts.map(v=><option key={v}>{v}</option>)}</select></div>
            <div><label style={s.lbl}>PLATFORM</label><select style={s.input}>{platOpts.map(v=><option key={v}>{v}</option>)}</select></div>
            <div><label style={s.lbl}>TYPE</label><select style={s.input}>{typeOpts.map(v=><option key={v}>{v}</option>)}</select></div>
          </div>
          <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>PARTICIPANTS</label><input style={s.input} placeholder="name@buc.ke, ..."/></div>
          <div style={{display:"flex",gap:8}}>
            <button style={s.btnP}>Create &amp; Invite</button>
            <button onClick={()=>setShowSched(false)} style={s.btnS}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gap:10}}>
        {MEETINGS.map(m=>(
          <div key={m.id} style={s.card}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:42,height:42,borderRadius:10,background:rgba(PC[m.platform],0.18),border:`1px solid ${rgba(PC[m.platform],0.35)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>M</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:600,color:T.t1}}>{m.title}</span>
                  <Pill text={m.type} color={TC[m.type]}/>
                  {m.rec&&<Pill text="Recorded" color={T.cyan}/>}
                </div>
                <div style={{display:"flex",gap:"1rem",fontSize:11,color:T.t3}}>
                  <span>{m.host}</span><span>{m.date}</span><span>{m.time}</span><span>{m.dur}</span>
                </div>
              </div>
              <a href="#" style={{...s.btnP,textDecoration:"none",fontSize:12,padding:"7px 14px",background:`linear-gradient(135deg,${PC[m.platform]},${PC[m.platform]}cc)`,flexShrink:0}}>Join</a>
            </div>
            <div style={{display:"flex",gap:8,marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:`1px solid ${T.bd}`}}>
              {["Add to Calendar","Copy Link","Email Invite"].map(a=>(
                <button key={a} style={{...s.btnS,fontSize:11,padding:"4px 10px"}}>{a}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:2000,
          messages:[{role:"user",content:`Today is ${today}. List 12 realistic current opportunities for ${fieldName} students and professionals in Kenya and East Africa. Include a mix of: scholarships, grants, jobs, training programs, fellowships and networking events. Focus on well-known organizations like NRF, DAAD, AfDB, Mastercard Foundation, World Bank, UN agencies, Kenyan government, regional universities and professional bodies. For each include realistic deadlines in 2025-2026. Return ONLY a valid JSON array with these exact fields: title, org, type (one of: scholarship/grant/job/training/networking/fellowship), description (2 sentences max), deadline, url. No markdown, no explanation, just the JSON array.`}]
        })
      });
      const d=await res.json();
      console.log("API response:", JSON.stringify(d).slice(0,500));
      
      // Extract text from all content blocks including tool results
      let text="";
      if(d.content){
        for(const block of d.content){
          if(block.type==="text"&&block.text) text+=block.text;
          if(block.type==="tool_result"&&block.content){
            for(const inner of block.content){
              if(inner.type==="text") text+=inner.text;
            }
          }
        }
      }
      
      if(!text||text.trim()===""){
        // If no text, do a simpler call without web search
        const res2=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
          body:JSON.stringify({
            model:"claude-haiku-4-5-20251001",
            max_tokens:2000,
            messages:[{role:"user",content:`List 10 CURRENT opportunities for ${(fld&&fld.name)||userField} students in Kenya and East Africa as of ${new Date().toLocaleDateString()}. Include scholarships, grants, jobs, fellowships and training. Return ONLY a JSON array with fields: title, org, type, description, deadline, url. No other text.`}]
          })
        });
        const d2=await res2.json();
        text=d2.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"[]";
      }
      
      const clean=text.replace(/```json|```/g,"").trim();
      const jsonStart=clean.indexOf("[");
      const jsonEnd=clean.lastIndexOf("]");
      const jsonStr=jsonStart>=0&&jsonEnd>jsonStart?clean.slice(jsonStart,jsonEnd+1):"[]";
      const parsed=JSON.parse(jsonStr);
      setOpps(Array.isArray(parsed)?parsed:[]);
      setLastFetched(new Date());
    }catch(e){
      setError("Could not fetch opportunities. Please try again.");
      console.error(e);
    }
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
          <p style={s.sub}>
            <span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{fld&&fld.icon} {fld&&fld.name}</span>
            {lastFetched?`Last updated: ${lastFetched.toLocaleTimeString()}`:"Loading current opportunities..."}
          </p>
        </div>
        <button onClick={fetchOpps} style={{...s.btnP,fontSize:12,padding:"8px 16px"}} disabled={loading}>
          {loading?"🔄 Searching...":"🔄 Refresh"}
        </button>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:"1.25rem",flexWrap:"wrap"}}>
        {types.map(type=>(
          <button key={type} onClick={()=>setFilter(type)} style={{...(filter===type?s.btnP:s.btnS),fontSize:11,padding:"5px 12px",textTransform:"capitalize"}}>
            {type==="all"?"All":type}
          </button>
        ))}
      </div>

      {error&&<div style={{...s.card,color:T.red,textAlign:"center",padding:"1.5rem"}}>{error} <button onClick={fetchOpps} style={{...s.btnS,marginLeft:8,fontSize:11}}>Retry</button></div>}

      {loading&&(
        <div style={{display:"grid",gap:10}}>
          {[1,2,3,4].map(i=>(
            <div key={i} style={{...s.card,background:T.bg3,animation:"pulse 1.5s infinite"}}>
              <div style={{height:16,background:T.bg4,borderRadius:4,width:"60%",marginBottom:8}}/>
              <div style={{height:12,background:T.bg4,borderRadius:4,width:"40%",marginBottom:8}}/>
              <div style={{height:12,background:T.bg4,borderRadius:4,width:"80%"}}/>
            </div>
          ))}
        </div>
      )}

      {!loading&&!error&&filtered.length===0&&(
        <div style={{...s.card,textAlign:"center",padding:"3rem"}}>
          <div style={{fontSize:40,marginBottom:12}}>🌍</div>
          <div style={{fontSize:14,color:T.t2}}>No {filter==="all"?"":filter} opportunities found. Try refreshing.</div>
        </div>
      )}

      {!loading&&filtered.length>0&&(
        <div style={{display:"grid",gap:10}}>
          {filtered.map((o,i)=>{
            const tc=typeColor[(o.type||"").toLowerCase()]||T.t2;
            return(
              <div key={i} style={{...s.card,borderLeft:`3px solid ${tc}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:600,color:T.t1}}>{o.title}</span>
                      <span style={{background:rgba(tc,0.15),color:tc,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600,textTransform:"capitalize"}}>{o.type||"opportunity"}</span>
                    </div>
                    <div style={{fontSize:12,color:T.ac,fontWeight:500,marginBottom:4}}>{o.org}</div>
                    <div style={{fontSize:12,color:T.t2,lineHeight:1.6,marginBottom:o.deadline?6:0}}>{o.description}</div>
                    {o.deadline&&<div style={{fontSize:11,color:T.amber}}>⏰ Deadline: {o.deadline}</div>}
                  </div>
                  <div style={{flexShrink:0}}>
                    {o.url&&o.url!=="N/A"&&o.url.startsWith("http")?(
                      <a href={o.url} target="_blank" rel="noreferrer" style={{...s.btnP,fontSize:11,padding:"6px 14px",textDecoration:"none",display:"inline-block"}}>Apply →</a>
                    ):(
                      <button onClick={()=>{}} style={{...s.btnS,fontSize:11,padding:"6px 14px",opacity:0.5}} disabled>No Link</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading&&filtered.length>0&&(
        <div style={{...s.card,marginTop:"1rem",textAlign:"center",padding:"0.75rem"}}>
          <span style={{fontSize:11,color:T.t3}}>🤖 Opportunities sourced by AI web search · Always verify details on official websites · </span>
          <button onClick={fetchOpps} style={{...s.btnS,fontSize:10,padding:"3px 8px",marginLeft:4}}>Refresh for latest</button>
        </div>
      )}
    </div>
  );
};
const AnalyticsView=({userField})=>{
  const T=useT();const t=useLang();const s=sx(T);
  const courses=(FIELD_DATA[userField]&&FIELD_DATA[userField].courses)||[];const fld=FIELDS[userField];
  const RADAR=courses.map(c=>({s:c.code.replace(" ","").slice(0,6),you:c.p}));
  const BAR=courses.map(c=>({sub:c.code.slice(0,6),you:c.p,avg:Math.max(30,c.p-10)}));
  const strong=courses.filter(c=>c.p>=75);
  const weak=courses.filter(c=>c.p<60);
  return(
    <div>
      <h1 style={s.h1}>{t("analytics")}</h1>
      <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{(fld&&fld.icon)} {(fld&&fld.name)}</span>Strengths · Weaknesses · AI recommendations</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1.25rem"}}>
        <div style={s.card}>
          <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:"0.85rem"}}>Skill Radar</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR}>
              <PolarGrid stroke={T.bd}/>
              <PolarAngleAxis dataKey="s" tick={{fill:T.t3,fontSize:10}}/>
              <Radar name="You" dataKey="you" stroke={T.ac} fill={rgba(T.ac,0.25)} strokeWidth={2}/>
              <Tooltip contentStyle={{background:T.bg3,border:`1px solid ${T.bd}`,borderRadius:8,color:T.t1,fontSize:12}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={s.card}>
          <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:"0.85rem"}}>You vs Class Average</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BAR} layout="vertical" barSize={8}>
              <XAxis type="number" tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false} domain={[0,100]}/>
              <YAxis dataKey="sub" type="category" tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false} width={60}/>
              <Tooltip contentStyle={{background:T.bg3,border:`1px solid ${T.bd}`,borderRadius:8,color:T.t1,fontSize:12}}/>
              <Bar dataKey="you" name="Yours" fill={T.ac} radius={[0,3,3,0]}/>
              <Bar dataKey="avg" name="Class" fill={T.bg5} radius={[0,3,3,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={s.card}>
          <div style={{fontSize:13,fontWeight:600,color:T.green,marginBottom:"0.85rem"}}>Strengths</div>
          {strong.map((c,i)=>(
            <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.t1,marginBottom:4}}>
                <span>{c.code}</span><span style={{color:T.green,fontWeight:600}}>{c.p}%</span>
              </div>
              <Prog val={c.p} color={T.green}/>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <div style={{fontSize:13,fontWeight:600,color:T.red,marginBottom:"0.85rem"}}>Areas to Improve</div>
          {weak.map((c,i)=>{
            const wColor=c.p<40?T.red:T.amber;
            return(
              <div key={i} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.t1,marginBottom:4}}>
                  <span>{c.code}</span><span style={{color:wColor,fontWeight:600}}>{c.p}%</span>
                </div>
                <Prog val={c.p} color={wColor}/>
              </div>
            );
          })}
          <div style={{...s.acCard,marginTop:"0.75rem",padding:"0.75rem"}}>
            <div style={{fontSize:11,color:T.ac,marginBottom:6}}>AI Suggestion</div>
            <div style={{fontSize:11,color:T.t2,lineHeight:1.6}}>Focus on lowest-scoring units. Use EduBot daily and connect with top peers.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolsView=({userField})=>{
  const T=useT();const t=useLang();const s=sx(T);const fld=FIELDS[userField];
  const myTools=(FIELD_DATA[userField]&&FIELD_DATA[userField].tools)||["Python","R","STATA","SPSS"];
  const [sel,setSel]=useState(myTools[0]);const info=TOOLS_INFO[sel]||{};
  const resourceItems=[["Official Docs","Primary reference"],["Video Tutorials","Guided courses"],["Practice Datasets","Real-world data"],["Community Forum","Get help"]];
  return(
    <div>
      <h1 style={s.h1}>{t("tools")}</h1>
      <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{(fld&&fld.icon)} {(fld&&fld.name)}</span>Analytical tools used by professionals in your field</p>
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem",flexWrap:"wrap"}}>
        {myTools.map(tool=>{
          const inf=TOOLS_INFO[tool]||{};const active=sel===tool;
          return(
            <button key={tool} onClick={()=>setSel(tool)} style={{padding:"8px 18px",borderRadius:9,border:`1px solid ${active?(inf.color||T.ac):T.bd}`,background:active?rgba(inf.color||T.ac,0.18):T.bg2,color:active?(inf.color||T.ac):T.t2,fontSize:13,fontWeight:active?600:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {tool}
            </button>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:14}}>
        <div>
          <div style={{...s.card,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:600,color:info.color||T.ac,marginBottom:8}}>{sel}</div>
            <div style={{fontSize:12,color:T.t2,lineHeight:1.65,marginBottom:"1rem"}}>{info.desc}</div>
            <a href={info.link||"#"} target="_blank" rel="noreferrer" style={{...s.btnP,display:"block",textAlign:"center",textDecoration:"none",fontSize:12,padding:"8px"}}>Open {info.site||sel}</a>
          </div>
          <div style={s.card}>
            <div style={{fontSize:11,color:T.ac,fontWeight:700,letterSpacing:0.6,marginBottom:10}}>RESOURCES</div>
            {resourceItems.map(ri=>(
              <div key={ri[0]} style={{padding:"7px 0",borderBottom:`1px solid ${T.bd}`}}>
                <div style={{fontSize:12,color:T.t1,fontWeight:500,marginBottom:2}}>{ri[0]}</div>
                <div style={{fontSize:11,color:T.t3}}>{ri[1]}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={s.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.85rem"}}>
              <div style={{fontSize:14,fontWeight:600,color:T.t1}}>Getting Started with {sel}</div>
              <Pill text={sel} color={info.color||T.ac}/>
            </div>
            <div style={{background:T.bg0,border:`1px solid ${T.bd}`,borderRadius:10,padding:"1.1rem"}}>
              <pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.t1,margin:0,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{"# "+sel+" in "+(fld&&fld.name)+"\n# Open "+info.site+" to start coding\n# EduBot can generate field-specific examples"}</pre>
            </div>
            <div style={{display:"flex",gap:8,marginTop:"0.85rem"}}>
              <a href={info.link||"#"} target="_blank" rel="noreferrer" style={{...s.btnS,textDecoration:"none",fontSize:11,padding:"6px 14px"}}>Open Platform</a>
              <button style={{...s.btnP,fontSize:11,padding:"6px 14px"}}>Ask EduBot</button>
            </div>
          </div>
          <div style={s.acCard}>
            <div style={{fontSize:11,color:T.ac,letterSpacing:0.8,marginBottom:8}}>AI-POWERED LEARNING</div>
            <div style={{fontSize:12,color:T.t2,lineHeight:1.65,marginBottom:10}}>EduBot understands {sel} and can generate field-specific code examples for {(fld&&fld.name)}, explain errors, and suggest analysis workflows.</div>
            <button style={s.btnP}>Open EduBot</button>
          </div>
        </div>
      </div>
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
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1500,messages})
      });
      const d=await res.json();
      const text=d.content?.[0]?.text||"Could not generate analysis.";
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
const PeersView=({setTab,userField})=>{
  const T=useT();const t=useLang();const s=sx(T);const fld=FIELDS[userField];
  const peers=[
    {name:"Amara Osei",year:3,gpa:3.8,rank:1,strong:["Advanced Theory","Research"],weak:[]},
    {name:"Fatima Hassan",year:2,gpa:2.7,rank:24,strong:["Communication"],weak:["Core Modules"]},
    {name:"Brian Mutua",year:3,gpa:3.2,rank:8,strong:["Practical Skills","IT"],weak:["Theory"]},
    {name:"Akinyi Otieno",year:2,gpa:2.5,rank:30,strong:["Fieldwork"],weak:["Statistics"]},
  ];
  return(
    <div>
      <h1 style={s.h1}>{t("peers")}</h1>
      <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{(fld&&fld.icon)} {(fld&&fld.name)}</span>AI-matched study partners</p>
      <div style={{...s.acCard,marginBottom:"1.25rem",display:"flex",gap:12,alignItems:"center"}}>
        <div style={{fontSize:32}}>H</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:T.ac,marginBottom:4}}>AI Peer Match</div>
          <div style={{fontSize:12,color:T.t1,lineHeight:1.6}}>Amara Osei (Rank #1) is your top recommended peer. Akinyi needs help with Statistics — you can mentor her and earn peer-teaching recognition.</div>
        </div>
        <button onClick={()=>setTab("meetings")} style={{...s.btnP,flexShrink:0}}>Schedule Session</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {peers.map((p,i)=>(
          <div key={i} style={s.card}>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:"0.85rem"}}>
              <Av name={p.name} size={42} bg={p.rank<=5?T.ac:p.rank<=15?T.blue:T.purple}/>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:T.t1}}>{p.name}</div>
                <div style={{fontSize:11,color:T.t3}}>Year {p.year} · GPA {p.gpa} · Rank #{p.rank}</div>
              </div>
              {p.rank<=5&&<Pill text="Top 5" color={T.ac}/>}
            </div>
            {p.strong.length>0&&(
              <div style={{marginBottom:6,display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:10,color:T.green,fontWeight:600}}>STRONG: </span>
                {p.strong.map(x=><span key={x} style={sx(T).tag(T.green)}>{x}</span>)}
              </div>
            )}
            {p.weak.length>0&&(
              <div style={{marginBottom:"0.85rem",display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:10,color:T.red,fontWeight:600}}>NEEDS HELP: </span>
                {p.weak.map(x=><span key={x} style={sx(T).tag(T.red)}>{x}</span>)}
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button style={{...s.btnS,flex:1,fontSize:11,padding:"6px"}}>Message</button>
              <button onClick={()=>setTab("meetings")} style={{...s.btnP,flex:1,fontSize:11,padding:"6px"}}>Meet</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClassroomView=({userField})=>{
  const T=useT();const t=useLang();const s=sx(T);
  const [ltab,setLtab]=useState("courses"),[showNew,setShowNew]=useState(false);
  const fld=FIELDS[userField];const courses=(FIELD_DATA[userField]&&FIELD_DATA[userField].courses)||[];
  const SUBS=[
    {student:"Amara Osei",unit:(courses[0]&&courses[0].code)||"",task:"Assignment 1",sub:"Mar 18",grade:null},
    {student:"Brian Mutua",unit:(courses[0]&&courses[0].code)||"",task:"Assignment 1",sub:"Mar 19",grade:17},
    {student:"Fatima Hassan",unit:(courses[1]&&courses[1].code)||"",task:"CAT 1",sub:"Mar 15",grade:22},
    {student:"Akinyi Otieno",unit:(courses[1]&&courses[1].code)||"",task:"Assignment 1",sub:"Mar 20",grade:null},
  ];
  const ltabBtns=[["courses","Courses"],["issue_exam","Issue Exam"],["issue_asgn","Issue Assignment"],["submissions","Submissions"],["cls_analytics","Analytics"]];
  const yearOpts=[1,2,3,4];
  const examTypOpts=["MCQ","Short Answer","Essay","Practical","Mixed"];
  const subTypOpts=["Upload File","Online Text","Both"];
  const lateOpts=["Not allowed","10% penalty","No penalty"];
  return(
    <div>
      <h1 style={s.h1}>{t("classroom")}</h1>
      <p style={s.sub}><span style={{...s.tag((fld&&fld.color)||T.ac),marginRight:8}}>{(fld&&fld.icon)} {(fld&&fld.name)}</span>Manage courses · Issue exams and assignments · Grade</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.25rem"}}>
        <StatCard label="My Courses" value={courses.length} sub="Active this semester" color={T.blue} icon="B"/>
        <StatCard label="Students" value="42" sub="Enrolled" color={T.ac} icon="S"/>
        <StatCard label="To Grade" value="2" sub="Ungraded" color={T.amber} icon="G"/>
        <StatCard label="Class Avg" value="71%" sub="Performance" color={T.green} icon="A"/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:"1.25rem",flexWrap:"wrap"}}>
        {ltabBtns.map(lb=>(
          <button key={lb[0]} onClick={()=>setLtab(lb[0])} style={{...(ltab===lb[0]?s.btnP:s.btnS),fontSize:12,padding:"7px 14px"}}>{lb[1]}</button>
        ))}
      </div>
      {ltab==="courses"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"1rem"}}>
            <span style={{fontSize:14,fontWeight:600,color:T.t1}}>Assigned Courses</span>
            <button onClick={()=>setShowNew(!showNew)} style={s.btnP}>+ New</button>
          </div>
          {showNew&&(
            <div style={{...s.card,marginBottom:"1rem",border:`1px solid ${rgba(T.ac,0.3)}`}}>
              <div style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Create New Course</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
                <div><label style={s.lbl}>CODE</label><input style={s.input} placeholder="e.g. MED 402"/></div>
                <div><label style={s.lbl}>NAME</label><input style={s.input} placeholder="Course title"/></div>
                <div><label style={s.lbl}>YEAR</label><select style={s.input}>{yearOpts.map(v=><option key={v}>Year {v}</option>)}</select></div>
                <div><label style={s.lbl}>CREDITS</label><input style={s.input} type="number" defaultValue="3"/></div>
              </div>
              <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>DESCRIPTION</label><textarea style={{...s.input,minHeight:70,resize:"vertical"}} placeholder="Objectives..."/></div>
              <div style={{display:"flex",gap:8}}>
                <button style={s.btnP}>Create</button>
                <button onClick={()=>setShowNew(false)} style={s.btnS}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {courses.map((c,i)=>(
              <div key={i} style={s.card}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:10,color:T.ac,fontWeight:700,marginBottom:4}}>{c.code} · Year {c.y}</div>
                    <div style={{fontSize:14,fontWeight:600,color:T.t1}}>{c.name}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.ac}}>Avg: {c.p}%</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:"0.85rem"}}>
                  <button style={{...s.btnS,flex:1,fontSize:11,padding:"6px"}}>Upload</button>
                  <button style={{...s.btnP,flex:1,fontSize:11,padding:"6px"}}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {ltab==="issue_exam"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Issue Examination</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} placeholder="Exam title"/></div>
            <div><label style={s.lbl}>COURSE</label><select style={s.input}>{courses.map(c=><option key={c.code}>{c.code}</option>)}</select></div>
            <div><label style={s.lbl}>DATE &amp; TIME</label><input style={s.input} type="datetime-local"/></div>
            <div><label style={s.lbl}>DURATION (MIN)</label><input style={s.input} type="number" defaultValue="60"/></div>
            <div><label style={s.lbl}>TOTAL MARKS</label><input style={s.input} type="number" defaultValue="50"/></div>
            <div><label style={s.lbl}>TYPE</label><select style={s.input}>{examTypOpts.map(v=><option key={v}>{v}</option>)}</select></div>
          </div>
          <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>INSTRUCTIONS</label><textarea style={{...s.input,minHeight:80,resize:"vertical"}} placeholder="Instructions..."/></div>
          <div style={{border:`2px dashed ${T.bd}`,borderRadius:8,padding:"1rem",textAlign:"center",color:T.t3,cursor:"pointer",marginBottom:"1rem",fontSize:12}}>Upload exam paper or add questions inline</div>
          <div style={{display:"flex",gap:8}}>
            <button style={s.btnP}>Issue to Students</button>
            <button style={s.btnS}>Save Draft</button>
          </div>
        </div>
      )}
      {ltab==="issue_asgn"&&(
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Issue Assignment</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
            <div><label style={s.lbl}>TITLE</label><input style={s.input} placeholder="Assignment title"/></div>
            <div><label style={s.lbl}>COURSE</label><select style={s.input}>{courses.map(c=><option key={c.code}>{c.code}</option>)}</select></div>
            <div><label style={s.lbl}>DUE DATE</label><input style={s.input} type="date"/></div>
            <div><label style={s.lbl}>MARKS</label><input style={s.input} type="number" defaultValue="30"/></div>
            <div><label style={s.lbl}>SUBMISSION</label><select style={s.input}>{subTypOpts.map(v=><option key={v}>{v}</option>)}</select></div>
            <div><label style={s.lbl}>LATE POLICY</label><select style={s.input}>{lateOpts.map(v=><option key={v}>{v}</option>)}</select></div>
          </div>
          <div style={{marginBottom:"0.75rem"}}><label style={s.lbl}>INSTRUCTIONS &amp; RUBRIC</label><textarea style={{...s.input,minHeight:100,resize:"vertical"}} placeholder="Instructions and marking criteria..."/></div>
          <button style={s.btnP}>Issue to Students</button>
        </div>
      )}
      {ltab==="submissions"&&(
        <div>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Submissions</div>
          <div style={{display:"grid",gap:8}}>
            {SUBS.map((sub,i)=>(
              <div key={i} style={{...s.card,display:"flex",alignItems:"center",gap:12}}>
                <Av name={sub.student} size={36}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:T.t1}}>{sub.student}</div>
                  <div style={{fontSize:11,color:T.t3}}>{sub.unit} · {sub.task} · {sub.sub}</div>
                </div>
                {sub.grade!==null?(
                  <Pill text={"Graded: "+sub.grade} color={T.green}/>
                ):(
                  <div style={{display:"flex",gap:8}}>
                    <button style={{...s.btnS,fontSize:11,padding:"5px 12px"}}>View</button>
                    <button style={{...s.btnP,fontSize:11,padding:"5px 12px"}}>Grade</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {ltab==="cls_analytics"&&(
        <div>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Class Performance</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={courses.map(c=>({name:c.code.slice(-3),avg:c.p,top:Math.min(100,c.p+15),low:Math.max(20,c.p-20)}))} barSize={18}>
              <XAxis dataKey="name" tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:T.bg3,border:`1px solid ${T.bd}`,borderRadius:8,color:T.t1,fontSize:12}}/>
              <Bar dataKey="avg" name="Average" fill={T.ac} radius={[3,3,0,0]}/>
              <Bar dataKey="top" name="Top" fill={T.green} radius={[3,3,0,0]}/>
              <Bar dataKey="low" name="Lowest" fill={T.red} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const AdminView=()=>{
  const T=useT();const t=useLang();const s=sx(T);
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

  const atabs=[["approvals","Pending ("+pending.length+")"],["approved","Approved ("+approved.length+")"],["rejected","Rejected ("+rejected.length+")"],["roles","Roles"],["security","Security"]];
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
      {!loading&&atab==="approvals"&&(pending.length===0?(
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
            </>)}/>
          ))}
        </div>
      ))}
      {!loading&&atab==="approved"&&(approved.length===0?(
        <div style={{...s.card,textAlign:"center",padding:"2rem",fontSize:13,color:T.t2}}>No approved users yet.</div>
      ):(
        <div style={{display:"grid",gap:10}}>
          {approved.map(u=>(
            <UserCard key={u.id} u={u} actions={u=>(<>
              <select defaultValue={u.role} onChange={e=>changeRole(u.id,e.target.value)} style={{...s.input,fontSize:12,padding:"6px 10px",width:"auto"}} onClick={e=>e.stopPropagation()}>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
                <option value="researcher">Researcher</option>
              </select>
              <button onClick={()=>reject(u.id)} style={{...s.btnD,fontSize:12,padding:"7px 12px"}}>Revoke</button>
            </>)}/>
          ))}
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
const SettingsView=({lang,setLang,themeId,setThemeId,userField,setUserField,fontSize,setFontSize,highContrast,setHighContrast})=>{
  const T=useT();const t=useLang();const s=sx(T);
  const langOpts=Object.entries(LANGS);
  const themeOpts=Object.values(THEMES);
  const fieldOpts=Object.values(FIELDS);
  return(
    <div>
      <h1 style={s.h1}>{t("settings")}</h1>
      <p style={s.sub}>Language · Theme · Field of Study</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Language</div>
          <div style={{display:"grid",gap:7}}>
            {langOpts.map(lo=>(
              <div key={lo[0]} onClick={()=>setLang(lo[0])} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:`1px solid ${lang===lo[0]?T.ac:T.bd}`,background:lang===lo[0]?rgba(T.ac,0.1):T.bg3,cursor:"pointer"}}>
                <span style={{fontSize:18}}>{lo[1].flag}</span>
                <span style={{fontSize:12,fontWeight:lang===lo[0]?600:400,color:lang===lo[0]?T.ac:T.t1,flex:1}}>{lo[1].name}</span>
                {lang===lo[0]&&<span style={{color:T.ac}}>C</span>}
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
                <div>
                  <div style={{fontSize:12,fontWeight:themeId===th.id?600:400,color:themeId===th.id?T.ac:T.t1}}>{th.emoji} {th.name}</div>
                </div>
                {themeId===th.id&&<span style={{color:T.ac,marginLeft:"auto"}}>C</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={s.card}>
          <div style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:"1rem"}}>Field of Study</div>
          <p style={{fontSize:12,color:T.t2,marginBottom:"1rem",lineHeight:1.6}}>Switch your field to see relevant courses, tools and opportunities.</p>
          <div style={{display:"grid",gap:7}}>
            {fieldOpts.map(f=>(
              <div key={f.id} onClick={()=>setUserField(f.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,border:`1px solid ${userField===f.id?f.color:T.bd}`,background:userField===f.id?rgba(f.color,0.14):T.bg3,cursor:"pointer"}}>
                <span style={{fontSize:16}}>{f.icon}</span>
                <span style={{fontSize:11,fontWeight:userField===f.id?600:400,color:userField===f.id?f.color:T.t1,flex:1}}>{f.name}</span>
                {userField===f.id&&<span style={{color:f.color,fontSize:12}}>C</span>}
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
            <span style={{fontSize:12,color:T.t1}}>{highContrast?"On — High contrast":"Off — Standard"}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default function App(){
  const [themeId,setThemeId]=useState(()=>localStorage.getItem('ak_theme')||'navy'),[lang,setLang]=useState("en"),[fontSize,setFontSize]=useState(14),[highContrast,setHighContrast]=useState(false);
  const [userField,setUserField]=useState("actuarial"),[role,setRole]=useState("student");
  const [userName,setUserName]=useState(""),[authed,setAuthed]=useState(false);
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
          setRole(data.role||"student");
          setUserField(data.field||"actuarial");
          setUserName(data.full_name||session.user.email);
          setAuthed(true);
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
        setAuthed(false);setRole("student");setUserName("");
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
    setRole(p.role||"student");setUserField(p.field||"actuarial");
    setUserName(p.full_name||email);setAuthed(true);
    flash((LS[lang]||LS.en).welcome+", "+(p.full_name||email).split(" ")[0]+"!");
    return null;
  };
  const handleRealSignUp=async(email,password,meta)=>{
    const {handleSignUp}=await import("./auth.js");
    const result=await handleSignUp(email,password,meta);
    if(result.error)return result.error;
    return null;
  };
  const T=THEMES[themeId];
  const VIEWS={
    dashboard:<DashboardView setTab={persistTab} userName={userName} userField={userField}/>,
    courses:<CoursesView userField={userField} role={role} userName={userName}/>,
    exams:<ExamsView userField={userField}/>,
    assignments:<AssignmentsView userField={userField} role={role} userName={userName}/>,
    research:<ResearchView userField={userField}/>,
    ai:<AIView lang={lang} userField={userField}/>,
    calendar:<CalendarView setTab={persistTab}/>,
    meetings:<MeetingsView/>,
    opps:<OppsView userField={userField}/>,
    analytics:<AnalyticsView userField={userField}/>,
    tools:<ToolsView userField={userField}/>,
    transcript:<TranscriptView userField={userField}/>,
    peers:<PeersView setTab={persistTab} userField={userField}/>,
    classroom:<ClassroomView userField={userField}/>,
    admin:<AdminView/>,
    settings:<SettingsView lang={lang} setLang={setLang} themeId={themeId} setThemeId={(t)=>{localStorage.setItem("ak_theme",t);setThemeId(t);}} userField={userField} setUserField={setUserField} fontSize={fontSize} setFontSize={setFontSize} highContrast={highContrast} setHighContrast={setHighContrast}/>,
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
        ):!authed?(
          <AuthScreen onLogin={handleLogin} onRealLogin={handleRealLogin} onRealSignUp={handleRealSignUp} lang={lang} setLang={setLang} themeId={themeId} setThemeId={(t)=>{localStorage.setItem("ak_theme",t);setThemeId(t);}}/>
        ):(
          <div style={{display:"flex",height:"100vh",background:highContrast?"#000000":T.bg0,fontFamily:"'DM Sans',sans-serif",color:highContrast?"#ffffff":T.t1,overflow:"hidden",fontSize:fontSize}}>
            <Sidebar tab={tab} setTab={persistTab} open={sideOpen} role={role} userName={userName} userField={userField} offline={offline} setOffline={setOffline} onLogout={async()=>{const {supabase}=await import("./supabase.js");await supabase.auth.signOut();setAuthed(false);setRole("student");setUserName("");setTab("dashboard");}}/>
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
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
