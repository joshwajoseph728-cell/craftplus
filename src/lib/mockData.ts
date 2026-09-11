import { Profile, Post, Story, Notification, Message, Hashtag, Report, Badge, Challenge, CollabOpportunity } from '../types/database.types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-first-project',
    name: 'First Project',
    icon: 'ðŸš€',
    description: 'Published first public work showcase on CraftPlus.',
    category: 'achievement',
    tier: 'bronze'
  },
  {
    id: 'badge-10-projects',
    name: '10 Projects Master',
    icon: 'ðŸ› ï¸',
    description: 'Published 10 or more documented engineering case studies and creative works.',
    category: 'achievement',
    tier: 'gold'
  },
  {
    id: 'badge-rising-creator',
    name: 'Rising Creator',
    icon: 'ðŸŒŸ',
    description: 'Gained high community recognition and project bookmarks.',
    category: 'community',
    tier: 'silver'
  },
  {
    id: 'badge-challenge-winner',
    name: 'AI Challenge Winner',
    icon: 'ðŸ†',
    description: 'Won 1st place in the Global AI Project Challenge.',
    category: 'challenge',
    tier: 'diamond'
  },
  {
    id: 'badge-community-builder',
    name: 'Community Builder',
    icon: 'ðŸ¤',
    description: 'Successfully collaborated on multiple multi-creator projects.',
    category: 'community',
    tier: 'gold'
  },
  {
    id: 'badge-top-creator',
    name: 'Top Creator',
    icon: 'ðŸ‘‘',
    description: 'Verified top tier creator demonstrating exceptional craftsmanship.',
    category: 'expertise',
    tier: 'diamond'
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-001',
    username: 'alexa_design',
    full_name: 'Alexa Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    headline: 'Lead Product Designer & Creative Technologist',
    bio: 'Lead Product Designer & Creative Technologist ðŸŒ¸ Designing scalable design systems, WebGL interactive experiences, and accessible UI kits.',
    website: 'https://alexarivera.design',
    github_url: 'https://github.com/alexarivera',
    linkedin_url: 'https://linkedin.com/in/alexarivera',
    dribbble_url: 'https://dribbble.com/alexarivera',
    location: 'Tokyo, Japan',
    skills: ['Figma', 'Design Systems', 'Three.js', 'React', 'Tailwind CSS', 'User Research', 'Accessibility'],
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
    follow_status: 'active',
    badges: [INITIAL_BADGES[0], INITIAL_BADGES[1], INITIAL_BADGES[5]],
    portfolio_theme: 'modern'
  },
  {
    id: 'user-002',
    username: 'leo_cyber',
    full_name: 'Leo Chen',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    headline: 'Senior Full-Stack & 3D Web Graphics Engineer',
    bio: 'Senior Full-Stack & 3D Web Graphics Engineer âš¡ Crafting WebGPU shaders, real-time procedural environments & high-frequency microservices.',
    website: 'https://leochen3d.io',
    github_url: 'https://github.com/leochen3d',
    location: 'Singapore',
    skills: ['TypeScript', 'Rust', 'WebGPU', 'Blender', 'Next.js', 'PostgreSQL', 'WGSL'],
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
    follow_status: 'active',
    badges: [INITIAL_BADGES[0], INITIAL_BADGES[2], INITIAL_BADGES[4]],
    portfolio_theme: 'cyber'
  },
  {
    id: 'user-003',
    username: 'elena_ai',
    full_name: 'Elena Rostova',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    headline: 'AI Research Engineer & Computer Vision Specialist',
    bio: 'AI Research Engineer & Computer Vision Specialist ðŸ§  Building open-source neural rendering, diffusion models, and real-time edge AI pipelines.',
    website: 'https://elenarostova.ai',
    github_url: 'https://github.com/elenarostova',
    location: 'Berlin, Germany',
    skills: ['PyTorch', 'Python', 'CUDA', 'FastAPI', 'Docker', 'Computer Vision', 'ONNX'],
    is_private: false,
    is_verified: true,
    open_to_collab: true,
    role: 'user',
    followers_count: 5320,
    following_count: 145,
    posts_count: 12,
    projects_count: 7,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    is_following: false,
    follow_status: 'none',
    badges: [INITIAL_BADGES[0], INITIAL_BADGES[3]],
    portfolio_theme: 'modern'
  },
  {
    id: 'user-004',
    username: 'kai_quantum',
    full_name: 'Kai Takahashi',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    headline: 'Audio Software Engineer & Embedded DSP Developer',
    bio: 'Audio Software Engineer & Embedded DSP Developer ðŸŽ›ï¸ Building real-time synthesizer plugins, VST3 DSP engines, and WebAudio instruments.',
    location: 'Kyoto, Japan',
    skills: ['C++', 'JUCE', 'WebAudio', 'DSP', 'React', 'WebAssembly', 'Ableton Max'],
    is_private: false,
    is_verified: true,
    open_to_collab: true,
    role: 'user',
    followers_count: 3100,
    following_count: 540,
    posts_count: 15,
    projects_count: 6,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    is_following: false,
    follow_status: 'none',
    badges: [INITIAL_BADGES[0], INITIAL_BADGES[2]],
    portfolio_theme: 'minimal'
  },
  {
    id: 'user-005',
    username: 'maya_robotics',
    full_name: 'Maya Patel',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    headline: 'Robotics Engineer & Maker (ROS2 / ESP32)',
    bio: 'Robotics Researcher & Hardware Maker ðŸ¤– Designing autonomous quadrupeds, custom PCB boards, and computer vision navigation nodes.',
    website: 'https://mayarobotics.io',
    github_url: 'https://github.com/mayapatel-robotics',
    location: 'Austin, TX',
    skills: ['ROS 2', 'C++', 'Python', 'SolidWorks', 'KiCad', 'ESP32', '3D Printing'],
    is_private: false,
    is_verified: true,
    open_to_collab: true,
    role: 'user',
    followers_count: 6720,
    following_count: 280,
    posts_count: 19,
    projects_count: 8,
    created_at: new Date(Date.now() - 80 * 86400000).toISOString(),
    is_following: true,
    follow_status: 'active',
    badges: [INITIAL_BADGES[0], INITIAL_BADGES[1], INITIAL_BADGES[4]],
    portfolio_theme: 'cyber'
  }
];

export const CURRENT_DEMO_USER: Profile = {
  id: 'current-user-me',
  username: 'vibemaster',
  full_name: 'Jordan Hayes',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  headline: 'Full-Stack Architect & Open-Source Creator',
  bio: 'Full-Stack Software Engineer & Creative Builder âœ¨ Sharing case studies, architecture patterns, and open-source projects. Open to project collaborations!',
  website: 'https://jordanhayes.dev',
  github_url: 'https://github.com/jordanhayes',
  linkedin_url: 'https://linkedin.com/in/jordanhayes',
  location: 'San Francisco, CA',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Docker', 'GraphQL', 'Next.js'],
  is_private: false,
  is_verified: true,
  open_to_collab: true,
  role: 'admin',
  followers_count: 1250,
  following_count: 340,
  posts_count: 8,
  projects_count: 5,
  created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  badges: [INITIAL_BADGES[0], INITIAL_BADGES[2], INITIAL_BADGES[4], INITIAL_BADGES[5]],
  portfolio_theme: 'modern'
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    user_id: 'user-001',
    project_title: 'PrismUI â€” Enterprise Open-Source Design System',
    category: 'UI/UX & Product Design',
    work_status: 'Completed',
    open_to_collab: true,
    collab_role_needed: 'Three.js / Canvas Specialist',
    caption: 'Proud to open-source PrismUI! Built a zero-runtime CSS-in-JS design system with 60+ accessible components, automated dark-mode token generation, and WCAG AAA color contrast validation. Used by over 12,000 developers worldwide.',
    experience_learnings: 'ðŸ’¡ Key Learnings & Challenges:\nâ€¢ Challenge: Supporting fluid container queries while maintaining sub-millisecond layout compute.\nâ€¢ Solution: Implemented native CSS container units combined with semantic custom properties.\nâ€¢ Result: Reduced component bundle size by 44% compared to standard UI libraries.',
    tech_stack: ['Figma', 'TypeScript', 'React', 'Tailwind CSS', 'Storybook', 'Radix UI'],
    tools_used: ['Figma Tokens', 'Chromatic', 'GitHub Actions'],
    contributors: [
      {
        id: 'user-002',
        username: 'leo_cyber',
        full_name: 'Leo Chen',
        avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
        role_in_project: 'Animation & Shader Contributor'
      }
    ],
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
        display_order: 0,
        alt_text: 'PrismUI Design System components dashboard showing button states and tokens'
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
    hashtags: ['designsystem', 'uiux', 'opensource', 'react', 'webdevelopment'],
    recommendation_reason: 'Trending in Design & Matches your React skills',
    is_verified_link: true,
    mood_type: 'work'
  },
  {
    id: 'post-2',
    user_id: 'user-002',
    project_title: 'NeuralRay â€” WebGPU Real-Time 3D Parametric Engine',
    category: 'Creative & 3D Art',
    work_status: 'Completed',
    open_to_collab: true,
    collab_role_needed: 'Rust / Wasm Performance Engineer',
    caption: 'Shipped NeuralRay, a real-time procedural raymarching shader engine running directly in the browser via WebGPU and WGSL shaders. Renders high-density volumetric clouds, titanium structures, and atmospheric light scattering at 120 FPS on Apple Silicon and RTX GPUs.',
    experience_learnings: 'ðŸ’¡ Engineering Challenges & Breakthroughs:\nâ€¢ Memory bandwidth was choking on 4K multi-sampled shadow passes.\nâ€¢ Designed a temporal accumulation buffer with depth-guided reprojection, dropping compute passes by 60% with zero visual fidelity loss.',
    tech_stack: ['WebGPU', 'WGSL', 'Rust', 'WebAssembly', 'Three.js', 'Vite'],
    tools_used: ['Blender 4.2', 'RenderDoc', 'VS Code'],
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
        display_order: 0,
        alt_text: 'Futuristic procedural 3D raymarching environment rendered via WebGPU'
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
    hashtags: ['webgpu', 'creativecoding', 'shaders', 'rust', '3dgraphics'],
    challenge_badge: 'ðŸ† AI/3D Challenge Winner',
    recommendation_reason: 'High engagement in Creative 3D Art',
    is_verified_link: true,
    mood_type: 'work'
  },
  {
    id: 'post-3',
    user_id: 'user-003',
    project_title: 'EdgeVision â€” Real-time On-Device Object Detection',
    category: 'AI & Machine Learning',
    work_status: 'Case Study',
    open_to_collab: false,
    caption: 'Published research and open-source models for quantized YOLOv9 running with ONNX Runtime Web. Achieves 45ms inference latency directly on client CPUs without sending any video frames to remote cloud servers.',
    experience_learnings: 'ðŸ’¡ Takeaways:\nâ€¢ Privacy-first AI is feasible on client devices when INT8 dynamic quantization and SIMD vector instructions are leveraged.\nâ€¢ Benchmark accuracy dropped only 1.2% mAP while saving 100% of cloud GPU hosting costs.',
    tech_stack: ['PyTorch', 'ONNX', 'Python', 'FastAPI', 'Wasm', 'Computer Vision'],
    tools_used: ['TensorRT', 'Weights & Biases', 'OpenCV'],
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
        display_order: 0,
        alt_text: 'Real-time AI computer vision bounding boxes on edge browser pipeline'
      }
    ],
    is_liked: false,
    is_saved: false,
    hashtags: ['machinelearning', 'computervision', 'ai', 'edgecomputing', 'python'],
    recommendation_reason: 'Featured in AI & Machine Learning Research',
    is_verified_link: true,
    mood_type: 'work'
  },
  {
    id: 'post-5',
    user_id: 'user-005',
    project_title: 'StarlightQuad â€” Open-Source Autonomous Quadruped Robot',
    category: 'Robotics & Embedded',
    work_status: 'Completed',
    open_to_collab: true,
    collab_role_needed: 'Reinforcement Learning Simulation Engineer',
    caption: 'Built a 12-DOF compact autonomous robot dog with custom brushless servo actuators, ROS2 Humble navigation stack, and an on-board Intel RealSense depth camera for terrain SLAM. 100% 3D printable chassis!',
    experience_learnings: 'ðŸ’¡ Hardware & Firmware Learnings:\nâ€¢ Solved actuator thermal throttling by designing aluminum heat-sink stator brackets.\nâ€¢ Implemented inverse kinematics closed-loop PID control on dual ESP32-S3 microcontrollers synced via CAN bus at 1kHz.',
    tech_stack: ['ROS 2', 'C++', 'ESP32', 'KiCad', 'SolidWorks', 'Python', 'CAN-Bus'],
    tools_used: ['Bambu Lab X1C', 'Saleae Logic Analyzer', 'PlatformIO'],
    github_url: 'https://github.com/mayapatel-robotics/starlight-quadruped',
    location: 'Austin Robotics Lab',
    audience: 'public',
    likes_count: 1120,
    comments_count: 54,
    created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    user: INITIAL_PROFILES[4],
    media: [
      {
        id: 'media-5-1',
        post_id: 'post-5',
        media_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 0,
        alt_text: 'Autonomous 12-DOF quadruped robot prototype with depth camera sensors'
      }
    ],
    is_liked: true,
    is_saved: true,
    hashtags: ['robotics', 'ros2', 'embedded', 'hardware', 'makers', 'iot'],
    challenge_badge: 'ðŸ† Hardware Hack Gold Medal',
    recommendation_reason: 'Top Maker project of the week',
    is_verified_link: true,
    mood_type: 'work'
  },
  {
    id: 'post-fun-1',
    user_id: 'user-002',
    project_title: 'Cyberpunk Workspace & Ambient Neon Station Tour âœ¨',
    category: 'Creative & 3D Art',
    work_status: 'Concept',
    open_to_collab: false,
    caption: 'Late night creative coding vibes! Setup tour of my dual 4K OLED + audio visualizer station. What is your go-to soundtrack for creative flow? ðŸŽ§âš¡',
    tech_stack: ['Mechanical Keyboards', 'OLED', 'Nanoleaf', 'Ambient Sound'],
    location: 'Singapore Night Studio',
    audience: 'public',
    likes_count: 2490,
    comments_count: 94,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    user: INITIAL_PROFILES[1],
    media: [
      {
        id: 'media-fun-1',
        post_id: 'post-fun-1',
        media_url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 0,
        alt_text: 'Aesthetic neon developer studio setup with mechanical keyboard'
      }
    ],
    is_liked: true,
    is_saved: false,
    hashtags: ['desksetup', 'aesthetic', 'creatorlife', 'workvibes', 'cyberpunk'],
    recommendation_reason: 'Trending in Creator Lifestyle & Desk Inspo',
    is_verified_link: true,
    mood_type: 'normal'
  },
  {
    id: 'post-fun-2',
    user_id: 'user-004',
    project_title: 'Ambient Modular Synth Session & Lo-Fi Jams â˜•ðŸŽ›ï¸',
    category: 'Music & Sound Design',
    work_status: 'Completed',
    open_to_collab: true,
    caption: 'Grab a coffee and relax with some chill generative modular chords made with custom WebAudio patches. Pure flow state moments.',
    tech_stack: ['Ableton Live', 'Moog', 'Eurorack', 'WebAudio'],
    location: 'Kyoto Sound Studio',
    audience: 'public',
    likes_count: 1820,
    comments_count: 67,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    user: INITIAL_PROFILES[3],
    media: [
      {
        id: 'media-fun-2',
        post_id: 'post-fun-2',
        media_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 0,
        alt_text: 'Modular synthesizer and audio studio workspace'
      }
    ],
    is_liked: false,
    is_saved: true,
    hashtags: ['lofi', 'synth', 'musicproduction', 'flowstate', 'creativity'],
    recommendation_reason: 'Relaxing creator audio sessions',
    is_verified_link: true,
    mood_type: 'normal'
  },
  {
    id: 'post-fun-3',
    user_id: 'user-001',
    project_title: '3D Blender Animation Reel & Claymation Loops ðŸŽ¬ðŸŽ¨',
    category: 'Creative & 3D Art',
    work_status: 'Completed',
    open_to_collab: false,
    caption: 'Fun little weekend creative experiment! Practiced character rigging, squash-and-stretch physics, and soft studio lighting in Blender. Drop your favorite creative inspiration in the comments! ðŸ‘‡âœ¨',
    tech_stack: ['Blender', 'Cycles', 'After Effects', 'Procreate'],
    location: 'Tokyo Creative Studio',
    audience: 'public',
    likes_count: 3120,
    comments_count: 112,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    user: INITIAL_PROFILES[0],
    media: [
      {
        id: 'media-fun-3',
        post_id: 'post-fun-3',
        media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 0,
        alt_text: 'Abstract 3D fluid art and colorful digital sculpture'
      }
    ],
    is_liked: true,
    is_saved: false,
    hashtags: ['3danimation', 'blender3d', 'creativereels', 'digitalart', 'cgi'],
    recommendation_reason: 'Trending in 3D Art & Creative Reels',
    is_verified_link: true,
    mood_type: 'normal'
  },
  {
    id: 'post-fun-4',
    user_id: 'user-005',
    project_title: 'ASMR Mechanical Keyboard Build & Typing Sound Test âŒ¨ï¸â˜•',
    category: 'Hardware & IoT',
    work_status: 'Completed',
    open_to_collab: false,
    caption: 'Custom 65% gasket-mount keyboard build with lubed holy panda switches and brass weight. Pure ASMR sound test for your focus sessions! ðŸŽ§',
    tech_stack: ['Custom Keyboards', 'Soldering', 'Lube Stations', 'Audio Recording'],
    location: 'Austin Workshop',
    audience: 'public',
    likes_count: 4210,
    comments_count: 156,
    created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    user: INITIAL_PROFILES[4],
    media: [
      {
        id: 'media-fun-4',
        post_id: 'post-fun-4',
        media_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=80',
        media_type: 'image',
        display_order: 0,
        alt_text: 'Custom mechanical keyboard with glowing keycaps'
      }
    ],
    is_liked: false,
    is_saved: true,
    hashtags: ['mechanicalkeyboards', 'asmr', 'desksetup', 'customtech', 'creatorlife'],
    recommendation_reason: 'Viral Creator Sound Test',
    is_verified_link: true,
    mood_type: 'normal'
  },
  {
    id: 'post-4',
    user_id: 'current-user-me',
    project_title: 'CraftPlus â€” Next-Gen Creator Showcase & Collaboration Platform',
    category: 'Software & Web',
    work_status: 'Completed',
    open_to_collab: true,
    collab_role_needed: 'UI/UX Visual Designer',
    caption: 'Proud to present CraftPlus! A social platform tailored for builders, students, designers, and engineers to showcase completed projects, technical case studies, and find collaboration partners. Features PostgreSQL RLS, portfolio mode, direct messaging with code sharing, and AI assistant tools.',
    experience_learnings: 'ðŸ’¡ Architecture Highlights:\nâ€¢ Supabase RLS policies ensure 100% database-enforced multi-tenant isolation.\nâ€¢ Realtime CDC triggers distribute instant messaging without spinning up custom WebSocket daemon clusters.\nâ€¢ Dual-mode architecture guarantees instant zero-config presentation and high uptime.',
    tech_stack: ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'Vite', 'Docker'],
    tools_used: ['Lucide Icons', 'Vercel', 'Vitest'],
    live_demo_url: 'https://craftplus.vercel.app',
    github_url: 'https://github.com/joshwajoseph728-cell/craftplus',
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
        display_order: 0,
        alt_text: 'CraftPlus creator dashboard and project analytics interface'
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
    hashtags: ['fullstack', 'react', 'supabase', 'softwareengineering', 'typescript', 'portfolio'],
    recommendation_reason: 'Official platform showcase',
    is_verified_link: true,
    mood_type: 'work'
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'chal-1',
    title: 'AI Innovation Sprint 2026',
    tagline: 'Build an open-source AI/ML tool, multimodal app, or neural model',
    description: 'Create and document a working AI application or research case study. Submissions must include live architecture breakdown, model weights or GitHub repository, and an interactive demo or video preview.',
    category: 'AI & Machine Learning',
    banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    reward_badge: INITIAL_BADGES[3],
    days_left: 6,
    participants_count: 340,
    submissions_count: 48,
    criteria: [
      'Original technical architecture & problem solving',
      'Documented case study with key learnings',
      'Open-source repository or working live link',
      'Clean UI / UX presentation'
    ],
    status: 'active'
  },
  {
    id: 'chal-2',
    title: '7-Day Web & Cloud Sprint',
    tagline: 'Ship a full-stack SaaS prototype or developer tooling system',
    description: 'Challenge yourself to build a high-performance web application utilizing modern tech stacks (React, Next.js, Rust, Go, Supabase, PostgreSQL).',
    category: 'Software & Web',
    banner_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    reward_badge: INITIAL_BADGES[1],
    days_left: 12,
    participants_count: 512,
    submissions_count: 82,
    criteria: [
      'Full-stack architecture with database integration',
      'Responsive design across mobile & desktop',
      'Real-world usability and polish'
    ],
    status: 'active'
  },
  {
    id: 'chal-3',
    title: '3D Art & WebGL Shader Showdown',
    tagline: 'Push browser graphics to the absolute limit with WebGPU and Three.js',
    description: 'Design breathtaking 3D environments, generative procedural visuals, or interactive shaders rendering at 60+ FPS.',
    category: 'Creative & 3D Art',
    banner_url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
    reward_badge: INITIAL_BADGES[5],
    days_left: 18,
    participants_count: 215,
    submissions_count: 31,
    criteria: [
      'Innovative visual aesthetic & lighting',
      'High framerate optimization',
      'Documented shader techniques & math'
    ],
    status: 'active'
  },
  {
    id: 'chal-4',
    title: 'Hardware & Robotics Hack',
    tagline: 'Design and assemble a smart physical gadget, robot, or IoT hub',
    description: 'Submit schematics, 3D printed models, PCB designs, or firmware codes for physical computing devices.',
    category: 'Robotics & Embedded',
    banner_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&auto=format&fit=crop&q=80',
    reward_badge: INITIAL_BADGES[4],
    days_left: 24,
    participants_count: 180,
    submissions_count: 22,
    criteria: [
      'Functional hardware prototype demonstration',
      'Schematic/BOM & firmware repository',
      'Clear assembly documentation'
    ],
    status: 'active'
  }
];

export const INITIAL_COLLAB_OPPORTUNITIES: CollabOpportunity[] = [
  {
    id: 'collab-1',
    creator: INITIAL_PROFILES[0],
    project_title: 'PrismUI 2.0 â€” Spatial & WebGL Component Addon',
    category: 'UI/UX & Product Design',
    role_needed: 'Three.js / WebGL Visual Engineer',
    skills_required: ['Three.js', 'WebGL', 'TypeScript', 'GLSL'],
    description: 'Looking for a creative developer to help build 10+ interactive 3D particle and mesh components for the open-source PrismUI library.',
    status: 'open',
    applicants_count: 5,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    project_id: 'post-1'
  },
  {
    id: 'collab-2',
    creator: INITIAL_PROFILES[4],
    project_title: 'StarlightQuad Sim2Real Reinforcement Learning',
    category: 'Robotics & Embedded',
    role_needed: 'PyTorch / Isaac Sim Specialist',
    skills_required: ['PyTorch', 'ROS 2', 'NVIDIA Isaac Sim', 'Python'],
    description: 'Seeking an ML researcher to train locomotion reinforcement learning policies in simulation and deploy them to our physical robot dog chassis.',
    status: 'open',
    applicants_count: 8,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    project_id: 'post-5'
  },
  {
    id: 'collab-3',
    creator: INITIAL_PROFILES[1],
    project_title: 'Procedural Metaverse World Editor',
    category: 'Creative & 3D Art',
    role_needed: 'Rust / WebAssembly Systems Programmer',
    skills_required: ['Rust', 'Wasm', 'WebGPU', 'Multithreading'],
    description: 'Building a browser-native voxel and terrain editor. Need an engineer experienced with spatial partitioning algorithms (Octrees/BVH) in Rust.',
    status: 'open',
    applicants_count: 3,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    project_id: 'post-2'
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    user_id: 'user-001',
    media_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    media_type: 'image',
    caption: 'Live coding the new responsive tokens engine in PrismUI ðŸš€',
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
    caption: 'Benchmarking WebGPU raymarching shaders on M3 Max GPU: 120 FPS locked! âš¡',
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
  { id: '5', name: 'robotics', post_count: 8120, category: 'Robotics & Embedded' },
  { id: '6', name: 'opensource', post_count: 15300, category: 'Software & Web' },
  { id: '7', name: 'fullstack', post_count: 12800, category: 'Software & Web' },
  { id: '8', name: 'uiux', post_count: 16900, category: 'UI/UX & Product Design' },
  { id: '9', name: 'embedded', post_count: 5400, category: 'Hardware & IoT' },
  { id: '10', name: 'casestudy', post_count: 8400, category: 'Research & Case Studies' }
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
    post: INITIAL_POSTS[4]
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
    post: INITIAL_POSTS[4]
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
    content: 'Hey Jordan! Checked out your CraftPlus project showcase. The PostgreSQL Row-Level Security architecture is super clean. Would love to collaborate on adding interactive 3D WebGL cards to the feed!',
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


