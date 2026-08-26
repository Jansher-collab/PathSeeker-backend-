import { mockCareers } from '../seed/seedData';

export interface ResumeRoastResult {
  atsScore: number;
  roastVerdict: string;
  brutalRoastQuotes: string[];
  missingKeywords: string[];
  phrasingFlaws: Array<{
    flaw: string;
    originalExample: string;
    suggestedFix: string;
  }>;
  actionMetricsSuggestions: string[];
  overallSummary: string;
}

export interface MockInterviewQuestion {
  id: number;
  question: string;
  category: 'Technical' | 'Behavioral' | 'Scenario / Problem Solving';
  contextTip: string;
}

export interface InterviewEvaluationResult {
  score: number; // 0 - 100
  clarityRating: string;
  strengths: string[];
  weaknesses: string[];
  starMethodReview: string;
  modelAnswer: string;
}

export const aiService = {
  // 1. AI Resume Roaster & Brutal Roast & Fix Engine
  analyzeAndRoastResume: (resumeText: string, targetRole: string = 'Full Stack Developer'): ResumeRoastResult => {
    const textLower = (resumeText || '').toLowerCase();
    const wordCount = (resumeText || '').split(/\s+/).filter(Boolean).length;

    // Detect common missing keywords based on role
    const keywordsByRole: Record<string, string[]> = {
      'Full Stack Developer': ['React', 'Next.js', 'Node.js', 'TypeScript', 'Docker', 'REST API', 'CI/CD', 'Jest', 'PostgreSQL', 'GraphQL', 'AWS'],
      'AI & Machine Learning Engineer': ['PyTorch', 'TensorFlow', 'LLMs', 'RAG', 'Vector Embeddings', 'Python', 'MLOps', 'Transformers', 'Fine-tuning', 'CUDA'],
      'Cloud Solutions Architect': ['AWS', 'GCP', 'Kubernetes', 'Terraform', 'Microservices', 'IAM', 'VPC', 'Disaster Recovery', 'Cost Optimization', 'Kafka'],
      'Product Designer (UI/UX)': ['Figma', 'Design Systems', 'User Research', 'Wireframing', 'Prototyping', 'Accessibility (WCAG)', 'Usability Testing', 'Design Tokens'],
      'Cybersecurity Analyst': ['SIEM', 'Threat Intelligence', 'Penetration Testing', 'SOC', 'Incident Response', 'OWASP', 'NIST Framework', 'Wireshark', 'ISO 27001'],
      'Data Scientist': ['Python', 'SQL', 'Pandas', 'Statistical Modeling', 'Tableau', 'Hypothesis Testing', 'Data Pipelines', 'Feature Engineering', 'Scikit-learn'],
    };

    const targetKeywords = keywordsByRole[targetRole] || keywordsByRole['Full Stack Developer'];
    const matchedKeywords = targetKeywords.filter((k) => textLower.includes(k.toLowerCase()));
    const missingKeywords = targetKeywords.filter((k) => !textLower.includes(k.toLowerCase()));

    // Keyword match calculation
    const keywordMatchPct = Math.min(100, Math.round((matchedKeywords.length / targetKeywords.length) * 100));

    // Metric density check (% of numbers / quantifiable results)
    const numbersMatch = (resumeText || '').match(/\b\d+(\.\d+)?%?\b/g) || [];
    const metricScore = Math.min(25, numbersMatch.length * 4);

    // ATS Score calculation
    let atsScore = Math.round(keywordMatchPct * 0.55 + metricScore + (wordCount > 150 && wordCount < 900 ? 20 : 10));
    atsScore = Math.max(38, Math.min(96, atsScore));

    // Dynamic brutal roasts tailored to detected patterns
    const brutalRoastQuotes: string[] = [];
    if (textLower.includes('passionate') || textLower.includes('hardworking') || textLower.includes('go-getter')) {
      brutalRoastQuotes.push("You described yourself as 'passionate and hardworking'—the recruiter yawned so hard they fell off their Herman Miller chair.");
    }
    if (numbersMatch.length < 3) {
      brutalRoastQuotes.push("Zero quantifiable metrics found. Did your code actually improve latency by 40%, or did you just click 'Merge Pull Request' and pray?");
    }
    if (wordCount < 120) {
      brutalRoastQuotes.push("This resume is shorter than a junior dev's git commit message. Give us actual project architecture details!");
    } else {
      brutalRoastQuotes.push("Your experience section reads like a grocery list of responsibilities rather than a trophy room of engineering impact.");
    }
    brutalRoastQuotes.push(`You want to be a ${targetRole}, yet you missed critical industry standard buzzwords like ${missingKeywords.slice(0, 3).join(', ')}.`);

    return {
      atsScore,
      roastVerdict: atsScore > 80 ? '🔥 High Caliber, Needs Strategic Polish' : atsScore > 60 ? '⚡ Mediocre: Drowning in Vague Buzzwords' : '💀 Brutal Hazard: Immediate ATS Bin Food',
      brutalRoastQuotes,
      missingKeywords,
      phrasingFlaws: [
        {
          flaw: 'Passive Duty Stating instead of Impact-driven Achievement',
          originalExample: 'Responsible for building REST APIs and frontend views.',
          suggestedFix: `Architected and deployed 14 high-throughput REST APIs and Next.js micro-frontends, reducing page latency by 34% for 50k+ monthly active users.`,
        },
        {
          flaw: 'Weak Action Verbs & Missing Tech Stack Context',
          originalExample: 'Worked with team members to resolve bugs.',
          suggestedFix: `Spearheaded daily agile triage resolving 45+ critical production bottlenecks, reducing CI/CD pipeline build failures by 60%.`,
        },
        {
          flaw: 'Vague Skill Listings Without Practical Validation',
          originalExample: 'Proficient in JavaScript, Python, React, and MongoDB.',
          suggestedFix: `Engineered scalable full-stack applications utilizing TypeScript, React, and MongoDB with indexing strategies that cut query execution times by 48%.`,
        },
      ],
      actionMetricsSuggestions: [
        'Add the $ revenue impact or operational cost savings from your projects.',
        'Specify throughput metrics (e.g., "Handled 10,000 requests/sec with 99.9% uptime").',
        'State test coverage benchmarks (e.g., "Increased unit and integration test coverage from 45% to 88%").',
        'Quantify scale (e.g., "Served 100k+ active users across 12 regions").',
      ],
      overallSummary: `For the target career of ${targetRole}, your resume demonstrates base competence but severely lacks quantifiable metrics, strong STAR-format bullet points, and modern ecosystem keywords. Implementing the suggested before-and-after rewrites will catapult your ATS ranking significantly.`,
    };
  },

  // 2. Generate 3-Question Tailored AI Mock Interview
  generateMockInterviewQuestions: (targetRole: string = 'Full Stack Developer'): MockInterviewQuestion[] => {
    const questionBanks: Record<string, MockInterviewQuestion[]> = {
      'Full Stack Developer': [
        {
          id: 1,
          question: 'How do you handle state synchronization, optimistic UI updates, and cache invalidation in a large-scale React and Next.js application?',
          category: 'Technical',
          contextTip: 'Mention tools like React Query, SWR, Server Actions, or Zustand, and address rollback on network failure.',
        },
        {
          id: 2,
          question: 'Describe a situation where a database query or backend endpoint caused a severe bottleneck in production. How did you diagnose and remediate it?',
          category: 'Scenario / Problem Solving',
          contextTip: 'Use the STAR method (Situation, Task, Action, Result). Mention indexing, query profiling (explain), or caching (Redis).',
        },
        {
          id: 3,
          question: 'Tell me about a time you had a technical disagreement with a senior engineer or product manager about architectural scope. How did you resolve it?',
          category: 'Behavioral',
          contextTip: 'Focus on empathy, data-driven benchmarking, prototyping, and aligning with business deadlines.',
        },
      ],
      'AI & Machine Learning Engineer': [
        {
          id: 1,
          question: 'Explain how Retrieval-Augmented Generation (RAG) mitigates LLM hallucinations, and how you evaluate chunking strategies and embedding cosine similarity in production.',
          category: 'Technical',
          contextTip: 'Discuss vector databases (Pinecone, Milvus), hybrid search, re-ranking, and latency considerations.',
        },
        {
          id: 2,
          question: 'How do you address data drift and concept drift in continuous ML pipelines post-deployment?',
          category: 'Technical',
          contextTip: 'Mention monitoring tools (Evidently AI, Prometheus), retraining triggers, and canary deployments.',
        },
        {
          id: 3,
          question: 'Describe a project where your initial model failed to meet accuracy or latency SLAs. What architectural pivot did you execute?',
          category: 'Scenario / Problem Solving',
          contextTip: 'Structure around metric-driven optimization: model quantization, distillation, or feature pruning.',
        },
      ],
    };

    return questionBanks[targetRole] || questionBanks['Full Stack Developer'];
  },

  // Evaluate candidate's mock interview answer
  evaluateInterviewAnswer: (question: string, answer: string, targetRole: string): InterviewEvaluationResult => {
    const wordCount = (answer || '').trim().split(/\s+/).filter(Boolean).length;
    const lower = (answer || '').toLowerCase();

    // Check for structured reasoning markers
    const hasSituation = lower.includes('when') || lower.includes('project') || lower.includes('situation') || lower.includes('at my');
    const hasAction = lower.includes('i implemented') || lower.includes('i designed') || lower.includes('i built') || lower.includes('i led') || lower.includes('i resolved');
    const hasResult = lower.includes('result') || lower.includes('improved') || lower.includes('reduced') || lower.includes('achieved') || lower.includes('%') || lower.includes('faster');

    let score = 40;
    if (wordCount > 30) score += 20;
    if (wordCount > 80) score += 10;
    if (hasSituation) score += 10;
    if (hasAction) score += 10;
    if (hasResult) score += 10;

    score = Math.min(95, Math.max(45, score));

    return {
      score,
      clarityRating: score >= 80 ? 'Exceptional & Articulate' : score >= 65 ? 'Solid & Competent' : 'Needs Structure & Precision',
      strengths: [
        wordCount > 40 ? 'Provided concrete contextual background rather than vague one-liners.' : 'Directly addressed the central premise of the question.',
        hasAction ? 'Clearly articulated individual engineering actions rather than hiding behind general team terms.' : 'Demonstrated domain awareness.',
      ],
      weaknesses: [
        !hasResult ? 'Missing quantifiable business outcome or performance metric at the conclusion.' : 'Could make trade-off analysis deeper.',
        wordCount < 50 ? 'Answer was somewhat concise; elaborating on edge cases would show senior-level depth.' : 'Consider mentioning automated monitoring or test validation.',
      ],
      starMethodReview: hasSituation && hasAction && hasResult
        ? 'Excellent STAR format adherence! You transitioned smoothly from problem to engineering implementation and quantified resolution.'
        : 'Partially structured. Ensure you conclude with a definitive "Result" metric (e.g., latency dropped 40%, zero downtime migration).',
      modelAnswer: `In my previous engagement as a ${targetRole}, when encountering a comparable challenge, I initiated an observability audit using telemetry metrics. I isolated the primary bottleneck, developed a decoupled caching layer with cache invalidation webhooks, and instituted automated regression suites. As a tangible outcome, response times improved by 52% and deployment velocity accelerated significantly.`,
    };
  },

  // 3. PathSeeker Virtual Advisor (Floating Conversational AI Assistant)
  askVirtualAdvisor: (userQuery: string, userRole: string = 'Student', contextCareer?: string) => {
    const query = (userQuery || '').toLowerCase();

    // Context retrieval from career bank
    const matchedCareer = mockCareers.find((c) =>
      query.includes(c.title.toLowerCase()) || query.includes(c.domain.toLowerCase()) || (contextCareer && c.title.toLowerCase() === contextCareer.toLowerCase())
    ) || mockCareers[0];

    let reply = '';
    const suggestedChips: string[] = [];

    if (query.includes('salary') || query.includes('pay') || query.includes('compensation') || query.includes('money')) {
      reply = `Based on the latest PathSeeker Market Intelligence for **${matchedCareer.title}**, the current entry-level compensation starts around **$${matchedCareer.salaryRange.entry.toLocaleString()}**, with a median of **$${matchedCareer.salaryRange.median.toLocaleString()}**, and senior specialists commanding up to **$${matchedCareer.salaryRange.senior.toLocaleString()}** annually. The 5-year growth trajectory is currently **${matchedCareer.growthRate}**.`;
      suggestedChips.push(`View ${matchedCareer.title} Full Roadmap`, 'Simulate 2026-2035 Market Shift', 'Take Skill Match Quiz');
    } else if (query.includes('skill') || query.includes('learn') || query.includes('prerequisite') || query.includes('start')) {
      const topSkills = matchedCareer.requiredSkills.map((s: any) => `• **${s.name}** (${s.level} Level)`).join('\n');
      reply = `To excel in **${matchedCareer.title}**, our Career Passport skill framework recommends prioritizing the following core competencies:\n\n${topSkills}\n\nFor a ${userRole}, we suggest starting with foundational milestones before diving into high-tier certifications.`;
      suggestedChips.push('Explore Learning Resources', 'Upload Resume for Skill Gap Roast', 'Start Step-by-Step Flight Path');
    } else if (query.includes('ai') || query.includes('automation') || query.includes('replace') || query.includes('future') || query.includes('safe')) {
      reply = `Our Predictive Market Engine assesses the automation risk for **${matchedCareer.title}** at **${matchedCareer.automationRisk}%**. Roles in this domain are evolving toward AI orchestration—professionals who leverage AI workflows are seeing a **+30% salary premium** compared to traditional counterparts.`;
      suggestedChips.push('Open Predictive Salary Simulator', 'Explore AI Engineering Path', 'View Day-in-the-Life Vlog');
    } else {
      reply = `Hello Traveler! As your **PathSeeker Virtual Advisor**, I'm here to navigate your career flight plan. Based on your role as a **${userRole}**, I can assist you with:\n\n1. **Skill Gap Auditing**: Compare your current skills against top industry demands.\n2. **Career Passport Milestones**: Recommend your next Visa Stamp goal.\n3. **Market Shifts**: Forecast salary trends through 2035.\n4. **Resume Optimization**: Roast and fine-tune your CV for ATS filters.`;
      suggestedChips.push('Recommend Best Career for Me', 'What are Trending Tech Careers?', 'Audit My Resume', 'Take AI Interest Quiz');
    }

    return {
      reply,
      careerContext: matchedCareer.title,
      suggestedChips,
      timestamp: new Date().toISOString(),
    };
  },

  // 4. AI Mentor Voice Synthesis Script Generator
  generateVoiceMentorPepTalk: (careerTitle: string, userRole: string = 'Explorer'): string => {
    return `Hello and welcome! This is your PathSeeker AI Career Coach speaking. You are exploring the trajectory for ${careerTitle}. As a ${userRole}, your curiosity and drive place you in the top tier of candidates ready to conquer this domain. The industry is actively searching for resilient problem solvers who master modern tooling. Remember: every complex architecture was built one milestone at a time. Review your flight roadmap, earn your next visa stamp, and take bold steps forward today!`;
  },

  // 5. Predictive Salary & Market Shift Simulator Model (2026-2035)
  calculateMarketShift: (careerSlug: string, year: number) => {
    const career = mockCareers.find((c) => c.slug === careerSlug) || mockCareers[0];
    const targetYear = Math.max(2026, Math.min(2035, year || 2026));
    const yearOffset = targetYear - 2026;

    // Growth multiplier compounded annually
    const growthFactor = 1 + yearOffset * 0.058;
    const simulatedMedian = Math.round(career.salaryRange.median * growthFactor);
    const simulatedSenior = Math.round(career.salaryRange.senior * (growthFactor * 1.04));
    const simulatedDemandIndex = Math.min(99, Math.round(75 + yearOffset * 2.3 - (career.automationRisk * 0.2)));
    const aiMultiplier = (1 + (yearOffset * 0.07)).toFixed(2);

    return {
      year: targetYear,
      careerTitle: career.title,
      medianSalary: simulatedMedian,
      seniorSalary: simulatedSenior,
      demandIndex: simulatedDemandIndex,
      aiSkillPremiumMultiplier: `${aiMultiplier}x`,
      automationRiskPercent: career.automationRisk,
      marketOutlook: targetYear > 2030 ? 'Transformational Growth with AI Augmentation' : 'Steady High Market Demand',
      keyEmergingSkills: [
        'Agentic AI Workflow Design',
        'High-Reliability Distributed Systems',
        'Security-First Cloud Governance',
        'Data Synthesis & Vector Optimization',
      ],
    };
  },
};
