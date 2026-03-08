/**
 * Deep academic knowledge base for each subject.
 * Used to supplement uploaded notes during AI paper generation.
 * Structure: subjectId → array of unit knowledge objects.
 */

export interface UnitKnowledge {
  unitName: string;
  keyConcepts: string[];
  definitions: string[];
  theories: string[];
  frequentlyAsked: string[];
  examples?: string[];
}

export interface SubjectKnowledge {
  subjectId: string;
  subjectName: string;
  units: UnitKnowledge[];
}

export const subjectKnowledgeBase: SubjectKnowledge[] = [
  // ─── DBMS ───
  {
    subjectId: "dbms",
    subjectName: "Database Management Systems",
    units: [
      {
        unitName: "ER Model & Relational Model",
        keyConcepts: ["Database definition", "File system vs DBMS", "Advantages of DBMS", "Data abstraction", "Schema & Instances", "Data models", "ER diagrams", "Entity sets", "Relationship sets", "Attributes", "Mapping cardinalities", "Participation constraints", "Weak entities", "Relational model", "Relational algebra", "Tuple relational calculus"],
        definitions: ["Database: organized collection of structured data", "DBMS: software to manage databases", "Schema: logical structure of database", "Instance: data stored at a particular moment", "Entity: real-world object", "Attribute: property of an entity", "Relationship: association among entities", "Weak entity: entity that cannot be uniquely identified by its own attributes"],
        theories: ["Three-level architecture (external, conceptual, internal)", "Data independence", "ER-to-relational mapping rules"],
        frequentlyAsked: ["Draw ER diagram for given scenario", "Explain three-level architecture", "Difference between weak and strong entity", "Convert ER to relational schema", "Explain mapping cardinalities"],
      },
      {
        unitName: "SQL & Normalization",
        keyConcepts: ["Keys (Primary, Foreign, Candidate, Super, Alternate)", "Integrity constraints", "DDL commands (CREATE, ALTER, DROP)", "DML commands (SELECT, INSERT, UPDATE, DELETE)", "TCL commands (COMMIT, ROLLBACK)", "Aggregate functions", "Joins (INNER, LEFT, RIGHT, FULL)", "Subqueries", "Views", "Functional dependency", "1NF", "2NF", "3NF", "BCNF", "Multivalued dependency", "4NF", "5NF", "Lossless decomposition", "Dependency preservation"],
        definitions: ["Primary key: uniquely identifies each record", "Foreign key: references primary key of another table", "Normalization: process of organizing data to reduce redundancy", "Functional dependency: constraint between attributes", "Candidate key: minimal superkey"],
        theories: ["Armstrong's axioms", "Closure of functional dependencies", "Canonical cover", "Decomposition theory"],
        frequentlyAsked: ["Normalize a given relation to 3NF/BCNF", "Write SQL queries for given scenarios", "Explain types of joins with examples", "Difference between DDL and DML", "Find candidate keys from functional dependencies"],
      },
      {
        unitName: "Transaction Management",
        keyConcepts: ["ACID properties", "Transaction states", "Serializability", "Conflict serializability", "View serializability", "Recoverability", "Cascadeless schedules", "Strict schedules", "Log-based recovery", "Checkpointing", "Shadow paging"],
        definitions: ["Transaction: logical unit of work", "Atomicity: all or nothing", "Consistency: database remains valid", "Isolation: concurrent transactions don't interfere", "Durability: committed changes persist", "Schedule: sequence of operations from concurrent transactions"],
        theories: ["Serializability theory", "Precedence graph method", "Recovery algorithms (ARIES)"],
        frequentlyAsked: ["Explain ACID properties with examples", "Check if a schedule is conflict serializable", "Draw precedence graph", "Explain log-based recovery", "Transaction state diagram"],
      },
      {
        unitName: "Concurrency Control",
        keyConcepts: ["Lock-based protocols", "Two-phase locking (2PL)", "Strict 2PL", "Rigorous 2PL", "Deadlock handling", "Deadlock prevention", "Deadlock detection", "Wait-die scheme", "Wound-wait scheme", "Timestamp ordering", "Thomas write rule", "Multiversion concurrency control", "Optimistic concurrency control"],
        definitions: ["Deadlock: circular wait among transactions", "Starvation: transaction waits indefinitely", "Two-phase locking: growing phase and shrinking phase", "Timestamp: unique identifier for transaction ordering"],
        theories: ["Two-phase locking theorem", "Timestamp ordering protocol", "Validation-based protocol"],
        frequentlyAsked: ["Explain 2PL with example", "Deadlock detection using wait-for graph", "Compare deadlock prevention schemes", "Timestamp-based concurrency control"],
      },
      {
        unitName: "Indexing & Hashing",
        keyConcepts: ["Ordered indices", "Dense index", "Sparse index", "B-tree", "B+ tree", "Multilevel indexing", "Static hashing", "Dynamic hashing", "Extendible hashing", "Linear hashing", "Query optimization", "Query processing steps", "Cost estimation", "Join algorithms"],
        definitions: ["Index: data structure for efficient data retrieval", "B+ tree: balanced tree with all records at leaf level", "Hashing: mapping search key to bucket address", "Query optimization: finding most efficient execution plan"],
        theories: ["B+ tree insertion/deletion algorithms", "Cost-based query optimization", "Equivalence rules for query transformation"],
        frequentlyAsked: ["Construct B+ tree for given values", "Compare B-tree and B+ tree", "Explain extendible hashing", "Steps in query processing", "Query optimization techniques"],
      },
    ],
  },

  // ─── OS ───
  {
    subjectId: "os",
    subjectName: "Operating Systems",
    units: [
      {
        unitName: "Process Management",
        keyConcepts: ["Process concept", "Process states", "PCB", "Process creation (fork)", "Process termination", "Threads", "Multithreading models", "User-level vs kernel-level threads", "Inter-process communication", "Shared memory", "Message passing", "Pipes", "Sockets"],
        definitions: ["Process: program in execution", "Thread: lightweight process", "PCB: data structure containing process information", "Context switch: saving/restoring process state"],
        theories: ["Process state transition diagram", "Thread models (many-to-one, one-to-one, many-to-many)"],
        frequentlyAsked: ["Explain process states with diagram", "Difference between process and thread", "IPC mechanisms", "User vs kernel threads"],
      },
      {
        unitName: "CPU Scheduling",
        keyConcepts: ["Scheduling criteria", "FCFS", "SJF", "Priority scheduling", "Round Robin", "Multilevel queue", "Multilevel feedback queue", "Preemptive vs non-preemptive", "Turnaround time", "Waiting time", "Response time", "Convoy effect", "Starvation", "Aging"],
        definitions: ["CPU burst: time process uses CPU", "Turnaround time: completion - arrival time", "Waiting time: turnaround - burst time", "Throughput: processes completed per unit time"],
        theories: ["Optimal scheduling (SJF)", "Gantt chart analysis"],
        frequentlyAsked: ["Solve scheduling problems with Gantt charts", "Compare scheduling algorithms", "Calculate average waiting/turnaround time", "Explain multilevel feedback queue"],
      },
      {
        unitName: "Memory Management",
        keyConcepts: ["Contiguous allocation", "Paging", "Segmentation", "Page table", "TLB", "Virtual memory", "Demand paging", "Page replacement algorithms (FIFO, LRU, Optimal)", "Thrashing", "Working set model", "Frame allocation", "Belady's anomaly", "Internal fragmentation", "External fragmentation"],
        definitions: ["Virtual memory: illusion of large memory using disk", "Page fault: referenced page not in memory", "TLB: cache for page table entries", "Thrashing: excessive paging activity"],
        theories: ["Belady's anomaly", "Working set theory", "Optimal page replacement"],
        frequentlyAsked: ["Calculate page faults for given reference string", "Compare page replacement algorithms", "Explain paging with diagram", "Difference between paging and segmentation"],
      },
      {
        unitName: "File Systems",
        keyConcepts: ["File attributes", "File operations", "Directory structure", "Single-level", "Two-level", "Tree-structured", "Acyclic graph", "File allocation methods (contiguous, linked, indexed)", "Free space management", "Disk scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK)"],
        definitions: ["File: named collection of related data", "Directory: collection of file entries", "Inode: data structure storing file metadata"],
        theories: ["File allocation strategies comparison", "Disk scheduling optimization"],
        frequentlyAsked: ["Compare file allocation methods", "Solve disk scheduling problems", "Explain directory structures", "Calculate seek time for disk scheduling"],
      },
      {
        unitName: "Deadlocks & Synchronization",
        keyConcepts: ["Deadlock conditions (mutual exclusion, hold & wait, no preemption, circular wait)", "Resource allocation graph", "Deadlock prevention", "Deadlock avoidance (Banker's algorithm)", "Deadlock detection", "Critical section problem", "Peterson's solution", "Mutex", "Semaphores", "Monitors", "Classical problems (producer-consumer, readers-writers, dining philosophers)"],
        definitions: ["Deadlock: set of processes each waiting for resource held by another", "Semaphore: synchronization variable", "Mutex: binary semaphore for mutual exclusion", "Monitor: high-level synchronization construct"],
        theories: ["Banker's algorithm (safety algorithm)", "Necessary conditions for deadlock", "Peterson's solution correctness"],
        frequentlyAsked: ["Solve Banker's algorithm problems", "Explain dining philosophers problem", "Producer-consumer using semaphores", "Deadlock detection algorithm"],
      },
    ],
  },

  // ─── CN ───
  {
    subjectId: "cn",
    subjectName: "Computer Networks",
    units: [
      {
        unitName: "Network Models & OSI",
        keyConcepts: ["OSI model layers", "TCP/IP model", "Functions of each layer", "Protocols at each layer", "Network topologies", "Transmission media", "Multiplexing (FDM, TDM, WDM)", "Switching techniques (circuit, packet, message)"],
        definitions: ["Protocol: set of rules governing communication", "OSI: Open Systems Interconnection reference model", "Topology: physical/logical arrangement of network"],
        theories: ["Layered architecture benefits", "Encapsulation/decapsulation"],
        frequentlyAsked: ["Compare OSI and TCP/IP models", "Functions of each OSI layer", "Types of network topologies", "Circuit vs packet switching"],
      },
      {
        unitName: "Data Link Layer",
        keyConcepts: ["Framing", "Error detection (CRC, checksum, parity)", "Error correction (Hamming code)", "Flow control", "Stop-and-wait", "Go-Back-N", "Selective Repeat", "Sliding window protocol", "HDLC", "PPP", "MAC sublayer", "ALOHA", "CSMA/CD", "CSMA/CA", "Ethernet", "IEEE 802.3", "IEEE 802.11"],
        definitions: ["CRC: Cyclic Redundancy Check", "MAC: Medium Access Control", "CSMA/CD: Carrier Sense Multiple Access with Collision Detection"],
        theories: ["Shannon capacity theorem", "Hamming distance theory", "Sliding window efficiency"],
        frequentlyAsked: ["Solve CRC problems", "Compare Go-Back-N and Selective Repeat", "Explain CSMA/CD", "Calculate efficiency of stop-and-wait"],
      },
      {
        unitName: "Network Layer & Routing",
        keyConcepts: ["IPv4 addressing", "Subnetting", "CIDR", "IPv6", "Routing algorithms", "Distance vector routing", "Link state routing", "Dijkstra's algorithm", "Bellman-Ford algorithm", "RIP", "OSPF", "BGP", "NAT", "ICMP", "ARP", "DHCP"],
        definitions: ["Subnet: logical subdivision of IP network", "Router: device that forwards packets between networks", "NAT: Network Address Translation"],
        theories: ["Classful vs classless addressing", "Routing convergence", "Count-to-infinity problem"],
        frequentlyAsked: ["Solve subnetting problems", "Apply Dijkstra's algorithm", "Compare distance vector and link state", "Explain NAT with diagram", "IPv4 vs IPv6"],
      },
      {
        unitName: "Transport Layer (TCP/UDP)",
        keyConcepts: ["TCP vs UDP", "TCP 3-way handshake", "TCP connection termination", "Flow control (sliding window)", "Congestion control", "Slow start", "Congestion avoidance", "Fast retransmit", "Fast recovery", "Port numbers", "Socket programming", "Multiplexing/demultiplexing"],
        definitions: ["TCP: Transmission Control Protocol (reliable, connection-oriented)", "UDP: User Datagram Protocol (unreliable, connectionless)", "Congestion: too many packets in network"],
        theories: ["TCP congestion control algorithms", "Additive increase multiplicative decrease (AIMD)"],
        frequentlyAsked: ["Explain TCP 3-way handshake", "TCP vs UDP comparison", "TCP congestion control mechanisms", "Calculate TCP throughput"],
      },
      {
        unitName: "Application Layer Protocols",
        keyConcepts: ["HTTP/HTTPS", "FTP", "SMTP", "POP3", "IMAP", "DNS", "SNMP", "Telnet", "SSH", "Web architecture", "Cookies", "Caching", "CDN", "Email architecture", "DNS hierarchy"],
        definitions: ["DNS: Domain Name System", "HTTP: HyperText Transfer Protocol", "URL: Uniform Resource Locator"],
        theories: ["DNS resolution process", "HTTP request/response cycle", "Persistent vs non-persistent connections"],
        frequentlyAsked: ["Explain DNS resolution", "HTTP methods", "Difference between HTTP and HTTPS", "Email protocols comparison", "How FTP works"],
      },
    ],
  },

  // ─── DSA ───
  {
    subjectId: "dsa",
    subjectName: "Data Structures & Algorithms",
    units: [
      {
        unitName: "Arrays, Stacks & Queues",
        keyConcepts: ["Array operations", "Static vs dynamic arrays", "Stack (LIFO)", "Stack operations (push, pop, peek)", "Stack applications (expression evaluation, balancing parentheses)", "Queue (FIFO)", "Circular queue", "Priority queue", "Deque", "Infix to postfix conversion", "Postfix evaluation"],
        definitions: ["Stack: LIFO data structure", "Queue: FIFO data structure", "Array: contiguous memory allocation for homogeneous elements"],
        theories: ["Time complexity of operations", "Amortized analysis for dynamic arrays"],
        frequentlyAsked: ["Implement stack using array/linked list", "Infix to postfix conversion", "Circular queue implementation", "Applications of stack and queue"],
      },
      {
        unitName: "Linked Lists",
        keyConcepts: ["Singly linked list", "Doubly linked list", "Circular linked list", "Insertion/deletion operations", "Reversing linked list", "Detecting loop", "Merge two sorted lists", "Skip list", "Memory allocation"],
        definitions: ["Node: element containing data and pointer", "Head: first node of linked list", "Null pointer: end of list"],
        theories: ["Floyd's cycle detection algorithm", "Time complexity comparison with arrays"],
        frequentlyAsked: ["Reverse a linked list", "Detect and remove loop", "Compare array vs linked list", "Implement operations on doubly linked list"],
      },
      {
        unitName: "Trees & BST",
        keyConcepts: ["Binary tree", "Binary search tree", "Tree traversals (inorder, preorder, postorder, level-order)", "AVL tree", "Rotations (LL, RR, LR, RL)", "Heap (min/max)", "Heapify", "Heap sort", "Huffman coding", "B-tree basics", "Red-black tree properties"],
        definitions: ["BST: binary tree where left < root < right", "AVL: self-balancing BST", "Heap: complete binary tree satisfying heap property"],
        theories: ["BST search/insert/delete time complexity", "AVL balancing algorithm", "Heap property maintenance"],
        frequentlyAsked: ["Construct BST from given data", "AVL tree insertion with rotations", "Build heap from array", "Tree traversal problems", "Huffman coding example"],
      },
      {
        unitName: "Graphs",
        keyConcepts: ["Graph representations (adjacency matrix, adjacency list)", "BFS", "DFS", "Topological sorting", "Minimum spanning tree (Prim's, Kruskal's)", "Shortest path (Dijkstra's, Bellman-Ford, Floyd-Warshall)", "Connected components", "Strongly connected components", "Graph coloring"],
        definitions: ["Graph: set of vertices and edges", "Spanning tree: subgraph connecting all vertices with minimum edges", "DAG: Directed Acyclic Graph"],
        theories: ["BFS/DFS time complexity", "MST optimality", "Dijkstra's correctness"],
        frequentlyAsked: ["Apply BFS/DFS on given graph", "Find MST using Prim's/Kruskal's", "Dijkstra's shortest path", "Topological sort application"],
      },
      {
        unitName: "Sorting & Searching",
        keyConcepts: ["Bubble sort", "Selection sort", "Insertion sort", "Merge sort", "Quick sort", "Heap sort", "Radix sort", "Counting sort", "Linear search", "Binary search", "Hashing", "Collision resolution (chaining, open addressing)", "Time complexity analysis"],
        definitions: ["Stable sort: preserves relative order of equal elements", "In-place sort: uses O(1) extra space", "Hash function: maps key to array index"],
        theories: ["Lower bound of comparison-based sorting O(n log n)", "Master theorem for divide & conquer", "Average case analysis of quicksort"],
        frequentlyAsked: ["Compare sorting algorithms", "Trace merge sort/quick sort on data", "Binary search variations", "Hashing with collision resolution", "Time complexity table"],
      },
    ],
  },

  // ─── SE ───
  {
    subjectId: "se",
    subjectName: "Software Engineering",
    units: [
      {
        unitName: "SDLC Models",
        keyConcepts: ["Waterfall model", "Iterative model", "Spiral model", "V-model", "Agile methodology", "Scrum", "Kanban", "Extreme Programming", "RAD model", "Prototype model", "Incremental model"],
        definitions: ["SDLC: Software Development Life Cycle", "Agile: iterative development with customer collaboration", "Sprint: time-boxed iteration in Scrum"],
        theories: ["When to use which model", "Agile manifesto principles"],
        frequentlyAsked: ["Compare waterfall and agile", "Explain spiral model with diagram", "Advantages of agile over traditional", "Scrum roles and ceremonies"],
      },
      {
        unitName: "Requirements Engineering",
        keyConcepts: ["Requirements elicitation", "Functional requirements", "Non-functional requirements", "SRS document", "Use case diagrams", "User stories", "Requirements validation", "Feasibility study"],
        definitions: ["SRS: Software Requirements Specification", "Functional requirement: what system should do", "Non-functional requirement: quality attributes"],
        theories: ["Requirements engineering process", "IEEE 830 SRS standard"],
        frequentlyAsked: ["Write SRS for given system", "Draw use case diagram", "Functional vs non-functional requirements", "Requirements elicitation techniques"],
      },
      {
        unitName: "Design Patterns",
        keyConcepts: ["Coupling and cohesion", "Design principles (SOLID)", "Creational patterns (Singleton, Factory, Builder)", "Structural patterns (Adapter, Facade, Decorator)", "Behavioral patterns (Observer, Strategy, Command)", "UML diagrams", "Class diagram", "Sequence diagram", "Architecture styles (MVC, layered, microservices)"],
        definitions: ["Design pattern: reusable solution to common problem", "Coupling: degree of interdependence between modules", "Cohesion: degree of relatedness within a module"],
        theories: ["SOLID principles", "GRASP patterns"],
        frequentlyAsked: ["Explain any three design patterns", "Draw class diagram for given scenario", "SOLID principles with examples", "MVC architecture"],
      },
      {
        unitName: "Testing & QA",
        keyConcepts: ["Levels of testing (unit, integration, system, acceptance)", "White-box testing", "Black-box testing", "Boundary value analysis", "Equivalence partitioning", "Statement coverage", "Branch coverage", "Path coverage", "Regression testing", "Alpha/Beta testing", "Test case design"],
        definitions: ["Testing: process of finding defects", "Bug: deviation from expected behavior", "Test case: set of conditions to determine correctness"],
        theories: ["V-model testing alignment", "McCabe's cyclomatic complexity"],
        frequentlyAsked: ["White-box vs black-box testing", "Design test cases using BVA", "Explain levels of testing", "Calculate cyclomatic complexity"],
      },
      {
        unitName: "Project Management",
        keyConcepts: ["Project planning", "Effort estimation (COCOMO, Function Points)", "Risk management", "Scheduling (Gantt chart, PERT/CPM)", "Configuration management", "Software metrics", "Quality assurance", "CMM/CMMI levels"],
        definitions: ["COCOMO: Constructive Cost Model", "Risk: potential threat to project", "Metric: quantitative measure"],
        theories: ["COCOMO model types", "Function point analysis", "Critical path method"],
        frequentlyAsked: ["Calculate effort using COCOMO", "Explain CMMI levels", "Risk management strategies", "Draw Gantt chart for project"],
      },
    ],
  },

  // ─── Digital Logic Design ───
  {
    subjectId: "dld",
    subjectName: "Digital Logic Design",
    units: [
      {
        unitName: "Number Systems & Boolean Algebra",
        keyConcepts: ["Binary, Octal, Decimal, Hexadecimal conversions", "1's complement", "2's complement", "BCD", "Gray code", "Boolean algebra laws", "De Morgan's theorems", "SOP and POS forms", "Karnaugh maps", "Don't care conditions"],
        definitions: ["Boolean algebra: algebra dealing with binary variables", "Minterm: product term with all variables", "Maxterm: sum term with all variables"],
        theories: ["Shannon's expansion theorem", "K-map simplification rules"],
        frequentlyAsked: ["Simplify using K-map", "Number system conversions", "Prove De Morgan's theorems", "SOP to POS conversion"],
      },
      {
        unitName: "Combinational Circuits",
        keyConcepts: ["Half adder", "Full adder", "Half subtractor", "Full subtractor", "Multiplexer", "Demultiplexer", "Encoder", "Decoder", "Comparator", "BCD adder", "Code converters"],
        definitions: ["Combinational circuit: output depends only on current inputs", "Multiplexer: data selector"],
        theories: ["Universal gates (NAND, NOR)", "Function implementation using MUX"],
        frequentlyAsked: ["Design full adder circuit", "Implement function using MUX", "Explain encoder and decoder", "Design using universal gates"],
      },
      {
        unitName: "Sequential Circuits",
        keyConcepts: ["SR flip-flop", "JK flip-flop", "D flip-flop", "T flip-flop", "Master-slave flip-flop", "Excitation tables", "State diagrams", "State tables", "Mealy machine", "Moore machine", "Sequence detector design"],
        definitions: ["Sequential circuit: output depends on current input and past state", "Flip-flop: basic memory element", "State: memory of past inputs"],
        theories: ["State minimization", "Mealy vs Moore comparison"],
        frequentlyAsked: ["Design sequence detector", "Convert between flip-flop types", "Draw state diagram", "Mealy vs Moore machine"],
      },
      {
        unitName: "Registers & Counters",
        keyConcepts: ["Shift registers (SISO, SIPO, PISO, PIPO)", "Ring counter", "Johnson counter", "Synchronous counters", "Asynchronous counters", "Up/down counters", "Modulo-N counter", "Counter design procedure"],
        definitions: ["Register: group of flip-flops for data storage", "Counter: sequential circuit that goes through sequence of states"],
        theories: ["Counter design using state diagram method", "Ripple counter timing analysis"],
        frequentlyAsked: ["Design mod-N counter", "Shift register applications", "Synchronous vs asynchronous counters", "Ring counter operation"],
      },
      {
        unitName: "Memory & PLDs",
        keyConcepts: ["RAM (SRAM, DRAM)", "ROM", "PROM", "EPROM", "EEPROM", "Flash memory", "PLA", "PAL", "FPGA", "Memory organization", "Cache memory basics", "Memory hierarchy"],
        definitions: ["RAM: Random Access Memory (volatile)", "ROM: Read Only Memory (non-volatile)", "PLD: Programmable Logic Device"],
        theories: ["Memory address decoding", "PLA vs PAL comparison"],
        frequentlyAsked: ["Explain memory hierarchy", "Implement function using PLA/PAL", "Compare SRAM and DRAM", "FPGA architecture"],
      },
    ],
  },

  // ─── Theory of Computation ───
  {
    subjectId: "toc",
    subjectName: "Theory of Computation",
    units: [
      {
        unitName: "Finite Automata",
        keyConcepts: ["DFA", "NFA", "NFA to DFA conversion", "DFA minimization", "Epsilon-NFA", "Equivalence of DFA and NFA", "Complement of DFA", "Product construction"],
        definitions: ["DFA: Deterministic Finite Automaton", "NFA: Non-deterministic Finite Automaton", "Language: set of strings accepted by automaton"],
        theories: ["Myhill-Nerode theorem", "Equivalence classes", "Pumping lemma for regular languages"],
        frequentlyAsked: ["Design DFA/NFA for given language", "Convert NFA to DFA", "Minimize DFA", "Prove language is not regular using pumping lemma"],
      },
      {
        unitName: "Regular Expressions",
        keyConcepts: ["Regular expression operators", "RE to NFA (Thompson's construction)", "NFA to RE", "DFA to RE", "Identities of regular expressions", "Arden's theorem", "Closure properties of regular languages"],
        definitions: ["Regular expression: algebraic notation for regular languages", "Kleene star: zero or more repetitions"],
        theories: ["Kleene's theorem", "Arden's theorem"],
        frequentlyAsked: ["Write RE for given language", "Convert RE to NFA", "Apply Arden's theorem", "Closure properties"],
      },
      {
        unitName: "Context-Free Grammars",
        keyConcepts: ["CFG definition", "Derivation trees", "Ambiguity", "Simplification of CFG", "Chomsky Normal Form", "Greibach Normal Form", "CYK algorithm", "Closure properties of CFL"],
        definitions: ["CFG: grammar with productions of form A → α", "Ambiguous grammar: has more than one parse tree for some string", "CNF: every production A → BC or A → a"],
        theories: ["Pumping lemma for CFLs", "Chomsky hierarchy"],
        frequentlyAsked: ["Design CFG for given language", "Convert to CNF/GNF", "Prove grammar is ambiguous", "Apply pumping lemma for CFL"],
      },
      {
        unitName: "Pushdown Automata",
        keyConcepts: ["PDA definition", "Deterministic PDA", "Non-deterministic PDA", "Acceptance by final state", "Acceptance by empty stack", "Equivalence of PDA and CFG", "CFG to PDA conversion", "PDA to CFG conversion"],
        definitions: ["PDA: automaton with stack memory", "DPDA: deterministic PDA (less powerful than NPDA)"],
        theories: ["DPDA vs NPDA power difference", "PDA-CFG equivalence proof"],
        frequentlyAsked: ["Design PDA for given language", "Convert CFG to PDA", "Trace PDA computation", "DPDA vs NPDA"],
      },
      {
        unitName: "Turing Machines",
        keyConcepts: ["TM definition", "TM as language acceptor", "TM as transducer", "Multi-tape TM", "Non-deterministic TM", "Universal TM", "Church-Turing thesis", "Decidability", "Halting problem", "Reducibility", "Rice's theorem", "Recursive and recursively enumerable languages"],
        definitions: ["Turing Machine: automaton with infinite tape", "Decidable: language for which TM always halts", "Recursively enumerable: TM halts on accepted strings"],
        theories: ["Church-Turing thesis", "Halting problem undecidability proof", "Rice's theorem"],
        frequentlyAsked: ["Design TM for given problem", "Prove halting problem is undecidable", "Recursive vs recursively enumerable", "Explain Church-Turing thesis"],
      },
    ],
  },

  // ─── Computer Organization & Architecture ───
  {
    subjectId: "coa",
    subjectName: "Computer Organization & Architecture",
    units: [
      {
        unitName: "Data Representation",
        keyConcepts: ["Fixed point representation", "Floating point (IEEE 754)", "Character encoding (ASCII, Unicode)", "Signed magnitude", "1's complement", "2's complement", "BCD", "Excess-3 code", "Error detecting codes"],
        definitions: ["IEEE 754: standard for floating-point arithmetic", "Overflow: result exceeds representable range"],
        theories: ["IEEE 754 single/double precision format", "Booth's multiplication algorithm"],
        frequentlyAsked: ["Convert to IEEE 754 format", "Booth's algorithm example", "Restoring vs non-restoring division", "BCD arithmetic"],
      },
      {
        unitName: "ALU Design",
        keyConcepts: ["Addition/subtraction circuits", "Carry look-ahead adder", "Multiplication algorithms (Booth's)", "Division algorithms (restoring, non-restoring)", "ALU organization", "Shift operations", "Hardware multiplier"],
        definitions: ["ALU: Arithmetic Logic Unit", "Carry look-ahead: parallel carry generation"],
        theories: ["Booth's algorithm", "Restoring division algorithm"],
        frequentlyAsked: ["Perform Booth's multiplication", "Design 4-bit ALU", "Carry look-ahead vs ripple carry", "Non-restoring division example"],
      },
      {
        unitName: "Control Unit",
        keyConcepts: ["Hardwired control", "Microprogrammed control", "Instruction cycle", "Instruction formats", "Addressing modes (immediate, direct, indirect, register, indexed)", "RISC vs CISC", "Pipelining", "Pipeline hazards", "Hazard resolution"],
        definitions: ["Control unit: component that directs operation of processor", "Microinstruction: low-level instruction in control memory", "Pipeline: overlapping instruction execution"],
        theories: ["Pipeline speedup formula", "Hazard types (data, control, structural)"],
        frequentlyAsked: ["Compare RISC and CISC", "Explain addressing modes", "Pipeline hazards and solutions", "Hardwired vs microprogrammed control"],
      },
      {
        unitName: "Memory Organization",
        keyConcepts: ["Memory hierarchy", "Cache memory", "Cache mapping (direct, associative, set-associative)", "Cache replacement policies", "Cache write policies", "Virtual memory", "Page table", "TLB", "Memory interleaving"],
        definitions: ["Cache hit: data found in cache", "Cache miss: data not in cache", "Hit ratio: fraction of accesses found in cache"],
        theories: ["Locality of reference", "Effective memory access time calculation"],
        frequentlyAsked: ["Calculate effective access time", "Cache mapping examples", "Compare cache mapping techniques", "Memory hierarchy diagram"],
      },
      {
        unitName: "I/O Organization",
        keyConcepts: ["I/O techniques (programmed, interrupt-driven, DMA)", "I/O interface", "Interrupts", "Interrupt handling", "DMA controller", "I/O processor", "Bus architecture", "Synchronous vs asynchronous buses", "Arbitration"],
        definitions: ["DMA: Direct Memory Access", "Interrupt: signal requesting CPU attention", "Bus: shared communication pathway"],
        theories: ["DMA transfer modes", "Interrupt priority schemes"],
        frequentlyAsked: ["Compare I/O techniques", "Explain DMA operation", "Interrupt handling process", "Bus arbitration methods"],
      },
    ],
  },

  // ─── Compiler Design ───
  {
    subjectId: "cd",
    subjectName: "Compiler Design",
    units: [
      {
        unitName: "Lexical Analysis",
        keyConcepts: ["Tokens, patterns, lexemes", "Regular expressions for tokens", "Finite automata for lexical analysis", "Lex tool", "Symbol table", "Input buffering"],
        definitions: ["Token: category of lexemes", "Lexeme: actual character sequence", "Pattern: rule describing token format"],
        theories: ["RE to NFA to DFA conversion for scanner", "Lex specification format"],
        frequentlyAsked: ["Design lexical analyzer for given tokens", "Role of lexical analyzer", "Token identification examples"],
      },
      {
        unitName: "Syntax Analysis",
        keyConcepts: ["CFG for programming languages", "Parse trees", "Top-down parsing (recursive descent, LL(1))", "Bottom-up parsing (LR(0), SLR, CLR, LALR)", "FIRST and FOLLOW sets", "Parsing table construction", "Yacc tool", "Ambiguity removal", "Left factoring", "Left recursion elimination"],
        definitions: ["Parser: checks syntactic correctness", "LL(1): Left-to-right, Leftmost derivation, 1 lookahead", "LR: Left-to-right, Rightmost derivation in reverse"],
        theories: ["LL vs LR parsing power", "Parsing table conflicts"],
        frequentlyAsked: ["Compute FIRST and FOLLOW", "Construct LL(1) parsing table", "Construct SLR parsing table", "Remove left recursion"],
      },
      {
        unitName: "Semantic Analysis",
        keyConcepts: ["Syntax-directed definitions", "S-attributed definitions", "L-attributed definitions", "Type checking", "Type conversions", "Semantic rules", "Annotated parse trees"],
        definitions: ["SDT: Syntax-Directed Translation", "Attribute grammar: grammar with attributes attached to symbols"],
        theories: ["Inherited vs synthesized attributes", "Type system rules"],
        frequentlyAsked: ["Construct annotated parse tree", "S-attributed vs L-attributed", "Type checking examples"],
      },
      {
        unitName: "Intermediate Code Generation",
        keyConcepts: ["Three-address code", "Quadruples", "Triples", "Indirect triples", "Syntax tree", "DAG", "Postfix notation", "Boolean expressions code", "Control flow statements code", "Backpatching"],
        definitions: ["Three-address code: at most one operator on right side", "Quadruple: (operator, arg1, arg2, result)", "DAG: Directed Acyclic Graph for expression"],
        theories: ["Backpatching algorithm", "Short-circuit evaluation"],
        frequentlyAsked: ["Generate three-address code", "Convert expression to quadruples/triples", "Construct DAG for expression"],
      },
      {
        unitName: "Code Optimization",
        keyConcepts: ["Local optimization", "Global optimization", "Loop optimization", "Common subexpression elimination", "Dead code elimination", "Constant folding", "Strength reduction", "Loop invariant code motion", "Induction variables", "Basic blocks", "Flow graphs", "Register allocation"],
        definitions: ["Basic block: straight-line code with single entry/exit", "Flow graph: directed graph of basic blocks", "Dead code: code that never executes"],
        theories: ["Data flow analysis", "Reaching definitions", "Live variable analysis"],
        frequentlyAsked: ["Identify basic blocks and flow graph", "Apply optimization techniques", "Common subexpression elimination example", "Loop optimization techniques"],
      },
    ],
  },

  // ─── AI ───
  {
    subjectId: "ai",
    subjectName: "Artificial Intelligence",
    units: [
      {
        unitName: "Search Algorithms",
        keyConcepts: ["Problem formulation", "State space", "BFS", "DFS", "Iterative deepening", "Uniform cost search", "A* algorithm", "Heuristic functions", "Admissibility", "Greedy best-first search", "Hill climbing", "Simulated annealing", "Genetic algorithms"],
        definitions: ["Heuristic: estimated cost to reach goal", "Admissible heuristic: never overestimates", "State space: set of all possible states"],
        theories: ["A* optimality proof", "Completeness and optimality of search algorithms"],
        frequentlyAsked: ["Solve problem using A*", "Compare BFS and DFS", "Hill climbing limitations", "Admissible heuristic examples"],
      },
      {
        unitName: "Knowledge Representation",
        keyConcepts: ["Propositional logic", "First-order logic", "Inference rules", "Unification", "Resolution", "Forward chaining", "Backward chaining", "Semantic networks", "Frames", "Ontologies"],
        definitions: ["Knowledge base: collection of facts and rules", "Inference: deriving new knowledge from existing", "Unification: process of making two terms identical"],
        theories: ["Soundness and completeness of inference", "Resolution refutation"],
        frequentlyAsked: ["Prove using resolution", "Convert to clause form", "Forward vs backward chaining", "Represent knowledge using FOL"],
      },
      {
        unitName: "Machine Learning Basics",
        keyConcepts: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Decision trees", "ID3 algorithm", "Naive Bayes", "K-nearest neighbors", "Linear regression", "Overfitting", "Cross-validation", "Bias-variance tradeoff"],
        definitions: ["Training data: labeled examples for learning", "Classification: predicting categorical label", "Regression: predicting continuous value"],
        theories: ["No free lunch theorem", "Bias-variance decomposition", "PAC learning"],
        frequentlyAsked: ["Build decision tree using ID3", "Naive Bayes classification example", "Overfitting prevention techniques", "Compare supervised and unsupervised"],
      },
      {
        unitName: "Neural Networks",
        keyConcepts: ["Perceptron", "Multi-layer perceptron", "Activation functions", "Backpropagation", "Gradient descent", "Learning rate", "Deep learning basics", "CNN basics", "RNN basics", "Vanishing gradient problem"],
        definitions: ["Neuron: basic computational unit", "Activation function: introduces non-linearity", "Backpropagation: algorithm to compute gradients"],
        theories: ["Universal approximation theorem", "Gradient descent convergence"],
        frequentlyAsked: ["Train perceptron for given data", "Backpropagation calculation", "Compare activation functions", "CNN architecture explanation"],
      },
      {
        unitName: "NLP Fundamentals",
        keyConcepts: ["Tokenization", "Stemming", "Lemmatization", "POS tagging", "Parsing", "Named entity recognition", "Bag of words", "TF-IDF", "Word embeddings", "Sentiment analysis", "Machine translation basics"],
        definitions: ["NLP: Natural Language Processing", "Tokenization: splitting text into tokens", "Corpus: large collection of text"],
        theories: ["Statistical language models", "N-gram models", "Distributional hypothesis"],
        frequentlyAsked: ["Explain NLP pipeline", "TF-IDF calculation", "Compare stemming and lemmatization", "Word embedding concepts"],
      },
    ],
  },

  // ─── Signals & Systems (ECE) ───
  {
    subjectId: "ss",
    subjectName: "Signals & Systems",
    units: [
      {
        unitName: "Signal Classification",
        keyConcepts: ["Continuous vs discrete", "Periodic vs aperiodic", "Even/odd signals", "Energy vs power signals", "Deterministic vs random", "Elementary signals (unit step, impulse, ramp, exponential)", "Signal operations (shifting, scaling, reversal)"],
        definitions: ["Signal: function conveying information", "Energy signal: finite total energy", "Power signal: finite average power"],
        theories: ["Signal decomposition", "Periodicity conditions"],
        frequentlyAsked: ["Classify given signals", "Perform signal operations", "Determine energy/power of signal", "Even-odd decomposition"],
      },
      {
        unitName: "LTI Systems",
        keyConcepts: ["Linearity", "Time invariance", "Causality", "Stability (BIBO)", "Convolution", "Impulse response", "System properties from impulse response", "Difference equations", "Differential equations"],
        definitions: ["LTI: Linear Time-Invariant", "Convolution: integral/sum of weighted impulse responses", "BIBO stable: bounded input → bounded output"],
        theories: ["Convolution theorem", "Stability conditions"],
        frequentlyAsked: ["Compute convolution", "Check system properties", "Solve difference equation", "Find impulse response"],
      },
      {
        unitName: "Fourier Transform",
        keyConcepts: ["Fourier series", "Trigonometric form", "Exponential form", "Fourier transform", "Properties (linearity, shifting, scaling, convolution)", "Parseval's theorem", "DTFT", "DFT", "FFT"],
        definitions: ["Fourier series: periodic signal as sum of harmonics", "Fourier transform: frequency domain representation"],
        theories: ["Dirichlet conditions", "Gibbs phenomenon", "Sampling theorem (Nyquist)"],
        frequentlyAsked: ["Find Fourier series coefficients", "Compute Fourier transform", "Apply properties", "Sampling theorem problems"],
      },
      {
        unitName: "Laplace Transform",
        keyConcepts: ["ROC", "Properties", "Inverse Laplace", "Transfer function", "Pole-zero plot", "Stability from pole locations", "System analysis using Laplace", "Initial and final value theorems"],
        definitions: ["Laplace transform: integral transform for continuous signals", "Transfer function: H(s) = Y(s)/X(s)", "ROC: Region of Convergence"],
        theories: ["ROC properties", "Stability criteria from ROC"],
        frequentlyAsked: ["Find Laplace transform and ROC", "Inverse Laplace using partial fractions", "System stability from transfer function", "Apply initial/final value theorem"],
      },
      {
        unitName: "Z-Transform",
        keyConcepts: ["Z-transform definition", "ROC", "Properties", "Inverse Z-transform", "Transfer function H(z)", "Pole-zero analysis", "Stability in Z-domain", "Relationship between Laplace and Z-transform"],
        definitions: ["Z-transform: discrete-time equivalent of Laplace", "ROC: region where Z-transform converges"],
        theories: ["ROC properties for Z-transform", "Stability from pole locations in z-plane"],
        frequentlyAsked: ["Find Z-transform and ROC", "Inverse Z-transform", "System stability in Z-domain", "Design digital filter"],
      },
    ],
  },

  // ─── Thermodynamics (ME) ───
  {
    subjectId: "thermo",
    subjectName: "Thermodynamics",
    units: [
      {
        unitName: "Laws of Thermodynamics",
        keyConcepts: ["Zeroth law", "First law", "Internal energy", "Enthalpy", "Specific heats", "Work done in various processes", "Second law (Kelvin-Planck, Clausius)", "Carnot cycle", "Carnot theorem", "Third law"],
        definitions: ["System: region of space under study", "Enthalpy: H = U + PV", "Entropy: measure of disorder"],
        theories: ["Carnot theorem", "Clausius inequality", "Perpetual motion machines impossibility"],
        frequentlyAsked: ["Prove Carnot theorem", "First law applied to open/closed systems", "Kelvin-Planck vs Clausius statements", "Calculate work in different processes"],
      },
      {
        unitName: "Entropy",
        keyConcepts: ["Entropy definition", "Clausius theorem", "Entropy change for ideal gas", "T-s diagram", "Entropy generation", "Irreversibility", "Availability (exergy)", "Second law efficiency"],
        definitions: ["Entropy: dS = δQ/T for reversible process", "Irreversibility: energy lost due to irreversibility", "Exergy: maximum useful work"],
        theories: ["Principle of increase of entropy", "Entropy generation minimization"],
        frequentlyAsked: ["Calculate entropy change", "T-s diagram for cycles", "Availability analysis", "Irreversibility calculation"],
      },
      {
        unitName: "Gas Power Cycles",
        keyConcepts: ["Air standard cycles", "Otto cycle", "Diesel cycle", "Dual cycle", "Brayton cycle", "Efficiency comparison", "Mean effective pressure", "Air standard assumptions"],
        definitions: ["Air standard efficiency: ideal cycle efficiency", "Compression ratio: V1/V2", "Cut-off ratio: V3/V2"],
        theories: ["Efficiency formulas for each cycle", "Effect of compression ratio on efficiency"],
        frequentlyAsked: ["Compare Otto and Diesel cycles", "Calculate efficiency of cycles", "P-V and T-s diagrams", "Brayton cycle with regeneration"],
      },
      {
        unitName: "Vapor Power Cycles",
        keyConcepts: ["Rankine cycle", "Reheat cycle", "Regenerative cycle", "Steam tables", "Dryness fraction", "Superheating", "Feed water heaters (open, closed)", "Cogeneration"],
        definitions: ["Rankine cycle: ideal cycle for steam power plants", "Dryness fraction: quality of wet steam"],
        theories: ["Methods to improve Rankine cycle efficiency", "Mollier diagram usage"],
        frequentlyAsked: ["Solve Rankine cycle problems", "Effect of reheat on efficiency", "Regenerative cycle with feed water heater", "Use steam tables"],
      },
      {
        unitName: "Refrigeration Cycles",
        keyConcepts: ["Vapor compression cycle", "COP", "Components (compressor, condenser, expansion valve, evaporator)", "P-h diagram", "Vapor absorption cycle", "Air refrigeration cycle", "Heat pumps", "Ton of refrigeration"],
        definitions: ["COP: ratio of desired effect to work input", "Ton of refrigeration: 3.517 kW", "Refrigerant: working fluid in refrigeration"],
        theories: ["Reversed Carnot cycle", "Effect of parameters on COP"],
        frequentlyAsked: ["Calculate COP for given cycle", "Compare vapor compression and absorption", "P-h diagram analysis", "Heat pump vs refrigerator"],
      },
    ],
  },

  // ─── Circuit Theory (EE) ───
  {
    subjectId: "ckt",
    subjectName: "Circuit Theory",
    units: [
      {
        unitName: "Network Theorems",
        keyConcepts: ["Kirchhoff's laws (KVL, KCL)", "Mesh analysis", "Nodal analysis", "Superposition theorem", "Thevenin's theorem", "Norton's theorem", "Maximum power transfer theorem", "Reciprocity theorem", "Millman's theorem", "Star-delta transformation"],
        definitions: ["KVL: sum of voltages around a loop is zero", "KCL: sum of currents at a node is zero", "Thevenin equivalent: Vth in series with Rth"],
        theories: ["Superposition principle for linear circuits", "Source transformation"],
        frequentlyAsked: ["Solve circuit using Thevenin/Norton", "Apply superposition theorem", "Find maximum power transfer", "Star-delta conversion problems"],
      },
      {
        unitName: "AC Circuit Analysis",
        keyConcepts: ["Phasors", "Impedance", "Admittance", "Power in AC (real, reactive, apparent)", "Power factor", "Power triangle", "Series RLC circuit", "Parallel RLC circuit", "Three-phase circuits", "Balanced/unbalanced loads"],
        definitions: ["Impedance: Z = R + jX", "Power factor: cos(φ)", "Apparent power: S = VI"],
        theories: ["Phasor analysis method", "Complex power analysis"],
        frequentlyAsked: ["Solve AC circuit problems", "Calculate power factor", "Three-phase power calculations", "Series/parallel RLC analysis"],
      },
      {
        unitName: "Resonance",
        keyConcepts: ["Series resonance", "Parallel resonance", "Quality factor", "Bandwidth", "Selectivity", "Half-power frequencies", "Resonant frequency formula"],
        definitions: ["Resonance: condition when XL = XC", "Q factor: measure of sharpness of resonance", "Bandwidth: range of frequencies around resonance"],
        theories: ["Universal resonance curve", "Relationship between Q and bandwidth"],
        frequentlyAsked: ["Calculate resonant frequency", "Find Q factor and bandwidth", "Compare series and parallel resonance", "Design resonant circuit"],
      },
      {
        unitName: "Coupled Circuits",
        keyConcepts: ["Mutual inductance", "Coefficient of coupling", "Dot convention", "Coupled coil analysis", "Ideal transformer", "T-equivalent circuit", "Energy stored in coupled circuits"],
        definitions: ["Mutual inductance: M = k√(L1L2)", "Coefficient of coupling: k = M/√(L1L2)", "Ideal transformer: k = 1, no losses"],
        theories: ["Dot convention rules", "Reflected impedance"],
        frequentlyAsked: ["Solve coupled circuit problems", "Apply dot convention", "Find mutual inductance", "Transformer equivalent circuit"],
      },
      {
        unitName: "Network Synthesis",
        keyConcepts: ["Two-port networks", "Z parameters", "Y parameters", "h parameters", "ABCD parameters", "Interconnection of two-ports", "Transfer function", "Network functions", "Hurwitz polynomial", "Positive real functions"],
        definitions: ["Two-port network: network with input and output port", "Transfer function: ratio of output to input in s-domain"],
        theories: ["Parameter interrelations", "Reciprocity and symmetry conditions"],
        frequentlyAsked: ["Find Z/Y/h parameters", "Interconnect two-port networks", "Determine if function is positive real", "ABCD parameter problems"],
      },
    ],
  },

  // ─── Strength of Materials (ME) ───
  {
    subjectId: "som",
    subjectName: "Strength of Materials",
    units: [
      {
        unitName: "Stress & Strain",
        keyConcepts: ["Normal stress", "Shear stress", "Strain", "Hooke's law", "Elastic constants (E, G, K, μ)", "Relationship between elastic constants", "Stress-strain diagram", "Poisson's ratio", "Thermal stress", "Composite bars"],
        definitions: ["Stress: force per unit area", "Strain: deformation per unit length", "Young's modulus: ratio of stress to strain"],
        theories: ["Generalized Hooke's law", "Saint-Venant's principle"],
        frequentlyAsked: ["Calculate stress/strain in composite bars", "Thermal stress problems", "Relationship between E, G, K", "Stress-strain diagram interpretation"],
      },
      {
        unitName: "Bending Moment & Shear Force",
        keyConcepts: ["Types of beams", "Types of loads", "SFD (Shear Force Diagram)", "BMD (Bending Moment Diagram)", "Point of contraflexure", "Relationships between load, SF, and BM", "Cantilever beam", "Simply supported beam", "Overhanging beam"],
        definitions: ["Shear force: algebraic sum of forces on one side", "Bending moment: algebraic sum of moments on one side", "Point of contraflexure: where BM changes sign"],
        theories: ["Relationship: dV/dx = -w, dM/dx = V"],
        frequentlyAsked: ["Draw SFD and BMD", "Find maximum BM and SF", "Locate point of contraflexure", "Beam with UDL and point loads"],
      },
      {
        unitName: "Deflection of Beams",
        keyConcepts: ["Double integration method", "Macaulay's method", "Moment area method", "Conjugate beam method", "Slope and deflection formulas", "Maximum deflection"],
        definitions: ["Deflection: vertical displacement of beam axis", "Slope: angle of beam axis with horizontal"],
        theories: ["Elastic curve equation: EI d²y/dx² = M", "Moment area theorems"],
        frequentlyAsked: ["Find deflection using double integration", "Apply Macaulay's method", "Maximum deflection of cantilever/simply supported beam"],
      },
      {
        unitName: "Torsion",
        keyConcepts: ["Torsion of circular shafts", "Torsion formula", "Power transmitted", "Hollow vs solid shafts", "Angle of twist", "Shear stress distribution", "Combined loading"],
        definitions: ["Torsion: twisting of structural member by torque", "Polar moment of inertia: J = πd⁴/32"],
        theories: ["Assumptions in torsion theory", "Torsion formula: T/J = τ/r = Gθ/L"],
        frequentlyAsked: ["Calculate shear stress in shaft", "Power transmitted by shaft", "Compare solid and hollow shafts", "Angle of twist problems"],
      },
      {
        unitName: "Columns & Struts",
        keyConcepts: ["Euler's theory", "Slenderness ratio", "Effective length", "Rankine's formula", "Short vs long columns", "Crippling load", "End conditions", "Eccentrically loaded columns"],
        definitions: ["Column: vertical member under compressive load", "Slenderness ratio: Le/r", "Crippling load: maximum load column can carry"],
        theories: ["Euler's formula: P = π²EI/Le²", "Rankine's empirical formula", "Limitations of Euler's theory"],
        frequentlyAsked: ["Calculate Euler's crippling load", "Compare Euler's and Rankine's formula", "Effect of end conditions", "Safe load on column"],
      },
    ],
  },

  // ─── Engineering Mathematics I ───
  {
    subjectId: "math1",
    subjectName: "Engineering Mathematics I",
    units: [
      {
        unitName: "Matrices & Linear Algebra",
        keyConcepts: ["Types of matrices", "Rank of matrix", "Echelon form", "Inverse of matrix", "Eigenvalues", "Eigenvectors", "Cayley-Hamilton theorem", "Diagonalization", "System of linear equations (homogeneous/non-homogeneous)"],
        definitions: ["Rank: number of non-zero rows in echelon form", "Eigenvalue: scalar λ where Av = λv", "Singular matrix: determinant is zero"],
        theories: ["Cayley-Hamilton theorem", "Conditions for consistency of equations"],
        frequentlyAsked: ["Find eigenvalues and eigenvectors", "Verify Cayley-Hamilton theorem", "Solve system of equations", "Find rank of matrix"],
      },
      {
        unitName: "Differential Calculus",
        keyConcepts: ["Successive differentiation", "Leibniz theorem", "Taylor's series", "Maclaurin's series", "Partial differentiation", "Euler's theorem for homogeneous functions", "Maxima and minima", "Lagrange multipliers"],
        definitions: ["Partial derivative: derivative with respect to one variable keeping others constant"],
        theories: ["Taylor's theorem", "Euler's theorem on homogeneous functions"],
        frequentlyAsked: ["Find nth derivative", "Expand using Taylor/Maclaurin series", "Find maxima/minima of two-variable functions", "Apply Euler's theorem"],
      },
      {
        unitName: "Integral Calculus",
        keyConcepts: ["Reduction formulas", "Beta and Gamma functions", "Double integrals", "Triple integrals", "Change of order of integration", "Applications (area, volume, surface area)"],
        definitions: ["Beta function: B(m,n) = ∫₀¹ x^(m-1)(1-x)^(n-1)dx", "Gamma function: Γ(n) = ∫₀^∞ x^(n-1)e^(-x)dx"],
        theories: ["Relationship: B(m,n) = Γ(m)Γ(n)/Γ(m+n)", "Duplication formula"],
        frequentlyAsked: ["Evaluate using Beta/Gamma functions", "Change order of integration", "Find area/volume using double/triple integrals"],
      },
      {
        unitName: "Sequences & Series",
        keyConcepts: ["Convergence tests", "Ratio test", "Root test", "Comparison test", "Integral test", "Alternating series test", "Absolute convergence", "Power series", "Radius of convergence"],
        definitions: ["Convergent series: sum approaches finite limit", "Absolute convergence: series of absolute values converges"],
        theories: ["Leibniz test for alternating series", "Ratio test conditions"],
        frequentlyAsked: ["Test convergence of given series", "Find radius of convergence", "Apply ratio/root test"],
      },
      {
        unitName: "Vector Calculus",
        keyConcepts: ["Gradient", "Divergence", "Curl", "Line integrals", "Surface integrals", "Volume integrals", "Green's theorem", "Stokes' theorem", "Gauss divergence theorem", "Scalar and vector fields"],
        definitions: ["Gradient: direction of maximum rate of change", "Divergence: outward flux per unit volume", "Curl: circulation per unit area"],
        theories: ["Green's theorem", "Stokes' theorem", "Divergence theorem"],
        frequentlyAsked: ["Find gradient/divergence/curl", "Verify Green's/Stokes' theorem", "Evaluate line/surface integrals"],
      },
    ],
  },
];

/**
 * Get knowledge base for a specific subject by ID.
 */
export function getSubjectKnowledge(subjectId: string): SubjectKnowledge | undefined {
  return subjectKnowledgeBase.find(sk => sk.subjectId === subjectId);
}

/**
 * Get knowledge base by subject name (fuzzy match).
 */
export function getSubjectKnowledgeByName(subjectName: string): SubjectKnowledge | undefined {
  const lower = subjectName.toLowerCase();
  return subjectKnowledgeBase.find(sk =>
    sk.subjectName.toLowerCase().includes(lower) ||
    lower.includes(sk.subjectName.toLowerCase()) ||
    // Common abbreviation matching
    (lower.includes("dbms") && sk.subjectId === "dbms") ||
    (lower.includes("operating system") && sk.subjectId === "os") ||
    (lower.includes("computer network") && sk.subjectId === "cn") ||
    (lower.includes("data structure") && sk.subjectId === "dsa") ||
    (lower.includes("software engineering") && sk.subjectId === "se") ||
    (lower.includes("compiler") && sk.subjectId === "cd") ||
    (lower.includes("artificial intelligence") && sk.subjectId === "ai") ||
    (lower.includes("digital logic") && sk.subjectId === "dld") ||
    (lower.includes("theory of computation") && sk.subjectId === "toc") ||
    (lower.includes("computer organization") && sk.subjectId === "coa") ||
    (lower.includes("signal") && sk.subjectId === "ss") ||
    (lower.includes("thermodynamic") && sk.subjectId === "thermo") ||
    (lower.includes("circuit theory") && sk.subjectId === "ckt") ||
    (lower.includes("strength of material") && sk.subjectId === "som") ||
    (lower.includes("mathematics i") && sk.subjectId === "math1") ||
    (lower.includes("engineering math") && sk.subjectId === "math1")
  );
}

/**
 * Build a compact knowledge context string for AI prompt supplementation.
 * Prioritizes uploaded notes but supplements with internal knowledge.
 */
export function buildKnowledgeContext(subjectName: string): string {
  const knowledge = getSubjectKnowledgeByName(subjectName);
  if (!knowledge) return "";

  const lines: string[] = [`INTERNAL KNOWLEDGE BASE for ${knowledge.subjectName}:`];
  for (const unit of knowledge.units) {
    lines.push(`\n## ${unit.unitName}`);
    lines.push(`Key Concepts: ${unit.keyConcepts.join(", ")}`);
    lines.push(`Definitions: ${unit.definitions.join("; ")}`);
    lines.push(`Frequently Asked: ${unit.frequentlyAsked.join("; ")}`);
  }
  return lines.join("\n");
}
