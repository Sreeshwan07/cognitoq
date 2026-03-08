export interface Subject {
  id: string;
  name: string;
  code: string;
  branch: string;
  year: number;
  semester: number;
  units: string[];
  category?: "core" | "professional" | "elective" | "open_elective";
}

export interface Branch {
  id: string;
  name: string;
  shortName: string;
}

export const branches: Branch[] = [
  { id: "core", name: "Core / Common", shortName: "CORE" },
  { id: "cse", name: "Computer Science & Engineering", shortName: "CSE" },
  { id: "ece", name: "Electronics & Communication", shortName: "ECE" },
  { id: "me", name: "Mechanical Engineering", shortName: "ME" },
  { id: "ce", name: "Civil Engineering", shortName: "CE" },
  { id: "ee", name: "Electrical Engineering", shortName: "EE" },
  { id: "it", name: "Information Technology", shortName: "IT" },
];

export const subjects: Subject[] = [
  // ═══════════════════════════════════════════════════
  // CMR CSE R22 SYLLABUS — YEAR 1
  // ═══════════════════════════════════════════════════

  // ─── Semester I ───
  {
    id: "mat-calc", name: "Matrices and Calculus", code: "22BS1MA01", branch: "cse", year: 1, semester: 1, category: "core",
    units: ["Matrices & Linear Systems", "Eigenvalues & Eigenvectors", "Differential Calculus (Mean Value Theorems)", "Multivariable Calculus (Partial Derivatives)", "Multiple Integrals"]
  },
  {
    id: "eng-chem", name: "Engineering Chemistry", code: "22BS1CH01", branch: "cse", year: 1, semester: 1, category: "core",
    units: ["Electrochemistry & Batteries", "Corrosion & Its Control", "Polymers & Plastics", "Water Treatment & Analysis", "Spectroscopy & Instrumental Methods"]
  },
  {
    id: "pps", name: "Programming for Problem Solving", code: "22ES1CS01", branch: "cse", year: 1, semester: 1, category: "core",
    units: ["Introduction to C & Data Types", "Control Structures & Loops", "Functions & Recursion", "Arrays & Strings", "Pointers, Structures & File Handling"]
  },
  {
    id: "ecse", name: "Elements of Computer Science & Engineering", code: "22ES1CS02", branch: "cse", year: 1, semester: 1, category: "core",
    units: ["Introduction to Computers & Number Systems", "Computer Organization Basics", "Operating Systems Concepts", "Networking Fundamentals", "Introduction to Programming Paradigms"]
  },
  {
    id: "bee", name: "Basic Electrical Engineering", code: "22ES1EE01", branch: "cse", year: 1, semester: 1, category: "core",
    units: ["DC Circuits & Network Theorems", "AC Circuits & Phasors", "Transformers", "Electrical Machines (DC & AC)", "Measuring Instruments & Safety"]
  },
  {
    id: "caed", name: "Computer Aided Engineering Drawing", code: "22ES1ME01", branch: "cse", year: 1, semester: 1, category: "core",
    units: ["Engineering Drawing Basics & Lettering", "Projection of Points & Lines", "Projection of Planes & Solids", "Sections of Solids", "Isometric & Orthographic Projections"]
  },
  {
    id: "coi", name: "Constitution of India", code: "22MC1CI01", branch: "cse", year: 1, semester: 1, category: "core",
    units: ["Preamble & Fundamental Rights", "Directive Principles & Fundamental Duties", "Union Government", "State Government", "Local Self Government & Emergency Provisions"]
  },

  // ─── Semester II ───
  {
    id: "eng-skill", name: "English for Skill Enhancement", code: "22HS2EN01", branch: "cse", year: 1, semester: 2, category: "core",
    units: ["Vocabulary & Word Formation", "Grammar & Sentence Structure", "Reading Comprehension", "Writing Skills (Letters, Reports)", "Communication & Presentation Skills"]
  },
  {
    id: "ode-vc", name: "Ordinary Differential Equations & Vector Calculus", code: "22BS2MA01", branch: "cse", year: 1, semester: 2, category: "core",
    units: ["First Order ODEs", "Higher Order Linear ODEs", "Laplace Transforms", "Vector Differentiation (Gradient, Divergence, Curl)", "Vector Integration (Green's, Stokes', Gauss Theorems)"]
  },
  {
    id: "app-phy", name: "Applied Physics", code: "22BS2PH01", branch: "cse", year: 1, semester: 2, category: "core",
    units: ["Wave Optics (Interference & Diffraction)", "Lasers & Fiber Optics", "Quantum Mechanics", "Semiconductor Physics", "Electromagnetic Theory & Maxwell's Equations"]
  },
  {
    id: "ds", name: "Data Structures", code: "22ES2CS01", branch: "cse", year: 1, semester: 2, category: "core",
    units: ["Arrays, Stacks & Queues", "Linked Lists (Singly, Doubly, Circular)", "Trees (Binary, BST, AVL)", "Graphs (BFS, DFS, Shortest Path)", "Sorting & Searching Algorithms"]
  },
  {
    id: "uhv", name: "Universal Human Values", code: "22MC2HV01", branch: "cse", year: 1, semester: 2, category: "core",
    units: ["Self-Exploration & Awareness", "Harmony in Human Being", "Harmony in Family & Society", "Harmony in Nature", "Professional Ethics & Values"]
  },

  // ═══════════════════════════════════════════════════
  // CMR CSE R22 SYLLABUS — YEAR 2
  // ═══════════════════════════════════════════════════

  // ─── Semester III ───
  {
    id: "de", name: "Digital Electronics", code: "22EC3DE01", branch: "cse", year: 2, semester: 3, category: "professional",
    units: ["Number Systems & Boolean Algebra", "Combinational Logic Circuits (Adders, MUX, Decoders)", "Sequential Circuits (Flip-Flops, Counters)", "Registers & Memory", "PLDs & FPGA Basics"]
  },
  {
    id: "se", name: "Software Engineering", code: "22CS3SE01", branch: "cse", year: 2, semester: 3, category: "professional",
    units: ["Software Process Models (Waterfall, Agile, Spiral)", "Requirements Engineering & SRS", "Software Design (Architectural, Detailed)", "Testing (Unit, Integration, System)", "Project Management & Quality Assurance"]
  },
  {
    id: "edc", name: "Electronics Devices & Circuits", code: "22EC3ED01", branch: "cse", year: 2, semester: 3, category: "professional",
    units: ["PN Junction Diodes & Applications", "BJT Characteristics & Biasing", "FET & MOSFET", "Amplifiers (CE, CB, CC Configurations)", "Operational Amplifiers & Applications"]
  },
  {
    id: "oop-java", name: "Object Oriented Programming through Java", code: "22CS3OJ01", branch: "cse", year: 2, semester: 3, category: "professional",
    units: ["Java Fundamentals & OOP Concepts", "Inheritance & Polymorphism", "Packages & Interfaces", "Exception Handling & Multithreading", "Collections Framework & File I/O"]
  },
  {
    id: "dbms", name: "Database Management Systems", code: "22CS3DB01", branch: "cse", year: 2, semester: 3, category: "professional",
    units: ["Introduction to DBMS & ER Model", "Relational Model & Relational Algebra", "SQL & PL/SQL", "Normalization (1NF, 2NF, 3NF, BCNF)", "Transaction Management & Concurrency Control"]
  },

  // ─── Semester IV ───
  {
    id: "cosm", name: "Computer Oriented Statistical Methods", code: "22BS4MA01", branch: "cse", year: 2, semester: 4, category: "core",
    units: ["Probability & Random Variables", "Probability Distributions (Binomial, Poisson, Normal)", "Sampling & Estimation", "Hypothesis Testing", "Curve Fitting & Regression"]
  },
  {
    id: "os", name: "Operating Systems", code: "22CS4OS01", branch: "cse", year: 2, semester: 4, category: "professional",
    units: ["OS Introduction & Process Management", "CPU Scheduling Algorithms", "Process Synchronization & Deadlocks", "Memory Management (Paging, Segmentation)", "File Systems & I/O Management"]
  },
  {
    id: "befa", name: "Business Economics & Financial Analysis", code: "22HS4BE01", branch: "cse", year: 2, semester: 4, category: "core",
    units: ["Demand & Supply Analysis", "Production & Cost Analysis", "Market Structures", "National Income & Fiscal Policy", "Financial Accounting & Analysis"]
  },
  {
    id: "dm", name: "Discrete Mathematics", code: "22BS4MA02", branch: "cse", year: 2, semester: 4, category: "core",
    units: ["Mathematical Logic & Propositional Calculus", "Set Theory & Relations", "Functions & Recurrence Relations", "Graph Theory", "Algebraic Structures (Groups, Rings)"]
  },
  {
    id: "coa", name: "Computer Organization & Architecture", code: "22CS4CO01", branch: "cse", year: 2, semester: 4, category: "professional",
    units: ["Data Representation & Computer Arithmetic", "Register Transfer & Micro-operations", "Control Unit Design (Hardwired & Microprogrammed)", "Memory Organization (Cache, Virtual Memory)", "I/O Organization (DMA, Interrupts)"]
  },

  // ═══════════════════════════════════════════════════
  // CMR CSE R22 SYLLABUS — YEAR 3
  // ═══════════════════════════════════════════════════

  // ─── Semester V ───
  {
    id: "cn", name: "Computer Networks", code: "22CS5CN01", branch: "cse", year: 3, semester: 5, category: "professional",
    units: ["Network Models (OSI & TCP/IP)", "Data Link Layer (Framing, Error Control, Flow Control)", "Network Layer (Routing Algorithms, IP Addressing)", "Transport Layer (TCP, UDP, Congestion Control)", "Application Layer (HTTP, DNS, FTP, SMTP)"]
  },
  {
    id: "cd", name: "Compiler Design", code: "22CS5CD01", branch: "cse", year: 3, semester: 5, category: "professional",
    units: ["Lexical Analysis (Tokens, Regular Expressions, NFA/DFA)", "Syntax Analysis (CFG, Parsing Techniques)", "Semantic Analysis (SDT, Type Checking)", "Intermediate Code Generation (TAC, DAG)", "Code Optimization & Code Generation"]
  },
  {
    id: "toc", name: "Theory of Computation", code: "22CS5TC01", branch: "cse", year: 3, semester: 5, category: "professional",
    units: ["Finite Automata (DFA, NFA)", "Regular Expressions & Regular Languages", "Context-Free Grammars & Pushdown Automata", "Turing Machines", "Decidability & Complexity Classes"]
  },
  {
    id: "ipr", name: "Intellectual Property Rights", code: "22MC5IP01", branch: "cse", year: 3, semester: 5, category: "core",
    units: ["Introduction to IPR", "Patents & Patent Filing", "Copyrights & Related Rights", "Trademarks & Geographical Indications", "Trade Secrets & Cyber Law"]
  },

  // ─── Semester VI ───
  {
    id: "daa", name: "Design & Analysis of Algorithms", code: "22CS6DA01", branch: "cse", year: 3, semester: 6, category: "professional",
    units: ["Algorithm Analysis (Asymptotic Notations)", "Divide & Conquer (Merge Sort, Quick Sort)", "Greedy Algorithms (Knapsack, Huffman)", "Dynamic Programming (LCS, Matrix Chain)", "Backtracking & Branch and Bound"]
  },
  {
    id: "wt", name: "Web Technologies", code: "22CS6WT01", branch: "cse", year: 3, semester: 6, category: "professional",
    units: ["HTML5, CSS3 & Responsive Design", "JavaScript & DOM Manipulation", "React / Angular Frontend Frameworks", "Node.js & Express Backend", "REST APIs & Web Security"]
  },

  // ═══════════════════════════════════════════════════
  // CMR CSE R22 SYLLABUS — YEAR 4
  // ═══════════════════════════════════════════════════

  // ─── Semester VII ───
  {
    id: "ob", name: "Organizational Behavior", code: "22HS7OB01", branch: "cse", year: 4, semester: 7, category: "core",
    units: ["Individual Behavior & Personality", "Motivation & Leadership", "Group Dynamics & Team Building", "Organizational Culture & Change", "Conflict Management & Negotiation"]
  },

  // ═══════════════════════════════════════════════════
  // OPEN ELECTIVES (Selectable by any branch)
  // ═══════════════════════════════════════════════════
  {
    id: "oe-iot", name: "Internet of Things (IoT)", code: "22OE_IOT", branch: "cse", year: 3, semester: 6, category: "open_elective",
    units: ["IoT Architecture & Protocols", "Sensors & Actuators", "IoT Communication (MQTT, CoAP)", "IoT Platforms & Cloud Integration", "IoT Security & Applications"]
  },
  {
    id: "oe-dsp", name: "Digital Signal Processing", code: "22OE_DSP", branch: "cse", year: 3, semester: 6, category: "open_elective",
    units: ["Discrete-Time Signals & Systems", "Z-Transform & Its Properties", "DFT & FFT Algorithms", "FIR Filter Design", "IIR Filter Design"]
  },
  {
    id: "oe-cyber", name: "Cyber Security", code: "22OE_CYS", branch: "cse", year: 4, semester: 7, category: "open_elective",
    units: ["Introduction to Cyber Security", "Cryptography (Symmetric & Asymmetric)", "Network Security & Firewalls", "Web Application Security (OWASP)", "Digital Forensics & Incident Response"]
  },
  {
    id: "oe-ds-r", name: "Data Science using R", code: "22OE_DSR", branch: "cse", year: 4, semester: 7, category: "open_elective",
    units: ["R Programming Fundamentals", "Data Manipulation & Visualization", "Statistical Analysis in R", "Machine Learning with R", "Data Science Case Studies"]
  },
  {
    id: "oe-robotics", name: "Robotics", code: "22OE_ROB", branch: "cse", year: 4, semester: 7, category: "open_elective",
    units: ["Robot Kinematics & Dynamics", "Sensors & Actuators in Robotics", "Robot Programming & Control", "Path Planning & Navigation", "Applications of Robotics"]
  },
  {
    id: "oe-cloud", name: "Cloud Computing", code: "22OE_CLD", branch: "cse", year: 3, semester: 6, category: "open_elective",
    units: ["Cloud Architecture & Deployment Models", "Virtualization Technologies", "Cloud Services (IaaS, PaaS, SaaS)", "Cloud Security & Privacy", "Serverless Computing & Containers"]
  },
  {
    id: "oe-ml", name: "Machine Learning", code: "22OE_ML", branch: "cse", year: 4, semester: 7, category: "open_elective",
    units: ["Supervised Learning (Regression, Classification)", "Unsupervised Learning (Clustering, PCA)", "Neural Networks & Deep Learning", "Ensemble Methods (Random Forest, Boosting)", "Model Evaluation & Hyperparameter Tuning"]
  },
  {
    id: "oe-cn-elec", name: "Computer Networks (Elective)", code: "22OE_CN", branch: "cse", year: 3, semester: 5, category: "open_elective",
    units: ["Network Fundamentals & OSI Model", "Data Link & Network Layer", "Routing & Switching", "Transport & Application Layer", "Network Security Basics"]
  },
  {
    id: "oe-embedded", name: "Embedded Systems", code: "22OE_EMB", branch: "cse", year: 4, semester: 7, category: "open_elective",
    units: ["Embedded System Architecture", "Microcontrollers (8051, ARM)", "Embedded C Programming", "RTOS Concepts", "Interfacing & IoT Integration"]
  },
  {
    id: "oe-devops", name: "DevOps", code: "22OE_DEV", branch: "cse", year: 4, semester: 7, category: "open_elective",
    units: ["DevOps Principles & Culture", "Version Control (Git) & CI/CD", "Containerization (Docker & Kubernetes)", "Infrastructure as Code (Terraform, Ansible)", "Monitoring & Logging"]
  },
  {
    id: "oe-ai", name: "Artificial Intelligence", code: "22OE_AI", branch: "cse", year: 3, semester: 6, category: "open_elective",
    units: ["Introduction to AI & Intelligent Agents", "Search Algorithms (BFS, DFS, A*)", "Knowledge Representation & Reasoning", "Machine Learning Basics for AI", "Natural Language Processing Fundamentals"]
  },
  {
    id: "oe-bi", name: "Business Intelligence", code: "22OE_BI", branch: "cse", year: 4, semester: 7, category: "open_elective",
    units: ["Introduction to Business Intelligence", "Data Warehousing & ETL", "OLAP & Data Cubes", "Data Mining Techniques", "BI Tools & Dashboards"]
  },

  // ═══════════════════════════════════════════════════
  // ADDITIONAL BRANCHES (kept from original for other depts)
  // ═══════════════════════════════════════════════════

  // ─── ECE ───
  { id: "ss", name: "Signals & Systems", code: "EC201", branch: "ece", year: 2, semester: 3, units: ["Signal Classification", "LTI Systems", "Fourier Transform", "Laplace Transform", "Z-Transform"] },
  { id: "analog", name: "Analog Electronics", code: "EC202", branch: "ece", year: 2, semester: 3, units: ["Diode Circuits", "BJT Amplifiers", "FET Amplifiers", "Operational Amplifiers", "Oscillators & Feedback"] },
  { id: "digital-comm", name: "Digital Communication", code: "EC301", branch: "ece", year: 3, semester: 5, units: ["Sampling & Quantization", "PCM & DPCM", "Digital Modulation", "Error Control Coding", "Spread Spectrum"] },
  { id: "vlsi", name: "VLSI Design", code: "EC401", branch: "ece", year: 3, semester: 6, units: ["MOS Transistors", "CMOS Logic Design", "Subsystem Design", "FPGA & ASIC", "Testing & Verification"] },
  { id: "microproc", name: "Microprocessors & Microcontrollers", code: "EC302", branch: "ece", year: 2, semester: 4, units: ["8085 Architecture", "8086 Architecture", "Assembly Programming", "8051 Microcontroller", "Interfacing & Applications"] },
  { id: "emft", name: "Electromagnetic Field Theory", code: "EC203", branch: "ece", year: 2, semester: 4, units: ["Electrostatics", "Magnetostatics", "Maxwell's Equations", "Wave Propagation", "Transmission Lines"] },

  // ─── ME ───
  { id: "thermo", name: "Thermodynamics", code: "ME201", branch: "me", year: 2, semester: 3, units: ["Laws of Thermodynamics", "Entropy", "Gas Power Cycles", "Vapor Power Cycles", "Refrigeration Cycles"] },
  { id: "fm", name: "Fluid Mechanics", code: "ME202", branch: "me", year: 2, semester: 3, units: ["Fluid Properties", "Fluid Statics", "Fluid Kinematics", "Fluid Dynamics", "Viscous Flow"] },
  { id: "som", name: "Strength of Materials", code: "ME203", branch: "me", year: 2, semester: 3, units: ["Stress & Strain", "Bending Moment & Shear Force", "Deflection of Beams", "Torsion", "Columns & Struts"] },
  { id: "dom", name: "Dynamics of Machinery", code: "ME301", branch: "me", year: 3, semester: 5, units: ["Mechanisms & Machines", "Velocity & Acceleration", "Cams & Followers", "Gears & Gear Trains", "Balancing"] },
  { id: "ht", name: "Heat Transfer", code: "ME302", branch: "me", year: 3, semester: 5, units: ["Conduction", "Convection", "Radiation", "Heat Exchangers", "Boiling & Condensation"] },
  { id: "mp", name: "Manufacturing Processes", code: "ME303", branch: "me", year: 3, semester: 5, units: ["Casting", "Welding", "Machining", "Sheet Metal Working", "Non-Traditional Machining"] },

  // ─── CE ───
  { id: "survey", name: "Surveying", code: "CE201", branch: "ce", year: 2, semester: 3, units: ["Chain Surveying", "Compass Surveying", "Leveling", "Theodolite Surveying", "Curves & Contouring"] },
  { id: "sm-ce", name: "Structural Mechanics", code: "CE202", branch: "ce", year: 2, semester: 3, units: ["Force Systems", "Equilibrium", "Trusses", "Beams", "Frames"] },
  { id: "geo", name: "Geotechnical Engineering", code: "CE301", branch: "ce", year: 3, semester: 5, units: ["Soil Properties", "Soil Classification", "Permeability & Seepage", "Compaction", "Shear Strength"] },
  { id: "env", name: "Environmental Engineering", code: "CE302", branch: "ce", year: 3, semester: 5, units: ["Water Supply", "Water Treatment", "Sewage Treatment", "Air Pollution", "Solid Waste Management"] },
  { id: "rcc", name: "Reinforced Concrete Design", code: "CE401", branch: "ce", year: 3, semester: 6, units: ["Limit State Design", "Beams", "Slabs", "Columns", "Footings"] },

  // ─── EE ───
  { id: "ckt", name: "Circuit Theory", code: "EE201", branch: "ee", year: 2, semester: 3, units: ["Network Theorems", "AC Circuit Analysis", "Resonance", "Coupled Circuits", "Network Synthesis"] },
  { id: "em", name: "Electrical Machines", code: "EE301", branch: "ee", year: 2, semester: 4, units: ["DC Machines", "Transformers", "Induction Motors", "Synchronous Machines", "Special Machines"] },
  { id: "ps", name: "Power Systems", code: "EE401", branch: "ee", year: 3, semester: 5, units: ["Power Generation", "Transmission Lines", "Distribution Systems", "Load Flow Analysis", "Power System Protection"] },
  { id: "pe", name: "Power Electronics", code: "EE402", branch: "ee", year: 3, semester: 5, units: ["Power Semiconductor Devices", "Rectifiers", "Inverters", "Choppers", "AC Voltage Controllers"] },
  { id: "cs-ee", name: "Control Systems", code: "EE303", branch: "ee", year: 3, semester: 5, units: ["Block Diagrams & Signal Flow", "Time Domain Analysis", "Frequency Domain Analysis", "Stability Analysis", "State Space Analysis"] },

  // ─── IT ───
  { id: "it-dsa", name: "Data Structures & Algorithms", code: "IT201", branch: "it", year: 2, semester: 3, units: ["Arrays, Stacks & Queues", "Linked Lists", "Trees & BST", "Graphs", "Sorting & Searching"] },
  { id: "it-os", name: "Operating Systems", code: "IT301", branch: "it", year: 2, semester: 4, units: ["Process Management", "CPU Scheduling", "Memory Management", "File Systems", "Deadlocks & Synchronization"] },
  { id: "it-dbms", name: "Database Management Systems", code: "IT302", branch: "it", year: 2, semester: 4, units: ["ER Model & Relational Model", "SQL & Normalization", "Transaction Management", "Concurrency Control", "Indexing & Hashing"] },
  { id: "it-cn", name: "Computer Networks", code: "IT401", branch: "it", year: 3, semester: 5, units: ["Network Models & OSI", "Data Link Layer", "Network Layer & Routing", "Transport Layer (TCP/UDP)", "Application Layer Protocols"] },
  { id: "it-se", name: "Software Engineering", code: "IT402", branch: "it", year: 3, semester: 5, units: ["SDLC Models", "Requirements Engineering", "Design Patterns", "Testing & QA", "Project Management"] },
  { id: "it-web", name: "Web Technologies", code: "IT403", branch: "it", year: 3, semester: 5, units: ["HTML/CSS/JS", "React & Frontend Frameworks", "Node.js & Express", "REST APIs", "Web Security"] },
  { id: "it-cloud", name: "Cloud Computing", code: "IT501", branch: "it", year: 4, semester: 7, units: ["Cloud Architecture", "Virtualization", "Cloud Services (IaaS/PaaS/SaaS)", "Cloud Security", "Serverless & Containers"] },
  { id: "it-tic", name: "Information Security", code: "IT502", branch: "it", year: 4, semester: 7, units: ["Cryptography", "Network Security", "Authentication & Authorization", "Security Protocols", "Ethical Hacking"] },
];

export function getSubjectsByBranch(branchId: string): Subject[] {
  return subjects.filter((s) => s.branch === branchId);
}

export function getSubjectsByYear(year: number): Subject[] {
  return subjects.filter((s) => s.year === year);
}

export function getSubjectsByBranchAndYear(branchId: string, year: number): Subject[] {
  return subjects.filter((s) => s.branch === branchId && s.year === year);
}

export function getAllBranchSubjects(branchId: string): Subject[] {
  const core = subjects.filter((s) => s.branch === "core");
  if (branchId === "core") return core;
  const branchSpecific = subjects.filter((s) => s.branch === branchId);
  return [...core, ...branchSpecific];
}

export function getSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}
