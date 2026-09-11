export interface AICaptionRequest {
  title: string;
  category: string;
  tags: string[];
  keyHighlights?: string;
  tone?: 'professional' | 'hype' | 'technical' | 'concise';
}

export interface AISafetyReport {
  isSafe: boolean;
  score: number; // 0-100 (100 = safest)
  toxicLikelihood: 'low' | 'medium' | 'high';
  scamRisk: 'none' | 'suspicious' | 'high_risk';
  reasons: string[];
  suggestions?: string[];
}

export const aiService = {
  /**
   * Generates a tailored creator caption and project overview
   */
  async generateCaption(req: AICaptionRequest): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 600)); // simulated latency

    const tone = req.tone || 'professional';
    const tagString = req.tags.slice(0, 4).join(', ');
    const hashtagStr = req.tags.map(t => `#${t.toLowerCase().replace(/[^a-z0-9]/g, '')}`).join(' ');

    if (tone === 'hype') {
      return `🚀 Thrilled to finally drop ${req.title}! We pushed the boundaries of ${req.category} using ${tagString}.\n\n${req.keyHighlights || 'Built from the ground up for maximum speed, clean UX, and high-impact craft.'}\n\nCheck out the live demo and let me know what you think in the comments! 👇✨\n\n${hashtagStr}`;
    }

    if (tone === 'technical') {
      return `Shipped ${req.title} (${req.category}).\n\nArchitecture breakdown:\n• Built with: ${tagString}\n• Focus: ${req.keyHighlights || 'Deterministic state management, sub-millisecond response times, and resilient client-side caching.'}\n• Open for architecture feedback and peer reviews.\n\n${hashtagStr}`;
    }

    if (tone === 'concise') {
      return `Built ${req.title} — an open-source project in ${req.category} powered by ${tagString}. Feedback & collaboration welcome! ${hashtagStr}`;
    }

    // Default professional
    return `Excited to present ${req.title}! A modern project in ${req.category} crafted with ${tagString}.\n\n${req.keyHighlights || 'Designed to solve real builder workflows with high craftsmanship, scalable architecture, and intuitive design.'}\n\nWould love to hear feedback from fellow creators! 🛠️\n\n${hashtagStr}`;
  },

  /**
   * Analyzes project title and description to suggest relevant tech stack tags
   */
  async suggestTechStack(title: string, description: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 450));

    const combined = `${title} ${description}`.toLowerCase();
    const suggestions = new Set<string>();

    const techDict: Record<string, string[]> = {
      'react': ['React', 'TypeScript', 'Tailwind CSS'],
      'next': ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
      'vue': ['Vue.js', 'Vite', 'Pinia'],
      'python': ['Python', 'FastAPI', 'PyTorch'],
      'ai': ['PyTorch', 'Python', 'FastAPI', 'ONNX', 'HuggingFace'],
      'machine learning': ['PyTorch', 'Scikit-Learn', 'Python', 'CUDA'],
      'llm': ['LangChain', 'Gemini API', 'Python', 'Vector DB'],
      '3d': ['Three.js', 'Blender', 'WebGPU', 'GLSL'],
      'shader': ['WebGPU', 'WGSL', 'GLSL', 'Three.js'],
      'game': ['Unity', 'C#', 'Blender', 'WebAssembly'],
      'robot': ['ROS 2', 'C++', 'ESP32', 'Python', 'SolidWorks'],
      'hardware': ['ESP32', 'Arduino', 'KiCad', 'C++'],
      'mobile': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift'],
      'ios': ['Swift', 'SwiftUI', 'Xcode'],
      'android': ['Kotlin', 'Android Studio', 'Jetpack Compose'],
      'audio': ['WebAudio', 'DSP', 'C++', 'JUCE'],
      'music': ['WebAudio', 'Ableton', 'Max/MSP'],
      'database': ['PostgreSQL', 'Supabase', 'Redis', 'Prisma'],
      'design': ['Figma', 'Design Systems', 'Radix UI', 'Tailwind CSS'],
      'rust': ['Rust', 'WebAssembly', 'Tokio'],
      'crypto': ['Solidity', 'Ethers.js', 'Web3.js']
    };

    for (const [key, tags] of Object.entries(techDict)) {
      if (combined.includes(key)) {
        tags.forEach(t => suggestions.add(t));
      }
    }

    if (suggestions.size === 0) {
      return ['TypeScript', 'React', 'Tailwind CSS', 'Node.js', 'Supabase'];
    }

    return Array.from(suggestions).slice(0, 6);
  },

  /**
   * Structures raw notes into an engineering case study with takeaways
   */
  async polishCaseStudy(rawNotes: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 600));

    if (!rawNotes.trim()) {
      return '💡 Case Study & Engineering Learnings:\n• Challenge: Optimizing latency and memory footprint during peak client loads.\n• Solution: Implemented decoupled background web workers and local caching.\n• Outcome: 40% reduction in compute overhead and seamless 60 FPS interactions.';
    }

    const lines = rawNotes.split('\n').map(l => l.trim()).filter(Boolean);

    return `💡 Key Learnings & Engineering Breakdown:\n` +
      `• Primary Challenge: ${lines[0] || 'Handling complex asynchronous state and performance bottlenecks.'}\n` +
      `• Architecture Solution: ${lines[1] || 'Engineered modular component isolation and stream-based data pipelines.'}\n` +
      `• Measurable Impact: ${lines[2] || 'Delivered reliable cross-platform performance with zero memory leaks.'}`;
  },

  /**
   * Generates automatic alt-text for accessibility
   */
  async generateAltText(title: string, category: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return `High-resolution screenshot showcase of ${title}, demonstrating user interface elements, architecture diagrams, and design components in ${category}.`;
  },

  /**
   * Content Safety & Scam Detection Scanner
   */
  async analyzeSafety(text: string): Promise<AISafetyReport> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const lower = text.toLowerCase();
    const warnings: string[] = [];
    let isSafe = true;
    let score = 98;
    let scamRisk: 'none' | 'suspicious' | 'high_risk' = 'none';
    let toxicLikelihood: 'low' | 'medium' | 'high' = 'low';

    // Scam keywords detection
    const scamKeywords = ['send money', 'wire transfer', 'crypto investment guarantee', '100% free nitro', 'dm for password', 'whatsapp me urgently for job', 'pay upfront'];
    for (const kw of scamKeywords) {
      if (lower.includes(kw)) {
        scamRisk = 'high_risk';
        isSafe = false;
        score = 25;
        warnings.push(`Contains suspicious financial or credential solicitation phrases: "${kw}"`);
      }
    }

    // Toxicity keywords detection
    const toxicKeywords = ['hate you', 'idiot', 'stupid', 'trash project', 'terrible work kill yourself', 'scammer'];
    for (const kw of toxicKeywords) {
      if (lower.includes(kw)) {
        toxicLikelihood = 'high';
        isSafe = false;
        score = Math.min(score, 30);
        warnings.push('Contains potentially hostile or unconstructive language.');
      }
    }

    // Suspicious links detection
    if (/https?:\/\/[^\s]+(\.ru|\.xyz|\.top|bit\.ly|t\.me)\b/i.test(text)) {
      if (scamRisk === 'none') scamRisk = 'suspicious';
      score = Math.min(score, 70);
      warnings.push('Contains shortened or unverified domain extension links.');
    }

    return {
      isSafe,
      score,
      toxicLikelihood,
      scamRisk,
      reasons: warnings.length > 0 ? warnings : ['Clean content. No spam, toxicity, or deceptive patterns detected.'],
      suggestions: warnings.length > 0
        ? ['Verify all external links', 'Focus feedback on technical architecture and constructive advice']
        : ['Content complies with CraftPlus Community Safety Standards']
    };
  }
};

