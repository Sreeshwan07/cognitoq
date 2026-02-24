export interface Subject {
  id: string;
  name: string;
  code: string;
  branch: string;
  year: number;
  semester: number;
  units: string[];
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
  // ─── CORE / COMMON (Year 1) ───
  { id: "math1", name: "Engineering Mathematics I", code: "MA101", branch: "core", year: 1, semester: 1, units: ["Matrices & Linear Algebra", "Differential Calculus", "Integral Calculus", "Sequences & Series", "Vector Calculus"] },
  { id: "math2", name: "Engineering Mathematics II", code: "MA102", branch: "core", year: 1, semester: 2, units: ["Ordinary Differential Equations", "Laplace Transforms", "Fourier Series", "Partial Differential Equations", "Complex Analysis"] },
  { id: "phy", name: "Engineering Physics", code: "PH101", branch: "core", year: 1, semester: 1, units: ["Wave Optics", "Quantum Mechanics", "Semiconductor Physics", "Electromagnetic Theory", "Laser & Fiber Optics"] },
  { id: "chem", name: "Engineering Chemistry", code: "CH101", branch: "core", year: 1, semester: 1, units: ["Electrochemistry", "Corrosion", "Polymers", "Water Treatment", "Spectroscopy"] },
  { id: "bee", name: "Basic Electrical Engineering", code: "EE101", branch: "core", year: 1, semester: 1, units: ["DC Circuits", "AC Circuits", "Transformers", "Electrical Machines", "Measuring Instruments"] },
  { id: "bme", name: "Basic Mechanical Engineering", code: "ME101", branch: "core", year: 1, semester: 2, units: ["Thermodynamics Basics", "IC Engines", "Power Plants", "Refrigeration", "Manufacturing Processes"] },
  { id: "eg", name: "Engineering Graphics", code: "ME102", branch: "core", year: 1, semester: 1, units: ["Projection of Points & Lines", "Projection of Planes", "Projection of Solids", "Sections of Solids", "Isometric Projections"] },
  { id: "prog-c", name: "Programming in C", code: "CS101", branch: "core", year: 1, semester: 1, units: ["Basics & Control Structures", "Functions & Recursion", "Arrays & Strings", "Pointers", "Structures & File Handling"] },
  { id: "prog-py", name: "Programming in Python", code: "CS102", branch: "core", year: 1, semester: 2, units: ["Python Fundamentals", "Data Structures in Python", "OOP in Python", "File & Exception Handling", "Libraries & Modules"] },
  { id: "math3", name: "Engineering Mathematics III", code: "MA201", branch: "core", year: 2, semester: 3, units: ["Probability & Statistics", "Numerical Methods", "Z-Transforms", "Linear Programming", "Calculus of Variations"] },
  { id: "disc-math", name: "Discrete Mathematics", code: "MA202", branch: "core", year: 2, semester: 3, units: ["Set Theory & Logic", "Relations & Functions", "Graph Theory", "Combinatorics", "Algebraic Structures"] },

  // ─── CSE ───
  { id: "dsa", name: "Data Structures & Algorithms", code: "CS201", branch: "cse", year: 2, semester: 3, units: ["Arrays, Stacks & Queues", "Linked Lists", "Trees & BST", "Graphs", "Sorting & Searching"] },
  { id: "os", name: "Operating Systems", code: "CS301", branch: "cse", year: 2, semester: 4, units: ["Process Management", "CPU Scheduling", "Memory Management", "File Systems", "Deadlocks & Synchronization"] },
  { id: "dbms", name: "Database Management Systems", code: "CS302", branch: "cse", year: 2, semester: 4, units: ["ER Model & Relational Model", "SQL & Normalization", "Transaction Management", "Concurrency Control", "Indexing & Hashing"] },
  { id: "cn", name: "Computer Networks", code: "CS401", branch: "cse", year: 3, semester: 5, units: ["Network Models & OSI", "Data Link Layer", "Network Layer & Routing", "Transport Layer (TCP/UDP)", "Application Layer Protocols"] },
  { id: "se", name: "Software Engineering", code: "CS402", branch: "cse", year: 3, semester: 5, units: ["SDLC Models", "Requirements Engineering", "Design Patterns", "Testing & QA", "Project Management"] },
  { id: "cd", name: "Compiler Design", code: "CS403", branch: "cse", year: 3, semester: 5, units: ["Lexical Analysis", "Syntax Analysis", "Semantic Analysis", "Intermediate Code Generation", "Code Optimization"] },
  { id: "ai", name: "Artificial Intelligence", code: "CS501", branch: "cse", year: 3, semester: 6, units: ["Search Algorithms", "Knowledge Representation", "Machine Learning Basics", "Neural Networks", "NLP Fundamentals"] },
  { id: "ml", name: "Machine Learning", code: "CS502", branch: "cse", year: 4, semester: 7, units: ["Supervised Learning", "Unsupervised Learning", "Neural Networks & Deep Learning", "Ensemble Methods", "Model Evaluation"] },
  { id: "cyber", name: "Cyber Security", code: "CS503", branch: "cse", year: 4, semester: 7, units: ["Network Security", "Cryptography", "Web Security", "Malware Analysis", "Security Policies & Ethics"] },
  { id: "cloud", name: "Cloud Computing", code: "CS504", branch: "cse", year: 4, semester: 7, units: ["Cloud Architecture", "Virtualization", "Cloud Services (IaaS/PaaS/SaaS)", "Cloud Security", "Serverless & Containers"] },
  { id: "dld", name: "Digital Logic Design", code: "CS203", branch: "cse", year: 2, semester: 3, units: ["Number Systems & Boolean Algebra", "Combinational Circuits", "Sequential Circuits", "Registers & Counters", "Memory & PLDs"] },
  { id: "toc", name: "Theory of Computation", code: "CS303", branch: "cse", year: 3, semester: 5, units: ["Finite Automata", "Regular Expressions", "Context-Free Grammars", "Pushdown Automata", "Turing Machines"] },
  { id: "coa", name: "Computer Organization & Architecture", code: "CS204", branch: "cse", year: 2, semester: 4, units: ["Data Representation", "ALU Design", "Control Unit", "Memory Organization", "I/O Organization"] },

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
  // Returns core subjects + branch-specific subjects
  const core = subjects.filter((s) => s.branch === "core");
  if (branchId === "core") return core;
  const branchSpecific = subjects.filter((s) => s.branch === branchId);
  return [...core, ...branchSpecific];
}

export function getSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}
