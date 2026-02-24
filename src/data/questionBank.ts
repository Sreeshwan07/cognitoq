// Comprehensive question bank organized by subject → unit → questions
export interface Question {
  text: string;
  marks: number;
  type: "Short" | "Long" | "MCQ" | "Numerical" | "Diagram";
  difficulty: "Easy" | "Medium" | "Hard";
  bloom: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
}

export type SubjectQuestionBank = Record<string, Question[]>; // unit name → questions

const questionBank: Record<string, SubjectQuestionBank> = {
  // ─── DSA ───
  dsa: {
    "Arrays, Stacks & Queues": [
      { text: "Define stack. List two real-life applications.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the difference between stack and queue?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "What is a circular queue? Why is it needed?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "Write an algorithm to convert infix expression to postfix using stack.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Apply" },
      { text: "Implement a priority queue using arrays and explain its operations.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Apply" },
      { text: "Explain the concept of sparse matrix and its representation methods.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Write a program to implement a circular queue using arrays. Show all operations.", marks: 10, type: "Long", difficulty: "Medium", bloom: "Create" },
      { text: "Implement two stacks in a single array and analyze space efficiency.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Create" },
    ],
    "Linked Lists": [
      { text: "Define a singly linked list.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the advantage of linked list over array?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "Compare singly linked list and doubly linked list.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Write an algorithm to reverse a singly linked list.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Apply" },
      { text: "Implement a polynomial addition using linked lists with a complete program.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Create" },
      { text: "Design and implement a doubly linked list with all operations. Analyze time complexity.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Create" },
    ],
    "Trees & BST": [
      { text: "Define binary tree. What is a complete binary tree?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the height of a balanced BST with n nodes?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Explain AVL tree rotations with examples.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Write algorithms for inorder, preorder, and postorder traversals.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Apply" },
      { text: "Construct a BST from given data and perform all traversals. Compare AVL and Red-Black trees.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
      { text: "Implement a B-tree of order 5 and demonstrate insertion and deletion operations.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Create" },
    ],
    "Graphs": [
      { text: "Define graph. Differentiate between directed and undirected graph.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the degree of a vertex?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Differentiate between BFS and DFS with examples.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Explain adjacency matrix and adjacency list representations.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Implement BFS and DFS for a graph. Apply Dijkstra's algorithm on a weighted graph.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
      { text: "Explain and implement Kruskal's and Prim's algorithm for MST. Compare their complexities.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
    "Sorting & Searching": [
      { text: "What is the time complexity of binary search?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Define stable sorting. Give an example.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Define Big-O, Big-Ω, and Big-Θ notations with examples.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Compare merge sort and quick sort in terms of complexity and stability.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Explain QuickSort in best, average, and worst cases. Write the partition algorithm.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
      { text: "Implement radix sort and counting sort. Analyze when each is preferred.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Create" },
    ],
  },
  // ─── DBMS ───
  dbms: {
    "ER Model & Relational Model": [
      { text: "Define primary key and foreign key.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is a weak entity? Give an example.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "What is the difference between entity and attribute?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "Explain generalization and specialization with examples.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Differentiate between relational model and ER model with examples.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Draw an ER diagram for a university database system. Convert it to relational schema.", marks: 10, type: "Diagram", difficulty: "Medium", bloom: "Apply" },
      { text: "Design an ER model for a hospital management system with all constraints. Map to relational tables.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Create" },
    ],
    "SQL & Normalization": [
      { text: "What is the difference between WHERE and HAVING?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "Define normalization. Why is it needed?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Write SQL query to find the second highest salary from an Employee table.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Apply" },
      { text: "Explain 1NF, 2NF, 3NF with examples.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Explain normalization up to BCNF with examples. Discuss decomposition and lossless join.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
      { text: "Write complex SQL queries involving joins, subqueries, and aggregate functions for a given schema.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Transaction Management": [
      { text: "What is ACID property? List all.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Define serializability.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Explain the difference between conflict and view serializability.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Describe the log-based recovery mechanism.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Explain transaction states and recovery techniques with ARIES algorithm.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
    "Concurrency Control": [
      { text: "What is a deadlock in DBMS?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Define two-phase locking protocol.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Compare optimistic and pessimistic concurrency control.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Explain timestamp-based ordering protocol.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Discuss all concurrency control techniques: lock-based, timestamp, and validation-based protocols.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
    "Indexing & Hashing": [
      { text: "What is an index in DBMS?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Differentiate between clustered and non-clustered index.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "Differentiate between B-tree and B+ tree indexing.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Explain static and dynamic hashing techniques.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Compare B-tree, B+ tree, and hash indexing. Discuss query optimization using indexes.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
  },
  // ─── OS ───
  os: {
    "Process Management": [
      { text: "Define process. What are the states of a process?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is a PCB? List its contents.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Explain process creation and termination with system calls.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Differentiate between process and thread with examples.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Explain IPC mechanisms: shared memory, message passing, pipes. Compare with diagrams.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
    "CPU Scheduling": [
      { text: "Define turnaround time and waiting time.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the convoy effect in FCFS?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "Compare preemptive and non-preemptive scheduling algorithms.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Solve a scheduling problem using Round Robin with quantum=3.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Compare FCFS, SJF, Priority, and Round Robin using a numerical example. Calculate all metrics.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
    "Memory Management": [
      { text: "Define paging. What is a page table?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is internal fragmentation?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Explain paging vs segmentation with diagrams.", marks: 5, type: "Diagram", difficulty: "Medium", bloom: "Analyze" },
      { text: "Describe the concept of demand paging and its advantages.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Explain virtual memory with page replacement algorithms (FIFO, LRU, Optimal). Solve a numerical.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "File Systems": [
      { text: "Define file system. List its functions.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is an inode?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Explain file allocation methods: contiguous, linked, and indexed.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Describe directory structures: single-level, two-level, tree, and acyclic graph.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Compare all disk scheduling algorithms with numerical examples.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Deadlocks & Synchronization": [
      { text: "Define deadlock. List necessary conditions.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is a semaphore?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Solve the producer-consumer problem using semaphores.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Apply" },
      { text: "Explain Banker's algorithm with an example.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Explain deadlock detection, prevention, and avoidance. Solve Banker's algorithm numerical.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
  },
  // ─── CN ───
  cn: {
    "Network Models & OSI": [
      { text: "List all layers of the OSI model.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the difference between OSI and TCP/IP model?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "Explain the functions of each layer of the OSI model.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Compare circuit switching and packet switching.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Explain the OSI model in detail with protocols at each layer. Compare with TCP/IP model.", marks: 10, type: "Long", difficulty: "Medium", bloom: "Analyze" },
    ],
    "Data Link Layer": [
      { text: "What is framing?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Define flow control.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Explain sliding window protocol with examples.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Compare CSMA/CD and CSMA/CA.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Explain error detection and correction methods. Solve CRC and Hamming code problems.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Network Layer & Routing": [
      { text: "Define subnet mask.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is CIDR notation?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Compare distance vector and link state routing.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Solve a subnetting problem with CIDR notation.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Explain Dijkstra's and Bellman-Ford routing algorithms with numerical examples.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Transport Layer (TCP/UDP)": [
      { text: "What is DNS?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Define socket.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Compare TCP and UDP protocols in detail.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Explain TCP three-way handshake.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Explain TCP congestion control mechanisms: slow start, congestion avoidance, fast retransmit.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
    "Application Layer Protocols": [
      { text: "What is HTTP? List its methods.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the role of DHCP?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Explain DNS resolution process step by step.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Compare FTP and SFTP protocols.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Analyze" },
      { text: "Explain email protocols (SMTP, POP3, IMAP) and web protocols (HTTP/HTTPS) in detail.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Understand" },
    ],
  },
  // ─── Math I ───
  math1: {
    "Matrices & Linear Algebra": [
      { text: "Define eigenvalue and eigenvector.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the rank of a matrix?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "State and prove the Cayley-Hamilton theorem.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Find eigenvalues and eigenvectors of A = [[2,1],[1,2]].", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Diagonalize the given matrix. Verify Cayley-Hamilton theorem and find A⁻¹ using it.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Differential Calculus": [
      { text: "State Rolle's theorem.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Define partial derivative.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Verify Rolle's theorem for f(x) = x² − 5x + 6 in [2, 3].", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Find maxima and minima of f(x,y) = x³ + y³ − 3xy.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Expand f(x,y) using Taylor's theorem. Apply Lagrange's method of undetermined multipliers.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Integral Calculus": [
      { text: "Define beta function.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "State the relation between beta and gamma functions.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Evaluate ∫₀^1 x^m (1−x)^n dx using beta function.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Evaluate a double integral over a given region.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Evaluate ∫₀^∞ e^(−x²) dx using Gamma function. Solve change of order of integration problems.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Sequences & Series": [
      { text: "Define convergence of a series.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "State D'Alembert's ratio test.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Test the convergence of Σ(1/n²) using p-series test.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Find the Maclaurin series expansion of e^x.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Apply" },
      { text: "Test convergence using comparison, ratio, and root tests. Find radius of convergence of power series.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
    "Vector Calculus": [
      { text: "Define gradient of a scalar field.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the physical significance of curl?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Understand" },
      { text: "Find div F and curl F where F = x²i + y²j + z²k.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Verify Green's theorem for a given vector field.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "State and verify Stoke's theorem and Gauss divergence theorem with examples.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
  },
  // ─── Math II ───
  math2: {
    "Ordinary Differential Equations": [
      { text: "Define order and degree of a differential equation.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is an exact differential equation?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Solve: dy/dx + y = e^x.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Solve the Bernoulli equation: dy/dx + y/x = y².", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Solve a second-order ODE with constant coefficients. Apply method of variation of parameters.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Laplace Transforms": [
      { text: "State the definition of Laplace transform.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Find L{sin at}.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Apply" },
      { text: "Find the Laplace transform of t²e^(3t).", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Use convolution theorem to find inverse Laplace transform.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Solve a system of differential equations using Laplace transforms.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Fourier Series": [
      { text: "State Dirichlet conditions for Fourier series.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Define even and odd functions.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Find the Fourier series of f(x) = x in (−π, π).", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Expand f(x) as half-range sine series.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Find Fourier series and use Parseval's identity to evaluate the sum of the series.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Analyze" },
    ],
    "Partial Differential Equations": [
      { text: "Classify the PDE: ∂²u/∂x² + ∂²u/∂y² = 0.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "What is the wave equation?", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Solve one-dimensional heat equation using separation of variables.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Derive the solution of wave equation using D'Alembert's method.", marks: 5, type: "Short", difficulty: "Medium", bloom: "Understand" },
      { text: "Solve the two-dimensional Laplace equation with given boundary conditions.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
    "Complex Analysis": [
      { text: "Define analytic function.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "State Cauchy-Riemann equations.", marks: 2, type: "Short", difficulty: "Easy", bloom: "Remember" },
      { text: "Verify if f(z) = z² is analytic.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Evaluate ∮ (z²+1)/(z−1) dz using Cauchy's integral formula.", marks: 5, type: "Numerical", difficulty: "Medium", bloom: "Apply" },
      { text: "Find Laurent series and residues. Evaluate real integrals using residue theorem.", marks: 10, type: "Long", difficulty: "Hard", bloom: "Apply" },
    ],
  },
};

// Generate generic questions for subjects without specific banks
export function getQuestionsForUnit(subjectId: string, unitName: string): Question[] {
  return questionBank[subjectId]?.[unitName] || [];
}

export function getQuestionsForSubject(subjectId: string): SubjectQuestionBank {
  return questionBank[subjectId] || {};
}

export function generateGenericQuestion(unitName: string, marks: number, difficulty: "Easy" | "Medium" | "Hard"): Question {
  const templates: Record<number, Record<string, string[]>> = {
    2: {
      Easy: [
        `Define the key concept of ${unitName}.`,
        `List two applications of ${unitName}.`,
        `State the fundamental principle of ${unitName}.`,
        `What is the significance of ${unitName}?`,
      ],
      Medium: [
        `Differentiate between two approaches in ${unitName}.`,
        `Write the formula/equation related to ${unitName}.`,
        `What are the limitations of methods in ${unitName}?`,
      ],
      Hard: [
        `Critically compare the methods used in ${unitName}.`,
        `Explain the mathematical basis of ${unitName}.`,
      ],
    },
    5: {
      Easy: [
        `Explain the basic concepts of ${unitName} with examples.`,
        `Describe the process/procedure involved in ${unitName}.`,
      ],
      Medium: [
        `Derive the key formula in ${unitName} and solve a simple problem.`,
        `Compare and contrast two methods in ${unitName} with advantages and disadvantages.`,
        `Solve a numerical problem related to ${unitName}.`,
      ],
      Hard: [
        `Analyze the advanced aspects of ${unitName} with real-world applications.`,
        `Critically evaluate the techniques used in ${unitName}.`,
      ],
    },
    10: {
      Easy: [
        `Explain ${unitName} in detail with diagrams and examples.`,
      ],
      Medium: [
        `Solve a comprehensive problem on ${unitName}. Explain each step.`,
        `Describe the complete theory of ${unitName} with derivation and applications.`,
      ],
      Hard: [
        `Analyze a case study related to ${unitName}. Discuss all approaches and their trade-offs.`,
        `Write a complete solution involving ${unitName} with algorithm, analysis, and optimization.`,
      ],
    },
  };

  const pool = templates[marks]?.[difficulty] || templates[5]?.Medium || [];
  const text = pool[Math.floor(Math.random() * pool.length)] || `Explain the concepts of ${unitName}. [${marks} marks]`;

  const blooms: Record<string, Question["bloom"]> = { Easy: "Remember", Medium: "Apply", Hard: "Analyze" };

  return {
    text,
    marks,
    type: marks <= 2 ? "Short" : marks <= 5 ? "Short" : "Long",
    difficulty,
    bloom: blooms[difficulty],
  };
}

export default questionBank;
