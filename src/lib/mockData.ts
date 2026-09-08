import { Profile, Post, Story, Notification, Message, Hashtag, Report } from '../types/database.types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-001',
    username: 'alexa_design',
    full_name: 'Alexa Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Lead Product Designer & Creative Technologist 🌸 Designing scalable design systems, WebGL interactive experiences, and accessible UI kits.',
    website: 'https://alexarivera.design',
    github_url: 'https://github.com/alexarivera',
    linkedin_url: 'https://linkedin.com/in/alexarivera',
    location: 'Tokyo, Japan',
    skills: ['Figma', 'Design Systems', 'Three.js', 'React', 'Tailwind CSS', 'User Research'],
    is_private: false,
    is_verified: true,
    open_to_collab: true,
    role: 'user',
    followers_count: 14200,
    following_count: 382,
    posts_count: 24,
    projects_count: 14,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    is_following: true,
    follow_status: 'active'
  },
  {
    id: 'user-002',
    username: 'leo_cyber',
    full_name: 'Leo Chen',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    bio: 'Senior Full-Stack & 3D Web Graphics Engineer ⚡ Crafting WebGPU shaders, real-time procedural environments & high-frequency microservices.',
    website: 'https://leochen3d.io',
    github_url: 'https://github.com/leochen3d',
    location: 'Singapore',
    skills: ['TypeScript', 'Rust', 'WebGPU', 'Blender', 'Next.js', 'PostgreSQL'],
    is_private: false,
    is_verified: true,
    open_to_collab: true,
    role: 'user',
    followers_count: 8940,
    following_count: 210,
    posts_count: 18,
    projects_count: 9,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    is_following: true,
    follow_status: 'active'
  },
  {
    id: 'user-003',
    username: 'elena_ai',
    full_name: 'Elena Rostova',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    bio: 'AI Research Engineer & Computer Vision Specialist 🧠 Building open-source neural rendering, diffusion models, and real-time edge AI pipelines.',
    website: 'https://elenarostova.ai',
    github_url: 'https://github.com/elenarostova',
    location: 'Berlin, Germany',
    skills: ['PyTorch', 'Python', 'CUDA', 'FastAPI', 'Docker', 'Computer Vision'],
    is_private: false,
    is_verified: true,
    open_to_collab: false,
    role: 'user',
    followers_count: 5320,
    following_count: 145,
    posts_count: 12,
    projects_count: 7,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    is_following: false,
    follow_status: 'none'
  },
  {
    id: 'user-004',
    username: 'kai_quantum',
    full_name: 'Kai Takahashi',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Audio Software Engineer & Embedded DSP Developer 🎛️ Building real-time synthesizer plugins, VST3 DSP engines, and WebAudio instruments.',
    location: 'Kyoto, Japan',
    skills: ['C++', 'JUCE', 'WebAudio', 'DSP', 'React', 'WebAssembly'],
    is_private: true,
    is_verified: false,
    open_to_collab: true,
    role: 'user',
    followers_count: 3100,
    following_count: 540,
    posts_count: 15,
    projects_count: 6,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    is_following: false,
    follow_status: 'none'
  }
];

export const CURRENT_DEMO_USER: Profile = {
  id: 'current-user-me',
  username: 'vibemaster',
  full_name: 'Jordan Hayes',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  bio: 'Full-Stack Software Engineer & Creative Builder ✨ Sharing case studies, architecture patterns, and open-source projects. Open to project collaborations!',
  website: 'https://jordanhayes.dev',
  github_url: 'https://github.com/jordanhayes',
  linkedin_url: 'https://linkedin.com/in/jordanhayes',
  location: 'San Francisco, CA',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Docker', 'GraphQL'],
  is_private: false,
  is_verified: true,
  open_to_collab: true,
  role: 'admin',
  followers_count: 1250,
  following_count: 340,
  posts_count: 8,
  projects_count: 5,
  created_at: new Date(Date.now() - 100 * 86400000).toISOString()
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    user_id: 'user-001',
    project_title: 'PrismUI — Enterprise Open-Source Design System',
    category: 'UI/UX & Product Design',
    work_status: 'Completed',
    open_to_collab: true,
    caption: 'Proud to open-source PrismUI! Built a zero-runtime CSS-in-JS design system with 60+ accessible components, automated dark-mode token generation, and WCAG AAA color contrast validation. Used by over 12,000 developers worldwide.',
    experience_learnings: '💡 Key Learnings & Challenges:\n• Challenge: Supporting fluid container queries while maintaining sub-millisecond layout compute.\n• Solution: Implemented native CSS container units combined with semantic custom properties.\n• Result: Reduced component bundle size by 44% compared to standard UI libraries.',
    tech_stack: ['Figma', 'TypeScript', 'React', 'Tailwind CSS', 'Storybook', 'Radix UI'],
    live_demo_url: 'https://prismui.design',
    github_url: 'https://github.com/alexarivera/prism-ui',
    location: 'Tokyo Innovation Lab',
    audience: 'public',
    likes_count: 1428,
    comments_count: 42,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    user: INITIAL_PROFILES[0],
    media: [
      {
        id: 'media-1-1',
        post_id: 'post-1',
        media_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 0
      },
      {
        id: 'media-1-2',
        post_id: 'post-1',
        media_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 1
      },
      {
        id: 'media-1-3',
        post_id: 'post-1',
        media_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 2
      }
    ],
    is_liked: true,
    is_saved: true,
    hashtags: ['designsystem', 'uiux', 'opensource', 'react', 'webdevelopment']
  },
  {
    id: 'post-2',
    user_id: 'user-002',
    project_title: 'NeuralRay — WebGPU Real-Time 3D Parametric Engine',
    category: 'Creative & 3D Art',
    work_status: 'Completed',
    open_to_collab: true,
    caption: 'Shipped NeuralRay, a real-time procedural raymarching shader engine running directly in the browser via WebGPU and WGSL shaders. Renders high-density volumetric clouds, titanium structures, and atmospheric light scattering at 120 FPS on Apple Silicon and RTX GPUs.',
    experience_learnings: '💡 Engineering Challenges & Breakthroughs:\n• Memory bandwidth was choking on 4K multi-sampled shadow passes.\n• Designed a temporal accumulation buffer with depth-guided reprojection, dropping compute passes by 60% with zero visual fidelity loss.',
    tech_stack: ['WebGPU', 'WGSL', 'Rust', 'WebAssembly', 'Three.js', 'Vite'],
    live_demo_url: 'https://neuralray.io/demo',
    github_url: 'https://github.com/leochen3d/neural-ray-engine',
    location: 'Singapore Tech Hub',
    audience: 'public',
    likes_count: 852,
    comments_count: 29,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    user: INITIAL_PROFILES[1],
    media: [
      {
        id: 'media-2-1',
        post_id: 'post-2',
        media_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 0
      },
      {
        id: 'media-2-2',
        post_id: 'post-2',
        media_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 1
      }
    ],
    is_liked: false,
    is_saved: true,
    hashtags: ['webgpu', 'creativecoding', 'shaders', 'rust', '3dgraphics']
  },
  {
    id: 'post-3',
    user_id: 'user-003',
    project_title: 'EdgeVision — Real-time On-Device Object Detection',
    category: 'AI & Machine Learning',
    work_status: 'Case Study',
    open_to_collab: false,
    caption: 'Published research and open-source models for quantized YOLOv9 running with ONNX Runtime Web. Achieves 45ms inference latency directly on client CPUs without sending any video frames to remote cloud servers.',
    experience_learnings: '💡 Takeaways:\n• Privacy-first AI is feasible on client devices when INT8 dynamic quantization and SIMD vector instructions are leveraged.\n• Benchmark accuracy dropped only 1.2% mAP while saving 100% of cloud GPU hosting costs.',
    tech_stack: ['PyTorch', 'ONNX', 'Python', 'FastAPI', 'Wasm', 'Computer Vision'],
    github_url: 'https://github.com/elenarostova/edge-vision-web',
    location: 'Berlin AI Campus',
    audience: 'public',
    likes_count: 614,
    comments_count: 18,
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    user: INITIAL_PROFILES[2],
    media: [
      {
        id: 'media-3-1',
        post_id: 'post-3',
        media_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 0
      }
    ],
    is_liked: false,
    is_saved: false,
    hashtags: ['machinelearning', 'computervision', 'ai', 'edgecomputing', 'python']
  },
  {
    id: 'post-4',
    user_id: 'current-user-me',
    project_title: 'VibeSphere — Next-Gen Creator Portfolio & Showcase Network',
    category: 'Software & Web',
    work_status: 'Completed',
    open_to_collab: true,
    caption: 'Finished building VibeSphere! A modern full-stack social platform dedicated to sharing completed works, engineering case studies, and creator portfolios. Features PostgreSQL Row Level Security, instant direct messaging with code sharing, 24h stories, and real-time activity sync.',
    experience_learnings: '💡 Architecture Highlights:\n• Supabase RLS policies ensure 100% database-enforced multi-tenant isolation.\n• Realtime CDC triggers distribute instant messaging without spinning up custom WebSocket daemon clusters.\n• Designed dual-engine resilience for instant zero-config presentation.',
    tech_stack: ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'Vite', 'Docker'],
    live_demo_url: 'https://vibesphere.app',
    github_url: 'https://github.com/jordanhayes/vibesphere',
    location: 'Silicon Valley, CA',
    audience: 'public',
    likes_count: 940,
    comments_count: 35,
    created_at: new Date(Date.now() - 28 * 3600000).toISOString(),
    user: CURRENT_DEMO_USER,
    media: [
      {
        id: 'media-4-1',
        post_id: 'post-4',
        media_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 0
      },
      {
        id: 'media-4-2',
        post_id: 'post-4',
        media_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 1
      }
    ],
    is_liked: true,
    is_saved: true,
    hashtags: ['fullstack', 'react', 'supabase', 'softwareengineering', 'typescript', 'portfolio']
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    user_id: 'user-001',
    media_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    media_type: 'image',
    caption: 'Live coding the new responsive tokens engine in PrismUI 🚀',
    tag_topic: 'Work in Progress',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    expires_at: new Date(Date.now() + 20 * 3600000).toISOString(),
    user: INITIAL_PROFILES[0],
    views_count: 312,
    has_viewed: false
  },
  {
    id: 'story-2',
    user_id: 'user-002',
    media_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    media_type: 'image',
    caption: 'Benchmarking WebGPU raymarching shaders on M3 Max GPU: 120 FPS locked! ⚡',
    tag_topic: 'Tech Milestone',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    expires_at: new Date(Date.now() + 18 * 3600000).toISOString(),
    user: INITIAL_PROFILES[1],
    views_count: 189,
    has_viewed: false
  }
];

export const INITIAL_HASHTAGS: Hashtag[] = [
  { id: '1', name: 'softwareengineering', post_count: 14200, category: 'Software & Web' },
  { id: '2', name: 'designsystems', post_count: 9800, category: 'UI/UX & Product Design' },
  { id: '3', name: 'machinelearning', post_count: 11400, category: 'AI & Machine Learning' },
  { id: '4', name: 'webgpu', post_count: 6730, category: 'Creative & 3D Art' },
  { id: '5', name: 'opensource', post_count: 15300, category: 'Software & Web' },
  { id: '6', name: 'fullstack', post_count: 12800, category: 'Software & Web' },
  { id: '7', name: 'uiux', post_count: 16900, category: 'UI/UX & Product Design' },
  { id: '8', name: 'casestudy', post_count: 8400, category: 'Research & Case Studies' }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    recipient_id: 'current-user-me',
    actor_id: 'user-001',
    type: 'like',
    post_id: 'post-4',
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    actor: INITIAL_PROFILES[0],
    post: INITIAL_POSTS[3]
  },
  {
    id: 'notif-2',
    recipient_id: 'current-user-me',
    actor_id: 'user-002',
    type: 'collab_request',
    post_id: 'post-4',
    is_read: false,
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    actor: INITIAL_PROFILES[1],
    post: INITIAL_POSTS[3]
  },
  {
    id: 'notif-3',
    recipient_id: 'current-user-me',
    actor_id: 'user-003',
    type: 'follow',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    actor: INITIAL_PROFILES[2]
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender_id: 'user-001',
    receiver_id: 'current-user-me',
    content: 'Hey Jordan! Checked out your VibeSphere project showcase. The PostgreSQL Row-Level Security architecture is super clean. Would love to collaborate on adding interactive 3D WebGL cards to the feed!',
    is_read: true,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    sender: INITIAL_PROFILES[0]
  },
  {
    id: 'msg-2',
    sender_id: 'current-user-me',
    receiver_id: 'user-001',
    content: 'Hi Alexa! That sounds awesome. How are you handling the WebGPU rendering passes for container cards? Here is how we bundle our responsive layout:',
    code_snippet: {
      language: 'typescript',
      code: 'export const useResponsiveShader = (canvasRef: RefObject<HTMLCanvasElement>) => {\n  const [fps, setFps] = useState(60);\n  // Initialize WebGPU device & pipeline\n  return { render: () => {} };\n};'
    },
    is_read: true,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    sender: CURRENT_DEMO_USER
  },
  {
    id: 'msg-3',
    sender_id: 'user-001',
    receiver_id: 'current-user-me',
    content: 'Awesome! I recorded a quick audio note explaining the spatial shader pipeline.',
    audio_url: 'https://actions.google.com/sounds/v1/science_fiction/teleport_whoosh.ogg',
    is_read: false,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    sender: INITIAL_PROFILES[0]
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    reporter_id: 'user-003',
    post_id: 'post-1',
    reason: 'spam',
    details: 'Spam promotion link in comment section.',
    status: 'pending',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    reporter: INITIAL_PROFILES[2],
    post: INITIAL_POSTS[0]
  }
];
