import type { Portfolio } from "@/types/portfolio";

/**
 * SINGLE SOURCE OF TRUTH for portfolio content.
 * Everything below comes from Sanjeev's CV (public/resume/Sanjeev_Kumar_Pandit_CV.pdf).
 * To add a project, skill or achievement, edit this file only — no component changes needed.
 */
export const portfolio: Portfolio = {
  profile: {
    name: "Sanjeev Kumar Pandit",
    firstName: "Sanjeev",
    initials: "SP",
    role: "Full Stack Developer",
    roleAlternates: ["Software Developer", "AI Integration", "Data Analytics"],
    tagline: "Full-stack web apps, REST APIs and data-driven insights.",
    location: "Dhanbad, Jharkhand, India",
    summary:
      "Results-driven Computer Science undergraduate with hands-on experience in full-stack web development using JavaScript, Node.js, and React, and in data analytics using Python and SQL. Skilled in building scalable web applications, developing RESTful APIs, integrating SQL/NoSQL databases, and deriving insights from data through visualization. Experienced in incorporating AI-powered features into applications, with knowledge of cloud deployment and modern development practices.",
    shortBio:
      "CS undergraduate building full-stack apps, REST APIs and data dashboards — with a taste for AI-powered features.",
    avatar: "/images/Sanjeev Photo.jpeg",
    email: "sanjeevkupan18@gmail.com",
    website: "https://sanjucodingportfolio.vercel.app/",
  },

  socialLinks: [
    { id: "github", label: "GitHub", url: "https://github.com/sanjeevkupan18" },
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/sanjeevkupan18/" },
    { id: "email", label: "Email", url: "mailto:sanjeevkupan18@gmail.com" },
    { id: "website", label: "Website", url: "https://sanjucodingportfolio.vercel.app/" },
  ],

  // TODO: the CV does not list 10th / 12th details. Add them here (and to `timeline`) if you want them shown.
  education: [
    {
      id: "btech",
      institution: "Bengal College of Engineering and Technology",
      degree: "B.Tech in Computer Science and Technology",
      location: "Durgapur, West Bengal",
      start: "2023",
      end: "2027",
      grade: "CGPA 8.8 / 10.0 (ongoing)",
    },
  ],

  experience: [
    {
      id: "apexplanet",
      title: "Web Development Intern",
      company: "ApexPlanet Software Pvt. Ltd.",
      type: "Internship",
      location: "Remote",
      start: "Sep 2025",
      end: "Oct 2025",
      bullets: [
        "Built a fully responsive e-commerce website using HTML5, CSS3, and JavaScript with product listings and a dynamic checkout interface.",
        "Designed a futuristic portfolio website with animated UI components and mobile-first responsive layouts; delivered all five tasks on time with production-ready code.",
      ],
    },
  ],

  timeline: [
    { id: "t-2023", year: "2023", title: "B.Tech begins", subtitle: "Computer Science and Technology · Bengal College of Engineering and Technology", kind: "education" },
    { id: "t-2024", year: "2024", title: "Google GenAI Study Jam – Cohort 2", subtitle: "Generative AI fundamentals, Vertex AI, prompt engineering", kind: "certification" },
    { id: "t-2025", year: "Sep–Oct 2025", title: "Web Development Intern", subtitle: "ApexPlanet Software Pvt. Ltd. · Remote", kind: "experience" },
    { id: "t-2026", year: "2026", title: "GATE 2026 qualified", subtitle: "AIR 21041 in Computer Science, first attempt", kind: "achievement" },
    { id: "t-2027", year: "2027", title: "B.Tech graduation (expected)", subtitle: "CGPA 8.8 / 10.0 so far", kind: "education" },
  ],

  // Derived from facts in the CV (internship, projects, mentoring, README work).
  philosophy: [
    { title: "Production-ready by default", body: "Responsive, mobile-first layouts and clean code — the bar I held myself to while delivering all five internship tasks on time." },
    { title: "Learn by building", body: "Projects like GateGuruAI and DailyFlow turn concepts — speech APIs, JWT auth, analytics — into working products." },
    { title: "Let data tell the story", body: "Cleaning data in SQL and building Tableau dashboards turns raw numbers into findings people can act on." },
    { title: "Share what I learn", body: "Mentoring 10+ junior students in HTML, CSS and JavaScript, and writing detailed READMEs for open-source projects." },
  ],

  currentFocus: [
    "Full-stack (MERN) products with AI-powered features",
    "Data analytics with Python, SQL and Tableau",
    "Data structures & algorithms — 50+ problems solved — and GATE-level CS fundamentals",
    "Contributing to open-source repositories on GitHub",
    "Completing B.Tech in Computer Science (2023–2027)",
  ],

  skillCategories: [
    { id: "languages", label: "Languages", blurb: "Core programming languages" },
    { id: "frontend", label: "Frontend", blurb: "Interfaces, styling and motion" },
    { id: "backend", label: "Backend", blurb: "Servers, APIs and auth" },
    { id: "data", label: "Data Analytics", blurb: "Analysis and visualization" },
    { id: "databases", label: "Databases & Cloud", blurb: "Storage and hosting" },
    { id: "tools", label: "Tools & Concepts", blurb: "Workflow and engineering fundamentals" },
    { id: "ai", label: "AI / Integration", blurb: "AI-powered features" },
  ],

  skills: [
    // Languages
    { id: "python", name: "Python", category: "languages", iconSlug: "python", description: "General-purpose language used here for data analysis." },
    { id: "java", name: "Java", category: "languages", iconSlug: "openjdk", description: "Object-oriented programming language." },
    { id: "c", name: "C", category: "languages", iconSlug: "c", description: "Low-level language for fundamentals and algorithms." },
    { id: "javascript", name: "JavaScript (ES6+)", category: "languages", iconSlug: "javascript", aliases: ["JavaScript", "JS"], description: "The language of the web — used across frontend and Node.js backends." },
    // Frontend
    { id: "html5", name: "HTML5", category: "frontend", iconSlug: "html5", aliases: ["HTML"], description: "Semantic markup for the web." },
    { id: "css3", name: "CSS3", category: "frontend", iconSlug: "css", aliases: ["CSS"], description: "Styling and responsive layout." },
    { id: "react", name: "React.js", category: "frontend", iconSlug: "react", aliases: ["React", "ReactJS"], description: "Component-based UI library." },
    { id: "tailwind", name: "Tailwind CSS", category: "frontend", iconSlug: "tailwindcss", aliases: ["Tailwind"], description: "Utility-first CSS framework." },
    { id: "gsap", name: "GSAP", category: "frontend", iconSlug: "gsap", description: "JavaScript animation library." },
    { id: "zustand", name: "Zustand", category: "frontend", fallbackIcon: "Boxes", description: "Lightweight React state management." },
    // Backend
    { id: "node", name: "Node.js", category: "backend", iconSlug: "nodedotjs", aliases: ["Node", "NodeJS"], description: "JavaScript runtime for servers." },
    { id: "express", name: "Express.js", category: "backend", iconSlug: "express", aliases: ["Express"], description: "Minimal web framework for Node.js." },
    { id: "rest", name: "REST API Design", category: "backend", fallbackIcon: "Network", aliases: ["REST APIs", "RESTful APIs", "REST API", "REST"], description: "Designing resource-oriented HTTP APIs." },
    { id: "jwt", name: "JWT Authentication", category: "backend", iconSlug: "jsonwebtokens", aliases: ["JWT", "JSON Web Token"], description: "Token-based authentication." },
    // Data analytics
    { id: "pandas", name: "Pandas", category: "data", iconSlug: "pandas", description: "Data manipulation and analysis in Python." },
    { id: "numpy", name: "NumPy", category: "data", iconSlug: "numpy", description: "Numerical computing in Python." },
    { id: "matplotlib", name: "Matplotlib", category: "data", fallbackIcon: "ChartLine", description: "Plotting library for Python." },
    { id: "seaborn", name: "Seaborn", category: "data", fallbackIcon: "ChartScatter", description: "Statistical data visualization on top of Matplotlib." },
    { id: "sql", name: "SQL", category: "data", fallbackIcon: "Database", description: "Querying and cleaning relational data." },
    { id: "tableau", name: "Tableau", category: "data", fallbackIcon: "ChartBar", description: "Interactive dashboards and visual storytelling." },
    // Databases & cloud
    { id: "mongodb", name: "MongoDB", category: "databases", iconSlug: "mongodb", description: "Document-oriented NoSQL database." },
    { id: "mysql", name: "MySQL", category: "databases", iconSlug: "mysql", description: "Relational SQL database." },
    { id: "firestore", name: "Firebase Firestore", category: "databases", iconSlug: "firebase", description: "Cloud-hosted NoSQL document database." },
    { id: "firebase", name: "Firebase", category: "databases", iconSlug: "firebase", description: "Google's app development platform." },
    { id: "gcp", name: "Google Cloud Platform (GCP)", category: "databases", iconSlug: "googlecloud", aliases: ["GCP", "Google Cloud"], description: "Cloud infrastructure and services." },
    // Tools & concepts
    { id: "git", name: "Git", category: "tools", iconSlug: "git", description: "Distributed version control." },
    { id: "github", name: "GitHub", category: "tools", iconSlug: "github", description: "Code hosting, collaboration and open source." },
    { id: "vscode", name: "VS Code", category: "tools", fallbackIcon: "Code", aliases: ["Visual Studio Code"], description: "Primary code editor." },
    { id: "postman", name: "Postman", category: "tools", iconSlug: "postman", description: "API testing and debugging." },
    { id: "oop", name: "OOP", category: "tools", fallbackIcon: "Boxes", aliases: ["Object-Oriented Programming"], description: "Object-oriented programming principles." },
    { id: "mvc", name: "MVC Architecture", category: "tools", fallbackIcon: "Workflow", aliases: ["MVC"], description: "Model–View–Controller application structure." },
    { id: "dsa", name: "Data Structures & Algorithms", category: "tools", fallbackIcon: "Binary", aliases: ["DSA"], description: "Arrays, linked lists, trees and dynamic programming — 50+ problems solved on LeetCode and GeeksForGeeks." },
    // AI / integration
    { id: "genai", name: "Generative AI Fundamentals", category: "ai", fallbackIcon: "Sparkles", aliases: ["GenAI", "Generative AI"], description: "Covered in the Google GenAI Study Jam (Cohort 2)." },
    { id: "vertex", name: "Vertex AI", category: "ai", fallbackIcon: "Cpu", description: "Google Cloud's ML platform — introduced in the GenAI Study Jam." },
    { id: "prompt", name: "Prompt Engineering", category: "ai", fallbackIcon: "MessageSquareText", description: "Crafting effective prompts for LLMs." },
    { id: "speech", name: "Web Speech API", category: "ai", fallbackIcon: "Mic", description: "Browser speech recognition and text-to-speech." },
    { id: "ai-integration", name: "AI Feature Integration", category: "ai", fallbackIcon: "Brain", aliases: ["AI-powered features"], description: "Adding AI-powered features to web applications." },
  ],

  // TODO: confirm each project's `status` (CV does not state it) and add screenshots to /public/projects/.
  projects: [
    {
      id: "gateguruai",
      name: "GateGuruAI",
      tagline: "AI-powered voice assistant for GATE aspirants",
      description:
        "An AI-powered voice assistant built with the MERN stack that guides GATE aspirants with syllabus, weightage, and cutoff trends via spoken commands.",
      status: "Completed",
      featured: true,
      stackLabel: "MERN Stack",
      tech: ["MongoDB", "Express.js", "React.js", "Node.js", "Web Speech API", "REST APIs"],
      features: [
        "Spoken commands for syllabus, weightage and cutoff-trend queries",
        "Real-time speech recognition and text-to-speech via the Web Speech API for hands-free interaction",
        "RESTful APIs with Express.js and MongoDB that process voice queries",
        "Low-latency AI responses",
      ],
      problem: "GATE aspirants need quick answers about syllabus, weightage and cutoff trends.",
      solution: "A hands-free voice assistant: ask out loud, get a spoken answer back.",
      architecture: [
        "Browser — Web Speech API turns speech into text and reads answers back (TTS)",
        "React.js client sends the query to the REST API",
        "Express.js + Node.js API processes the voice query",
        "MongoDB stores the data behind the responses",
      ],
      github: "https://github.com/sanjeevkupan18/GateGuruAI-Voice_Assistant",
      live: "https://gate-guru-ai-voice-assistant.vercel.app/",
      cover: { from: "#6366f1", to: "#06b6d4", icon: "Mic" },
    },
    {
      id: "dailyflow",
      name: "DailyFlow",
      tagline: "Full-stack productivity tracker with analytics",
      description:
        "A full-stack productivity tracker with task categories, priorities, reordering, and JWT-based authentication, plus an interactive analytics system.",
      status: "Completed",
      featured: true,
      tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "Zustand", "JWT Authentication"],
      features: [
        "Task categories, priorities and drag-style reordering",
        "JWT-based authentication",
        "Performance scoring and streak tracking",
        "Charts and heatmaps for progress over time",
        "Built-in Pomodoro timer",
      ],
      solution:
        "Tasks, priorities and a focus timer in one place, with analytics that show how consistently you are performing.",
      architecture: [
        "Client — React.js + Tailwind CSS, state managed with Zustand",
        "API — Node.js + Express.js with JWT-based authentication",
        "Database — MongoDB",
      ],
      github: "https://github.com/sanjeevkupan18/DailyFlow",
      live: "https://daily-flow-tau.vercel.app/login",
      cover: { from: "#10b981", to: "#3b82f6", icon: "ListChecks" },
    },
    {
      id: "student-depression-analysis",
      name: "Student Depression Dataset Analysis",
      tagline: "SQL cleaning + Tableau dashboard on student well-being",
      description:
        "Cleaned and standardized a student depression dataset in MySQL and explored the factors behind it in an interactive Tableau dashboard.",
      status: "Completed",
      featured: false,
      tech: ["MySQL", "SQL", "Tableau", "Data Visualization"],
      features: [
        "Cleaned and standardized the dataset in MySQL, creating age groups and preparing it for analysis",
        "Interactive Tableau dashboard: academic pressure, financial stress, sleep and study habits vs. depression",
        "Presented key mental-health patterns through visual storytelling, identifying major well-being factors",
      ],
      problem: "Understand which factors are associated with depression among students.",
      solution:
        "A cleaned MySQL dataset feeding an interactive Tableau dashboard that makes the patterns easy to explore.",
      architecture: [
        "Raw dataset → cleaning & standardization in MySQL (age groups, prepared columns)",
        "Prepared data → interactive Tableau dashboard",
      ],
      github: "https://github.com/sanjeevkupan18/Student-Depression-Dataset-Analysis",
      cover: { from: "#f97316", to: "#ec4899", icon: "ChartBar" },
    },
  ],

  achievements: [
    { id: "gate", title: "GATE 2026 Qualified", detail: "Secured AIR 21041 in Computer Science on the first attempt." },
    { id: "hackathon", title: "College Hackathon Winner", detail: "Secured 1st place among 30+ competing teams." },
    { id: "debug", title: "Operation Debug Winner", detail: "Ranked 1st in an inter-college debugging competition testing problem-solving and code optimization." },
    { id: "robonixx", title: "Organizer, Robonixx", detail: "Led event planning for the annual robotics club fest, coordinating 12 volunteers and 200+ participants." },
  ],

  extraCurricular: [
    "Solved 50+ algorithmic problems on LeetCode and GeeksForGeeks; strong grasp of arrays, linked lists, trees, and dynamic programming.",
    "Contributing to open-source repositories on GitHub; authored detailed README documentation improving project discoverability.",
    "Mentored 10+ junior students in HTML, CSS, and JavaScript during college coding bootcamp sessions.",
  ],

  certifications: [
    {
      id: "genai-study-jam",
      title: "Google GenAI Study Jam – Cohort 2",
      issuer: "Google",
      year: "2024",
      detail: "Generative AI fundamentals, Vertex AI, prompt engineering",
    },
  ],

  resume: {
    file: "/resume/Sanjeev_Kumar_Pandit_CV.pdf",
    downloadName: "Sanjeev_Kumar_Pandit_CV.pdf",
  },

  contact: {
    email: "sanjeevkupan18@gmail.com",
    location: "Dhanbad, Jharkhand, India",
    responseNote: "Messages are saved to a private inbox that only Sanjeev can read.",
  },

  desktopIcons: [
    { id: "d-projects", label: "Projects", appId: "projects", icon: "FolderOpen" },
    { id: "d-resume", label: "Resume.pdf", appId: "resume", icon: "FileText" },
    { id: "d-about", label: "About Me", appId: "about", icon: "User" },
  ],
};

export const siteConfig = {
  name: portfolio.profile.name,
  title: `${portfolio.profile.name} — ${portfolio.profile.role}`,
  description:
    "Interactive macOS-style portfolio of Sanjeev Kumar Pandit — full-stack developer (MERN), data analytics and AI integration.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sanjucodingportfolio.vercel.app",
  version: "1.0.0",
  techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Motion", "MongoDB"],
};
