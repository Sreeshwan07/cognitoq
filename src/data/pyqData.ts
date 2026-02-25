// Previous Year Question Papers data
export interface PYQPaper {
  id: string;
  university: string;
  year: number;
  subject: string;
  subjectCode: string;
  semester: number;
  branch: string;
  examType: string;
  totalMarks: number;
  duration: string;
  sections: PYQSection[];
  unitDistribution: Record<string, number>; // unit -> % weightage
}

export interface PYQSection {
  name: string;
  marksPerQuestion: number;
  questions: string[];
}

export const universities = [
  { id: "jntu", name: "JNTU Hyderabad", shortName: "JNTU-H" },
  { id: "ou", name: "Osmania University", shortName: "OU" },
  { id: "iit-b", name: "IIT Bombay (Sample)", shortName: "IIT-B" },
  { id: "nit-w", name: "NIT Warangal (Sample)", shortName: "NIT-W" },
  { id: "iit-d", name: "IIT Delhi (Sample)", shortName: "IIT-D" },
];

export const pyqPapers: PYQPaper[] = [
  {
    id: "jntu-dbms-2024",
    university: "jntu",
    year: 2024,
    subject: "Database Management Systems",
    subjectCode: "CS302",
    semester: 4,
    branch: "cse",
    examType: "End Semester",
    totalMarks: 70,
    duration: "3 Hours",
    unitDistribution: { "ER Model & Relational Model": 20, "SQL & Normalization": 25, "Transaction Management": 20, "Concurrency Control": 15, "Indexing & Hashing": 20 },
    sections: [
      { name: "Section A", marksPerQuestion: 2, questions: [
        "Define primary key and foreign key with examples.",
        "What is a weak entity set?",
        "Differentiate between DDL and DML.",
        "Define normalization.",
        "What is ACID property?",
        "Define deadlock in DBMS.",
        "What is an index?",
        "Differentiate between clustered and non-clustered index.",
        "What is a view in SQL?",
        "Define serializability.",
      ]},
      { name: "Section B", marksPerQuestion: 5, questions: [
        "Explain generalization and specialization with examples.",
        "Write SQL queries involving joins and subqueries for a library management system.",
        "Explain 1NF, 2NF, and 3NF with examples.",
        "Compare conflict serializability and view serializability.",
        "Explain B-tree and B+ tree indexing with diagrams.",
      ]},
      { name: "Section C", marksPerQuestion: 10, questions: [
        "Design an ER diagram for a hospital management system. Convert to relational schema.",
        "Explain normalization up to BCNF with examples. Discuss lossless decomposition.",
        "Discuss concurrency control protocols: lock-based, timestamp, and validation-based.",
      ]},
    ],
  },
  {
    id: "jntu-dsa-2024",
    university: "jntu",
    year: 2024,
    subject: "Data Structures & Algorithms",
    subjectCode: "CS201",
    semester: 3,
    branch: "cse",
    examType: "End Semester",
    totalMarks: 70,
    duration: "3 Hours",
    unitDistribution: { "Arrays, Stacks & Queues": 20, "Linked Lists": 15, "Trees & BST": 25, "Graphs": 20, "Sorting & Searching": 20 },
    sections: [
      { name: "Section A", marksPerQuestion: 2, questions: [
        "Define stack. List two applications.",
        "What is a circular queue?",
        "Define singly linked list.",
        "What is a complete binary tree?",
        "Define graph. What is the degree of a vertex?",
        "What is time complexity of binary search?",
        "Differentiate stack and queue.",
        "What is a doubly linked list?",
        "Define BST property.",
        "What is BFS?",
      ]},
      { name: "Section B", marksPerQuestion: 5, questions: [
        "Write an algorithm to convert infix to postfix using stack.",
        "Compare singly and doubly linked lists.",
        "Explain AVL tree rotations with examples.",
        "Differentiate BFS and DFS.",
        "Compare merge sort and quick sort.",
      ]},
      { name: "Section C", marksPerQuestion: 10, questions: [
        "Implement a circular queue with all operations. Analyze complexity.",
        "Construct BST from given data. Perform all traversals. Compare AVL and Red-Black trees.",
        "Implement Dijkstra's algorithm. Apply on a weighted graph example.",
      ]},
    ],
  },
  {
    id: "jntu-os-2024",
    university: "jntu",
    year: 2024,
    subject: "Operating Systems",
    subjectCode: "CS301",
    semester: 4,
    branch: "cse",
    examType: "End Semester",
    totalMarks: 70,
    duration: "3 Hours",
    unitDistribution: { "Process Management": 20, "CPU Scheduling": 20, "Memory Management": 25, "File Systems": 15, "Deadlocks & Synchronization": 20 },
    sections: [
      { name: "Section A", marksPerQuestion: 2, questions: [
        "Define process. List process states.",
        "What is a PCB?",
        "Define turnaround time.",
        "What is paging?",
        "Define deadlock.",
        "What is a semaphore?",
        "Define file system.",
        "What is internal fragmentation?",
        "What is the convoy effect?",
        "Define inode.",
      ]},
      { name: "Section B", marksPerQuestion: 5, questions: [
        "Explain process creation and termination.",
        "Compare preemptive and non-preemptive scheduling.",
        "Explain paging vs segmentation.",
        "Explain file allocation methods.",
        "Solve producer-consumer using semaphores.",
      ]},
      { name: "Section C", marksPerQuestion: 10, questions: [
        "Compare FCFS, SJF, Priority, Round Robin with numerical example.",
        "Explain virtual memory with page replacement algorithms.",
        "Explain deadlock prevention, avoidance, and detection with Banker's algorithm.",
      ]},
    ],
  },
  {
    id: "ou-cn-2023",
    university: "ou",
    year: 2023,
    subject: "Computer Networks",
    subjectCode: "CS401",
    semester: 5,
    branch: "cse",
    examType: "End Semester",
    totalMarks: 75,
    duration: "3 Hours",
    unitDistribution: { "Network Models & OSI": 20, "Data Link Layer": 20, "Network Layer & Routing": 25, "Transport Layer (TCP/UDP)": 20, "Application Layer Protocols": 15 },
    sections: [
      { name: "Section A", marksPerQuestion: 2, questions: [
        "List all layers of OSI model.",
        "What is framing?",
        "Define subnet mask.",
        "What is DNS?",
        "What is HTTP?",
        "Differentiate TCP and UDP.",
        "What is CIDR?",
        "Define flow control.",
        "What is DHCP?",
        "Define socket.",
      ]},
      { name: "Section B", marksPerQuestion: 5, questions: [
        "Explain OSI model layers with protocols.",
        "Explain sliding window protocol.",
        "Compare distance vector and link state routing.",
        "Explain TCP three-way handshake.",
        "Explain DNS resolution process.",
      ]},
      { name: "Section C", marksPerQuestion: 10, questions: [
        "Explain error detection and correction. Solve CRC and Hamming code problems.",
        "Explain Dijkstra's and Bellman-Ford with numerical examples.",
        "Explain TCP congestion control mechanisms in detail.",
      ]},
    ],
  },
  {
    id: "nit-ml-2024",
    university: "nit-w",
    year: 2024,
    subject: "Machine Learning",
    subjectCode: "CS502",
    semester: 7,
    branch: "cse",
    examType: "End Semester",
    totalMarks: 100,
    duration: "3 Hours",
    unitDistribution: { "Supervised Learning": 25, "Unsupervised Learning": 20, "Neural Networks & Deep Learning": 25, "Ensemble Methods": 15, "Model Evaluation": 15 },
    sections: [
      { name: "Section A", marksPerQuestion: 2, questions: [
        "Define supervised learning.",
        "What is overfitting?",
        "Define clustering.",
        "What is a perceptron?",
        "Define precision and recall.",
        "What is gradient descent?",
        "Define bias-variance tradeoff.",
        "What is cross-validation?",
        "Define random forest.",
        "What is backpropagation?",
      ]},
      { name: "Section B", marksPerQuestion: 5, questions: [
        "Compare linear regression and logistic regression.",
        "Explain K-means clustering algorithm.",
        "Explain forward and backward propagation in neural networks.",
        "Compare bagging and boosting.",
        "Explain ROC curve and AUC.",
      ]},
      { name: "Section C", marksPerQuestion: 10, questions: [
        "Implement decision tree classifier. Compare with SVM.",
        "Explain CNN architecture. Compare with RNN for different tasks.",
        "Discuss model evaluation metrics. Explain K-fold cross-validation with example.",
      ]},
    ],
  },
];

// Compute PYQ analytics
export interface PYQAnalytics {
  mostRepeatedTopics: { topic: string; count: number }[];
  unitWeightage: Record<string, number>;
  difficultyTrend: string;
  frequentQuestions: { text: string; count: number }[];
}

export function getPYQAnalytics(subjectCode: string): PYQAnalytics {
  const papers = pyqPapers.filter(p => p.subjectCode === subjectCode);
  
  // Aggregate unit weightage
  const unitWeightage: Record<string, number> = {};
  papers.forEach(p => {
    Object.entries(p.unitDistribution).forEach(([unit, weight]) => {
      unitWeightage[unit] = (unitWeightage[unit] || 0) + weight;
    });
  });
  // Average
  Object.keys(unitWeightage).forEach(k => {
    unitWeightage[k] = Math.round(unitWeightage[k] / Math.max(papers.length, 1));
  });

  // Count question frequency
  const qFreq: Record<string, number> = {};
  papers.forEach(p => {
    p.sections.forEach(s => {
      s.questions.forEach(q => {
        const key = q.toLowerCase().trim();
        qFreq[key] = (qFreq[key] || 0) + 1;
      });
    });
  });

  const sortedQs = Object.entries(qFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([text, count]) => ({ text, count }));

  // Most repeated topics (from unit names)
  const topicCounts: Record<string, number> = {};
  Object.entries(unitWeightage).forEach(([topic, weight]) => {
    topicCounts[topic] = weight;
  });
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));

  return {
    mostRepeatedTopics: sortedTopics,
    unitWeightage,
    difficultyTrend: "Mixed with emphasis on Medium-Hard",
    frequentQuestions: sortedQs,
  };
}

export function getPYQPapersBySubject(subjectCode: string): PYQPaper[] {
  return pyqPapers.filter(p => p.subjectCode === subjectCode);
}

export function getPYQPapersByUniversity(universityId: string): PYQPaper[] {
  return pyqPapers.filter(p => p.university === universityId);
}
