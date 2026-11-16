// Editorial source: master brief, original resume, and the supplied live portfolio reference.
export const profile = {
  name: "Nikhil Mohan",
  headline:
    "Computer Science at Waterloo. Building software, AI tools, and interactive experiences.",
  intro:
    "I’m Nikhil, a Computer Science co-op student at the University of Waterloo. I’ve built security automation at LG Energy Solution, worked on multiplayer software at Paraverse Studios, and developed projects spanning AI workflows, developer tools, and computer vision.",
  contact:
    "Have an internship opportunity or an interesting project? Get in touch.",
  email: "n24mohan@uwaterloo.ca",
  github: "https://github.com/Nikhil-Mohan-01",
  linkedin: "https://www.linkedin.com/in/nikhil-mohan-7787372a6/",
  resume: "resume/Nikhil_Mohan_Resume.pdf",
} as const;

export interface Project {
  slug: string;
  name: string;
  category: string;
  date?: string;
  summary: string;
  built: string;
  approach?: string;
  stack: readonly string[];
  note?: string;
  link?: { label: string; url: string };
}

export const projects: readonly Project[] = [
  {
    slug: "protomind",
    name: "ProtoMind",
    category: "AI / developer tools",
    date: "March 2026",
    summary:
      "Turn natural-language hardware specifications into CAD models, Arduino firmware, and structured component data.",
    built:
      "Built an interface that connects natural-language hardware requirements to AI workflows for generating engineering artifacts.",
    approach:
      "Parallel LangGraph workflows validate schemas, check geometry, and regenerate invalid CAD outputs with up to three retries. FastAPI connects the workflows to the interface, and Docker packages reproducible backend environments for artifact generation.",
    stack: ["Python", "LangGraph", "FastAPI", "Docker"],
    link: {
      label: "GitHub repository",
      url: "https://github.com/Nikhil-Mohan-01/ProtoMind",
    },
  },
  {
    slug: "smart-model-router",
    name: "Smart Model Router",
    category: "Developer tools / AI",
    date: "2025",
    summary:
      "A published VS Code extension for task-aware AI model selection, cost estimates, and budget-aware recommendations.",
    built:
      "Built a VS Code extension that reduces manual model switching with configurable providers, token and cost estimates, usage tracking, and user-controlled model preferences.",
    approach:
      "Integrated streaming responses from multiple model APIs into the editor workflow and used secure credential storage for provider keys.",
    stack: ["TypeScript", "VS Code API", "REST APIs"],
    note: "20+ installs without marketing, as reported in my resume.",
    link: {
      label: "VS Code Marketplace",
      url: "https://marketplace.visualstudio.com/items?itemName=NikhilMohan.smart-model-router",
    },
  },
  {
    slug: "watopoly",
    name: "Watopoly",
    category: "C++ / software design",
    date: "November 2026",
    summary:
      "A C++20 Monopoly-style game built in a team of three, with a 40-square board, 2–6 players, and persistent game state.",
    built:
      "Implemented gameplay supporting trades, auctions, mortgages, bankruptcy, and save/load state.",
    approach:
      "A polymorphic hierarchy models properties, gyms, residences, and event squares. The architecture work included UML and resilience-to-change analysis, with Observer, Decorator, and Strategy evaluated to isolate changing rules. Fixed dice rolls and seeded randomness provide deterministic checks.",
    stack: ["C++20", "Object-oriented programming", "Design patterns", "UML"],
    note: "Course project · Source private",
  },
  {
    slug: "cube-hero-odyssey",
    name: "Cube Hero Odyssey",
    category: "Games / collaborative work",
    summary:
      "A 3D hack-and-slash roguelite featuring a caped hero, monster combat, and varied character builds.",
    built: "Contributed to a collaborative game project that shipped on Steam.",
    stack: ["Unity3D", "C#", "JavaScript", "Blender", "Git"],
    link: {
      label: "View on Steam",
      url: "https://store.steampowered.com/app/2954730/Cube_Hero_Odyssey/",
    },
  },
  {
    slug: "activity-center",
    name: "Activity Center",
    category: "Mobile",
    summary:
      "A hangout-planning app for discovering restaurants, attractions, and activities nearby.",
    built:
      "Built a mobile discovery experience with a swipe interface for exploring local places and activities.",
    stack: ["React Native", "Expo", "Firebase", "Google Places API"],
    link: {
      label: "GitHub repository",
      url: "https://github.com/Nikhil-Mohan-01/Activity-Center",
    },
  },
  {
    slug: "autonomous-turret",
    name: "Autonomous Turret",
    category: "Computer vision / hardware",
    summary:
      "A pose-estimation prototype that detects body and face positions in real time.",
    built:
      "Built a computer-vision prototype using MediaPipe and DeepFace for body and face position detection.",
    stack: ["OpenCV", "MediaPipe", "DeepFace", "Python", "C/C++", "Git"],
    link: {
      label: "Watch the vision prototype",
      url: "https://youtu.be/HA06y33xMFA",
    },
  },
  {
    slug: "online-speed-card-game",
    name: "Online Speed Card Game",
    category: "Full stack / real time",
    summary:
      "A real-time multiplayer card game with server-authoritative state and synchronized play.",
    built:
      "Built a multiplayer card-game application with synchronized play for connected users.",
    approach:
      "Socket.IO distributes game updates while the server maintains authoritative state.",
    stack: [
      "Node.js",
      "Express",
      "Socket.IO",
      "React",
      "Vite",
      "Tailwind CSS",
      "Framer Motion",
      "Docker",
      "Google Cloud",
    ],
  },
  {
    slug: "original-portfolio",
    name: "Original Portfolio Website",
    category: "Web / earlier work",
    summary:
      "An earlier personal portfolio with a chatbot for questions about my work and experience.",
    built:
      "Built a portfolio to present projects and experience, with an interactive chatbot for visitor questions.",
    stack: ["ASP.NET", "HTML/SASS", "JavaScript", "C#"],
  },
];

interface Role {
  company: string;
  title: string;
  dates: string;
  location: string;
  summary?: string;
  highlights: readonly string[];
}

export const experience: readonly Role[] = [
  {
    company: "LG Energy Solution",
    title: "Software Engineer Intern (Cybersecurity)",
    dates: "May–August 2026",
    location: "Windsor, Ontario",
    highlights: [
      "Built a Python invoice reconciliation pipeline that reduced a recurring 6+ hour process to 1.78 seconds, automating PDF extraction, field validation, and discrepancy detection.",
      "Designed and deployed a centralized auditing service with FastAPI, SQLite, Debian, and Caddy, securing scan uploads with HTTPS/TLS and access controls while retaining findings for return-to-service reviews.",
      "Engineered cross-platform security scanners with Python, PowerShell, and Bash for Windows, macOS, and Linux, combining SHA-256 hashing with auditable reports.",
    ],
  },
  {
    company: "Paraverse Studios",
    title: "Software Engineering Intern",
    dates: "January–April 2026",
    location: "Remote / Toronto, Ontario",
    highlights: [
      "Shipped features for a multiplayer application reaching 7,000+ players, collaborating across engineering and design on integration and gameplay improvements.",
      "Built Node.js and WebSocket backend services to synchronize real-time player interactions and maintain consistent game state.",
      "Implemented authentication, matchmaking, and session-state management through collaborative Git-based development.",
    ],
  },
  {
    company: "Code Ninjas",
    title: "Code Sensei (Instructor)",
    dates: "July 2023–August 2025",
    location: "Windsor, Ontario",
    summary: "Coding instruction and mentorship.",
    highlights: [],
  },
];

export const education = {
  university: "University of Waterloo",
  degree: "Honours Computer Science (Co-op)",
  dates: "2025–Present",
  location: "Waterloo, Ontario",
  gpa: "3.9",
  courses: [
    "Data Abstraction",
    "Object-Oriented Programming",
    "Discrete Mathematics",
    "Linear Algebra",
    "Calculus I & II",
    "Probability",
  ],
  shad: "National enrichment program focused on innovation, teamwork, and rapid prototyping.",
} as const;

export const skills = [
  {
    group: "Languages",
    items: [
      "Python",
      "C++",
      "C",
      "Java",
      "JavaScript",
      "TypeScript",
      "C#",
      "Bash",
      "PowerShell",
    ],
  },
  {
    group: "Backend & data",
    items: [
      "FastAPI",
      "REST APIs",
      "Node.js",
      "Express",
      "WebSockets",
      "PostgreSQL",
      "SQLite",
      "MongoDB",
      "Firebase",
      ".NET",
    ],
  },
  {
    group: "AI & computer vision",
    items: [
      "LangGraph",
      "LangChain",
      "TensorFlow",
      "PyTorch",
      "OpenCV",
      "MediaPipe",
    ],
  },
  {
    group: "Infrastructure & tools",
    items: [
      "Git/GitHub",
      "Docker",
      "Linux",
      "Debian",
      "Caddy",
      "Azure",
      "GCP",
      "Playwright",
      "Power BI",
      "Claude Code",
      "Codex",
      "Valgrind",
      "GCC",
      "Hugging Face",
    ],
  },
] as const;
