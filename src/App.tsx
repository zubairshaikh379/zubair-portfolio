import React, { useState, useEffect, Suspense, useRef, Component, ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useInView } from 'motion/react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Shield, 
  Terminal, 
  Code, 
  Lock, 
  ChevronRight,
  Monitor,
  Cpu,
  Globe,
  Database,
  Search,
  Activity
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { cn } from './lib/utils';

// --- Components ---

const SkillCategory = ({ title, skills }: { title: string, skills: string[] }) => (
  <div className="mb-12">
    <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
      {title} <div className="h-[1px] flex-1 bg-zinc-900" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {skills.map((skill) => (
        <motion.div 
          key={skill}
          whileHover={{ x: 5, color: '#fff' }}
          className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest flex items-center gap-3 group cursor-default transition-colors"
        >
          <div className="w-1 h-1 bg-zinc-800 rounded-full group-hover:scale-150 group-hover:bg-white transition-all" />
          {skill}
        </motion.div>
      ))}
    </div>
  </div>
);

// --- Global Loader Lock to prevent Spline Buffer Overlaps ---
let globalSplineLoading = false;
let splineQueue: (() => void)[] = [];

const processSplineQueue = () => {
  if (splineQueue.length > 0 && !globalSplineLoading) {
    const next = splineQueue.shift();
    if (next) next();
  }
};

const LazySpline = ({ scene, zoom = 1, delay = 2000 }: { scene: string, zoom?: number, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 }); // Increased threshold
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isInView && !shouldLoad) {
      const queueLoad = () => {
        if (!isMounted.current) return;
        globalSplineLoading = true;
        // Longer initial sleep to ensure previous scene is fully disposed by browser
        setTimeout(() => {
          if (isMounted.current) setShouldLoad(true);
        }, 800);
      };

      splineQueue.push(queueLoad);
      // Extra delay between processed items
      const timeout = setTimeout(processSplineQueue, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, shouldLoad]);

  return (
    <div ref={ref} className="w-full h-full relative">
      <AnimatePresence>
        {!loaded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#050505]/10 backdrop-blur-md z-10"
          >
             <div className="flex flex-col items-center gap-4">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
               <div className="font-mono text-[8px] text-zinc-500 uppercase tracking-[0.8em]">Syncing_Buffer...</div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      {shouldLoad && (
        <ErrorBoundary onReset={() => {
          globalSplineLoading = false;
          processSplineQueue();
        }}>
          <Suspense fallback={null}>
            <Spline 
              key={scene} 
              scene={scene} 
              onLoad={(spline) => {
                if (zoom !== 1) spline.setZoom(zoom);
                if (isMounted.current) setLoaded(true);
                globalSplineLoading = false;
                processSplineQueue();
              }}
              onError={() => {
                globalSplineLoading = false;
                processSplineQueue();
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Spline Runtime Error Caught:", error.message);
    if (this.props.onReset) this.props.onReset();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-zinc-950/20 flex items-center justify-center">
          <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-800">
            [RUNTIME_SYNC_FAILED]
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Multi-Layer Cinematic Snowfall ---
const Snowfall = () => {
  const [layers, setLayers] = useState<any[]>([]);

  useEffect(() => {
    const generateLayer = (count: number, speedMult: number, opacityMult: number, sizeMult: number, wind: number) => {
      return Array.from({ length: count }).map((_, i) => ({
        id: Math.random(),
        x: Math.random() * 140 - 20,
        size: (Math.random() * 5 + 1) * sizeMult,
        duration: (Math.random() * 8 + 12) / speedMult,
        delay: Math.random() * -40,
        opacity: (Math.random() * 0.8 + 0.2) * opacityMult,
        blur: sizeMult > 2.5 ? '12px' : sizeMult > 1.2 ? '3px' : '0px',
        swayX: wind * (Math.random() * 60 + 40),
        pulse: Math.random() * 2 + 1,
      }));
    };

    setLayers([
      ...generateLayer(60, 0.4, 0.2, 0.3, 1),   // Distant Background
      ...generateLayer(40, 0.8, 0.5, 1.2, 1.8), // Midground
      ...generateLayer(18, 1.6, 0.4, 10.0, 5),  // Cinematic Foreground (Big, Bold, Glow)
    ]);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden mix-blend-screen opacity-70">
      {layers.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
          style={{
            left: `${flake.x}%`,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            filter: `blur(${flake.blur})`,
            boxShadow: flake.size > 15 ? '0 0 40px rgba(255,255,255,0.5)' : 'none',
          }}
          animate={{
            y: ['-25vh', '125vh'],
            x: [`${flake.x}%`, `${flake.x + (flake.swayX / 8)}%`],
            opacity: [flake.opacity, flake.opacity * 0.4, flake.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "linear",
            opacity: { duration: flake.pulse, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
};

// --- Preloader Component ---
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [counter, setCounter] = useState(0);
  const [logs, setLogs] = useState<{ id: string; text: string }[]>([]);
  
  const logEntries = [
    "Vesting_Encrypted_Protocol...",
    "Initializing_Kernel_Space...",
    "Bypassing_Shadow_DOM...",
    "Handshaking_Secure_Socket...",
    "Loading_Asset_Buffer(0x7F)...",
    "Mapping_3D_Coordinates...",
    "Optimizing_Render_Pipeline...",
    "Identity_Verified(Zubair)...",
    "System_Stable. Ready."
  ];

  useEffect(() => {
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logEntries.length) {
        setLogs(prev => {
          const newEntry = { 
            id: `${logEntries[logIndex]}-${logIndex}-${Math.random().toString(36).substr(2, 9)}`, 
            text: logEntries[logIndex] 
          };
          return [...prev.slice(-4), newEntry];
        });
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 350);

    const counterInterval = setInterval(() => {
      setCounter((prev) => {
        if (prev >= 100) {
          clearInterval(counterInterval);
          setTimeout(onComplete, 1500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 30);

    return () => {
      clearInterval(logInterval);
      clearInterval(counterInterval);
    };
  }, [onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent)]" />
      
      <div className="w-full max-w-7xl flex flex-col gap-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.4em] leading-loose min-h-[100px]">
            <AnimatePresence mode="popLayout">
              {logs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className={i === logs.length - 1 ? "text-white" : "opacity-40"}
                >
                  {`> ${log.text}`}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="font-sans font-black text-8xl md:text-[18vw] tracking-tighter leading-[0.7] italic select-none">
            {counter}<span className="text-zinc-900 text-[10vw] not-italic opacity-50">%</span>
          </div>
        </div>

        <div className="w-full h-1 bg-zinc-900 overflow-hidden relative rounded-full">
          <motion.div 
            className="h-full bg-white relative z-10 shadow-[0_0_20px_rgba(255,255,255,1)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: counter / 100 }}
            style={{ originX: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 35 }}
          />
          {/* High-speed Cinematic Gleam */}
          <motion.div 
            className="absolute top-0 left-0 h-full w-[20%] bg-gradient-to-r from-transparent via-white to-transparent z-20 opacity-80"
            animate={{ 
              x: ['-100%', '600%'] 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        </div>

        <div className="flex justify-between items-start font-mono text-[8px] text-zinc-700 uppercase tracking-[0.6em]">
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              LIVE_NODE
            </span>
            <span>AIS_BUILD_V3.3</span>
          </div>
          <div className="text-right">
            MUMBAI_SEC // 19.0760 N, 72.8777 E
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- 3D Interactive Typography ---
const TiltText = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * -35, y: x * 35 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => setIsHovered(true);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{ 
        rotateX: rotate.x, 
        rotateY: rotate.y,
        scale: isHovered ? 1.02 : 1 
      }}
      style={{ 
        perspective: 1500, 
        transformStyle: "preserve-3d" 
      }}
      className={cn("cursor-default relative flex items-center justify-center py-4", className)}
    >
      <div 
        style={{ transform: "translateZ(80px)" }}
        className="relative z-10"
      >
        {children}
      </div>
      
      {/* 3D Depth Shadow */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.15,
              x: rotate.y * -0.5,
              y: rotate.x * -0.5
            }}
            exit={{ opacity: 0 }}
            style={{ 
              transform: "translateZ(-40px) scale(0.95)",
              filter: "blur(20px)"
            }}
            className="absolute inset-0 bg-white rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Reusable UI ---
const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, .interactive')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white pointer-events-none z-50 mix-blend-difference hidden md:block"
        animate={{
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          scale: isHovering ? 2.5 : 1,
          backgroundColor: isHovering ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0)"
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
        animate={{
          x: mousePos.x - 3,
          y: mousePos.y - 3,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 500, mass: 0.1 }}
      />
    </>
  );
};

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-40 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm md:backdrop-blur-none"
    >
      <div className="font-sans font-black text-xl md:text-2xl tracking-tighter mix-blend-difference">
        ZUBAIR<span className="text-zinc-500">.</span>
      </div>
      
      <div className="flex gap-4 md:gap-12 text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] font-extrabold text-zinc-400">
        <a href="#work" className="hover:text-white transition-colors duration-300">Work.</a>
        <a href="#arsenal-skills" className="hover:text-white transition-colors duration-300">Core.</a>
        <a href="#visuals" className="hover:text-white transition-colors duration-300">Gallery.</a>
        <a href="#about" className="hover:text-white transition-colors duration-300">Bio.</a>
        <a href="#contact" className="hover:text-white transition-colors duration-300">Connect.</a>
      </div>
    </motion.nav>
  );
};

const ExperienceItem = ({ role, company, period, description, location, tags }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    className="group border-b border-zinc-900 py-20 flex flex-col md:flex-row md:items-start justify-between gap-12"
  >
    <div className="flex-1">
      <div className="text-[10px] font-black text-zinc-700 mb-6 uppercase tracking-[0.4em] flex items-center gap-4">
        {period} <span className="w-10 h-px bg-zinc-800" /> {location}
      </div>
      <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter group-hover:pl-6 transition-all duration-700 ease-out">{role}</h3>
      <div className="text-2xl text-zinc-400 mt-3 font-medium opacity-60"> @ {company}</div>
      <div className="flex flex-wrap gap-3 mt-8">
        {tags?.map((tag: string) => (
          <span key={tag} className="text-[9px] uppercase tracking-[0.2em] border border-zinc-800/50 px-4 py-1.5 rounded-full text-zinc-500 hover:border-zinc-500 transition-colors">{tag}</span>
        ))}
      </div>
    </div>
    <div className="md:max-w-md text-zinc-500 leading-loose font-light text-lg tracking-wide group-hover:text-zinc-300 transition-colors">
      {description}
    </div>
  </motion.div>
);

// --- Main Page ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const loadingRef = useRef(false);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const email = "zs657537@gmail.com";
    navigator.clipboard.writeText(email);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 3000);
    window.location.href = `mailto:${email}`;
  };
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const yParallaxFast = useTransform(scrollYProgress, [0, 1], [0, 600]);

  const handleLoadingComplete = React.useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(false);
  }, []);

  return (
    <div className="relative bg-[#050505] text-[#fafafa] font-sans selection:bg-white selection:text-black min-h-screen overflow-x-hidden antialiased">
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {showCopyToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-white text-black px-6 py-3 rounded-full font-mono text-[10px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Email copied to clipboard_
          </motion.div>
        )}
      </AnimatePresence>

      <CustomCursor />
      <Snowfall />
      <Navbar />
      
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-white origin-left z-50"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25 scale-110">
           <LazySpline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" zoom={0.8} />
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1 }}
          >
            <span className="px-6 py-2 border border-zinc-800 rounded-full text-[10px] uppercase font-bold tracking-[0.6em] text-zinc-600 backdrop-blur-md mb-12 block">
              Identity_Integrity_Security
            </span>
          </motion.div>

          <TiltText>
            <motion.h1
              style={{ y: yParallax }}
              className="text-[18vw] md:text-[14vw] font-black uppercase tracking-tighter leading-[0.8] text-center filter contrast-150 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative"
            >
              <span className="block overflow-visible">
                {"ZUBAIR".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ x: i % 2 === 0 ? "-20%" : "20%", opacity: 0 }}
                    animate={!loading ? { x: 0, opacity: 1 } : {}}
                    transition={{ 
                      duration: 1.5, 
                      ease: [0.16, 1, 0.3, 1], 
                      delay: 0.6 + (i * 0.08) 
                    }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>

              {/* Central Buffer Line */}
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={!loading ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ duration: 1.5, delay: 1.2 }}
                className="flex items-center justify-center gap-4 py-2"
              >
                <div className="h-[1px] w-12 md:w-24 bg-zinc-800" />
                <div className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                  <span className="font-mono text-[7px] md:text-[9px] text-zinc-500 uppercase tracking-[0.8em]">Syncing_Buffer...</span>
                </div>
                <div className="h-[1px] w-12 md:w-24 bg-zinc-800" />
              </motion.div>
              
              <span className="block overflow-visible text-zinc-900 text-stroke">
                {"SHAIKH".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ x: i % 2 === 0 ? "20%" : "-20%", opacity: 0 }}
                    animate={!loading ? { x: 0, opacity: 1 } : {}}
                    transition={{ 
                      duration: 1.5, 
                      ease: [0.16, 1, 0.3, 1], 
                      delay: 1.0 + (i * 0.08) 
                    }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            </motion.h1>
          </TiltText>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-20 flex flex-col md:flex-row items-center gap-16 text-zinc-500"
          >
            <div className="text-center md:text-left group">
              <span className="block text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-3 group-hover:text-zinc-500 transition-colors">Core_Specialization</span>
              <p className="text-xl font-light italic tracking-tight">Cybersecurity Analyst & Full Stack Alchemist</p>
            </div>
            <div className="w-px h-16 bg-zinc-900 hidden md:block" />
            <div className="text-center md:text-left group">
              <span className="block text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-3 group-hover:text-zinc-500 transition-colors">Current_Academic</span>
              <p className="text-xl font-light tracking-tight">BCA Finalist @ Mumbai University — 2025</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Banner */}
      <section className="bg-zinc-900 text-zinc-400 border-y border-white/5 py-16 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1500] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="flex gap-32 items-center text-xs font-black uppercase tracking-[1em] whitespace-nowrap"
        >
          <span>IIT BOMBAY CERTIFIED (Python 3.4.3)</span>
          <span>•</span>
          <span>ACTIVE CYBERSECURITY EXPLORER</span>
          <span>•</span>
          <span>FULL STACK AGNOSTIC ARCHITECT</span>
          <span>•</span>
          <span>VULNERABILITY ASSESSMENT EXPERT</span>
          <span>•</span>
          <span>IIT BOMBAY CERTIFIED (Python 3.4.3)</span>
        </motion.div>
      </section>

      {/* Experience Section */}
      <section id="work" className="relative py-40 md:py-72 px-6 max-w-7xl mx-auto">
        <div className="absolute top-1/2 -right-[20%] w-full h-[150%] opacity-10 pointer-events-none transform -translate-y-1/2 rotate-12">
           <LazySpline scene="https://prod.spline.design/qZ7XW1b2z7P4jI-m/scene.splinecode" />
        </div>

        <div className="mb-40 relative z-10">
          <TiltText>
            <h2 className="text-[10vw] font-black uppercase tracking-tighter leading-none mb-6">Pathways.</h2>
          </TiltText>
          <p className="text-zinc-500 tracking-[0.5em] uppercase text-[10px] font-bold">Operational History & Milestones</p>
        </div>
        
        <div className="space-y-6 relative z-10">
          <ExperienceItem 
            role="Technical / Data Science Trainee"
            company="INTTRVUU"
            period="06/2024 — 09/2024"
            location="Belapur, IN"
            tags={["XGBoost", "Predictive Modeling", "REST APIs", "Dashboards"]}
            description="Engineered a manufacturing quality prediction system achieving 80%+ accuracy using XGBoost. Integrated the backend with a real-time reactive dashboard for visual analytics."
          />
          <ExperienceItem 
            role="Assistant Python Trainer"
            company="Campus Credentials"
            period="01/2025 — 01/2025"
            location="Thane, IN"
            tags={["Mentorship", "Algorithms", "Pythonic Architecture"]}
            description="Mentored a cohort in core Python logic, system debugging, and algorithmic thinking. Developed training schemas focused on clean architectural patterns."
          />
          <ExperienceItem 
            role="Analyst"
            company="eClerx"
            period="09/2025 — 12/2025"
            location="Airoli, Mumbai"
            tags={["Log Analysis", "OSINT", "Technical Governance"]}
            description="Analyzed critical system logs to identify threat signatures and bottlenecks. Collaborated with offshore teams to maintain data integrity and compliance."
          />
        </div>
      </section>

      {/* Weaponry Grid (Bento) */}
      <section id="skills" className="py-40 px-6 bg-[#030303] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <TiltText>
              <h2 className="text-[7vw] font-black uppercase tracking-tighter leading-none">The Arsenal.</h2>
            </TiltText>
            <div className="text-right">
              <span className="text-zinc-700 font-mono text-[9px] uppercase tracking-[0.5em] block mb-2">Technical_Inventory</span>
              <div className="text-zinc-500 font-light italic">State-of-the-art tools and frameworks.</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-screen lg:h-[1100px] mb-32">
             <motion.div 
               whileHover={{ scale: 0.985 }}
               className="md:col-span-8 bg-zinc-900/30 border border-zinc-800/50 p-8 md:p-16 rounded-[2.5rem] flex flex-col justify-between overflow-hidden relative group"
             >
                {/* Background Visual Overlay */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none">
                   <img 
                     src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200" 
                     className="w-full h-full object-cover grayscale"
                     alt="Security Grid Visual"
                   />
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-black flex items-center justify-center rounded-2xl mb-8 md:mb-12 shadow-2xl">
                    <Shield className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8">Security<br />Audit.</h3>
                  <p className="text-zinc-500 max-w-md text-lg md:text-xl font-light leading-relaxed md:leading-loose tracking-wide">
                    Extensive experience in packet inspection via Wireshark, active reconnaissance with Nmap, and protocol behavior mapping. Proficient in identifying network anomalies.
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 p-10 font-mono text-[9px] text-zinc-800 leading-loose select-none opacity-20 group-hover:opacity-60 transition-all hidden md:block">
                  {`[SECURE_SHELL] >> ACTIVE
                    [PROT] >> TCP/IP_V4
                    [SIG] >> CRYPT_AES_256
                    [PATH] >> /USR/LOG/SECURE
                    [LOG] >> AUTH_SUCCESS_ROOT`}
                </div>
             </motion.div>

             <motion.div 
                whileHover={{ scale: 0.985 }}
                className="md:col-span-4 bg-zinc-100 text-black p-8 md:p-16 rounded-[2.5rem] flex flex-col justify-between min-h-[300px] md:min-h-0 relative overflow-hidden group"
             >
                {/* Background Visual Overlay */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none">
                   <img 
                     src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200" 
                     className="w-full h-full object-cover"
                     alt="Coding Logic Visual"
                   />
                </div>

                <Terminal className="w-8 h-8 md:w-10 md:h-10 relative z-10" />
                <div className="relative z-10">
                   <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-none">Logic<br />Core.</h3>
                   <p className="text-zinc-600 text-sm md:text-base leading-relaxed">Python, Node.js, and Cloud Infrastructure. I engineer high-performance systems with a focus on immutability and scale.</p>
                </div>
             </motion.div>

             <motion.div 
                whileHover={{ scale: 0.985 }}
                className="md:col-span-4 bg-zinc-900/30 border border-zinc-800/50 p-16 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group"
             >  <img 
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200" 
                  alt="Tactics" 
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 group-hover:opacity-40 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Activity className="w-10 h-10 text-zinc-600" />
                <div>
                   <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Tactics.</h3>
                   <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-full font-black tracking-widest group-hover:bg-white group-hover:text-black transition-colors">CYBER_DEFENSE_LABS</span>
                </div>
             </motion.div>

             <motion.div 
                whileHover={{ scale: 0.985 }}
                className="md:col-span-8 bg-zinc-900/50 rounded-[2.5rem] overflow-hidden relative group border border-zinc-800/50"
             >
                <img 
                  src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200" 
                  alt="Identity" 
                  className="w-full h-full object-cover grayscale opacity-30 group-hover:scale-105 group-hover:opacity-50 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-16">
                   <h3 className="text-5xl font-black uppercase tracking-tighter leading-none">Perspective.</h3>
                   <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.5em] mt-4">Alpine Clearances & Structural Vision</p>
                </div>
             </motion.div>
          </div>

          {/* GitHub Projects Integration */}
          <div className="mt-40">
             <div className="flex items-center gap-6 mb-16 px-4">
                <Github className="w-8 h-8 text-zinc-700" />
                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">System_Manifest</h3>
                <div className="h-[1px] flex-1 bg-zinc-900 hidden md:block" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "QUALITY_PREDICT", desc: "Manufacturing quality rating system using XGBoost & predictive analytics.", icon: Database, link: "https://github.com/zubairshaikh379/Manufacturing_Product_Quality_Rating_Prediction_Website", tags: ["ML", "Python"] },
                  { name: "TRADING_BOT", desc: "Automated Binance futures trading bot with advanced risk management.", icon: Activity, link: "https://github.com/zubairshaikh379/binance-futures-trading-bot", tags: ["API", "Bot"] },
                  { name: "SIEM_LAB", desc: "Local security information and event management lab for threat monitoring.", icon: Shield, link: "https://github.com/zubairshaikh379/local-siem-lab", tags: ["Security", "Logs"] },
                  { name: "SECURE_PORT", desc: "Recursive 3D portfolio architecture (this project's source code).", icon: Code, link: "https://github.com/zubairshaikh379/zubair-portfolio", tags: ["React", "Spline"] }
                ].map((project, i) => (
                  <motion.div 
                    key={project.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] hover:border-zinc-600 transition-all group flex flex-col h-full"
                  >
                     <div className="flex justify-between items-start mb-10">
                        <div className="p-3 bg-zinc-900 rounded-2xl group-hover:bg-white group-hover:text-black transition-colors">
                           <project.icon className="w-6 h-6" />
                        </div>
                        <div className="flex gap-1.5">
                           {project.tags.map(tag => (
                             <span key={tag} className="text-[6px] font-mono text-zinc-600 border border-zinc-900 px-1.5 py-0.5 rounded">
                               {tag}
                             </span>
                           ))}
                        </div>
                     </div>
                     <h4 className="text-xl font-black uppercase tracking-tight mb-3">{project.name}</h4>
                     <p className="text-zinc-500 text-[12px] leading-relaxed mb-10 font-light flex-grow">{project.desc}</p>
                     <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors group/btn">
                        Source_Link <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                     </a>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section (Skills) */}
      <section id="arsenal-skills" className="py-40 px-6 bg-[#050505] relative border-t border-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
            <div className="md:col-span-4">
               <TiltText className="justify-start">
                 <h2 className="text-7xl md:text-[6vw] font-black uppercase tracking-tighter leading-none mb-12">Spec.<br />Sheet.</h2>
               </TiltText>
               <p className="text-zinc-500 font-light italic text-lg max-w-sm mb-12">
                 Mapping the technical stack across the three pillars of my digital existence: Engineering, Security, and Analytics.
               </p>
               <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-3xl">
                  <div className="text-[10px] font-mono text-zinc-600 mb-4 tracking-widest uppercase">Encryption_Level</div>
                  <div className="flex items-center gap-4 mb-4">
                     <Lock className="w-5 h-5 text-zinc-500" />
                     <div className="h-1 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-white" 
                          initial={{ width: 0 }}
                          whileInView={{ width: '85%' }}
                          transition={{ duration: 2, delay: 0.5 }}
                        />
                     </div>
                     <span className="text-[10px] font-mono">85%</span>
                  </div>
                  <p className="text-[9px] text-zinc-800 font-mono uppercase tracking-widest">Calculated_Against_Current_Industry_Baselines</p>
               </div>
            </div>

            <div className="md:col-span-8">
               <div className="space-y-20">
                  <SkillCategory 
                    title="SYNTAX_ENGINEERING" 
                    skills={["Python", "Node.js", "Next.js", "React", "Javascript", "HTML", "CSS", "REST API's", "Git", "Github"]} 
                  />
                  <SkillCategory 
                    title="CYBER_OPERATIONS" 
                    skills={["Linux Kernel", "VMware Hypervisor", "TCP/IP & HTTPS", "Network Monitoring", "Wireshark", "Nmap", "Log Analysis", "Wazuh", "Splunk"]} 
                  />
                  <SkillCategory 
                    title="SYSTEM_ARCHITECTURE" 
                    skills={["PostgreSQL", "MYSQL", "Mongo DB (Lite)", "Linear Regression", "Decision Tree", "Random Forest", "XGBOOST", "K-Means Clustering", "Data Visualization", "Machine Learning"]} 
                  />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visuals Archive Section */}
      <section id="visuals" className="py-40 md:py-72 px-6 bg-[#030303] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-32">
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4 block">Visual_Data_Archive</span>
            <TiltText>
              <h2 className="text-[10vw] font-black uppercase tracking-tighter leading-none mb-6">Fragments.</h2>
            </TiltText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              /* REPLACE_IMAGES: Fragments Gallery - Update urls to local paths e.g., "/photo1.jpg" */
              { id: 1, title: "ACADEMIC_FRAME", url: "/Degree_img.jpg", desc: "Structural Identity" },
              { id: 2, title: "TOP_VIEW", url: "/Sunlight2_img.jpg", desc: "Logic & Presence" },
              { id: 3, title: "BALCONY_PERSPECTIVE", url: "/Ladakh_img.jpg", desc: "Summit Operations" },
              { id: 4, title: "MOUNTAIN_TRANSIT", url: "/Mountain_img.jpg", desc: "Network Expansion" }
            ].map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-900/50"
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-[8px] font-mono text-zinc-500 mb-2 tracking-widest">{`[ARCHIVE_0${img.id}]`}</div>
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-1">{img.title}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-700">{img.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-zinc-800 font-mono text-[9px] uppercase tracking-[0.8em]">Capture_The_Moment_Protect_The_Process</p>
          </div>
        </div>
      </section>

      {/* Identity Section */}
      <section id="about" className="py-40 md:py-72 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-32 items-center">
          <div className="relative group">
             <div className="overflow-hidden rounded-[2rem] aspect-[4/5] relative z-10 filter grayscale group-hover:grayscale-0 transition-all duration-1000 border border-zinc-900">
                {/* REPLACE_IMAGE: Main Portrait - Update src to your local path e.g., "/me.jpg" */}
                <img 
                  src="/Blackshirt_img.jpg" 
                  alt="Zubair Portrait" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                />
             </div>
             <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -right-12 bottom-12 bg-white text-black p-10 rounded-3xl hidden lg:block shadow-[-20px_20px_60px_rgba(0,0,0,0.5)] z-20"
             >
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 block mb-2">Subject_Record</span>
                <div className="text-3xl font-black uppercase tracking-tighter">Zubair Shaikh</div>
                <div className="mt-4 flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <div className="text-[10px] font-bold uppercase opacity-60">Status: Verified</div>
                </div>
             </motion.div>
          </div>

          <div>
             <TiltText>
               <motion.h2 
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-16"
               >
                 Depth<br />Beyond<br />Surfaces.
               </motion.h2>
             </TiltText>
             <p className="text-2xl text-zinc-500 font-light leading-relaxed mb-16 max-w-md tracking-tight">
                Engineering at the intersection of technical precision and human behavioral logic. For me, code is the canvas, and security is the frame that protects the masterpiece.
             </p>
             
             <div className="grid grid-cols-1 gap-8">
                <div className="group border-b border-zinc-900 pb-6 flex justify-between items-center cursor-default">
                   <span className="text-zinc-700 font-mono text-xs group-hover:text-white transition-colors tracking-widest">01 Academic</span>
                   <span className="text-xl font-black tracking-tighter uppercase group-hover:pl-4 transition-all tracking-widest">BCA BELAPUR 2025</span>
                </div>
                <div className="group border-b border-zinc-900 pb-6 flex justify-between items-center cursor-default">
                   <span className="text-zinc-700 font-mono text-xs group-hover:text-white transition-colors tracking-widest">02 Origin</span>
                   <span className="text-xl font-black tracking-tighter uppercase group-hover:pl-4 transition-all tracking-widest">MUMBAI NATIVE</span>
                </div>
                <div className="group border-b border-zinc-900 pb-6 flex justify-between items-center cursor-default">
                   <span className="text-zinc-700 font-mono text-xs group-hover:text-white transition-colors tracking-widest">03 Ethics</span>
                   <span className="text-xl font-black tracking-tighter uppercase group-hover:pl-4 transition-all tracking-widest">CYBER_DEFENDER</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Dynamic Footer Section */}
      <section id="contact" className="py-48 px-6 border-t border-zinc-900 overflow-hidden relative min-h-screen flex items-center justify-center bg-[#010101]">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transform scale-125">
           <LazySpline scene="https://prod.spline.design/79r26857F3A5X980/scene.splinecode" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring" }}
            className="mb-16"
          >
            <button 
              onClick={handleEmailClick}
              className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-50 backdrop-blur-xl group cursor-pointer hover:border-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
               <Mail className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>
          
          <TiltText>
            <h2 className="text-7xl md:text-[14vw] font-black uppercase tracking-tighter leading-none mb-24">Pulse.</h2>
          </TiltText>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl mb-32">
             <motion.div 
               whileHover={{ y: -10 }}
               className="bg-zinc-900/40 p-10 rounded-[2rem] border border-zinc-800 text-left group"
             >
                <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-6">Direct_Channel</div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white group-hover:text-blue-400 transition-colors">Start a project?</h3>
                <p className="text-zinc-500 mb-8 font-light italic">Currently accepting selected collaborations for 2024/25.</p>
                <button 
                  onClick={handleEmailClick}
                  className="inline-flex items-center gap-3 text-white font-bold uppercase tracking-widest text-[10px] bg-white/5 hover:bg-white hover:text-black px-6 py-3 rounded-full transition-all"
                >
                  zs657537@gmail.com <ChevronRight className="w-4 h-4" />
                </button>
             </motion.div>

             <motion.div 
               whileHover={{ y: -10 }}
               className="bg-zinc-100 p-10 rounded-[2rem] text-left group"
             >
                <div className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest mb-6 text-black/40">Secure_Network</div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black">Social Sync.</h3>
                <p className="text-zinc-600 mb-8 font-light">Join the recursive loop on professional networks.</p>
                <div className="flex gap-4">
                   <a href="https://linkedin.com/in/zubair-shaikh-6779a432a/" target="_blank" className="p-3 bg-black text-white rounded-xl hover:scale-110 transition-transform"><Linkedin className="w-5 h-5" /></a>
                   <a href="https://github.com/zubairshaikh379" target="_blank" className="p-3 bg-black text-white rounded-xl hover:scale-110 transition-transform"><Github className="w-5 h-5" /></a>
                   <button 
                     onClick={handleEmailClick}
                     className="p-3 bg-black text-white rounded-xl hover:scale-110 transition-transform cursor-pointer"
                   >
                     <Mail className="w-5 h-5" />
                   </button>
                </div>
             </motion.div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-16 md:gap-32 opacity-40 hover:opacity-100 transition-opacity">
             <button 
               onClick={handleEmailClick}
               className="text-xl font-black uppercase tracking-tighter hover:text-blue-500 transition-all hover:tracking-[0.1em] interactive leading-none cursor-pointer"
             >
                COMM_GMAIL_
             </button>
             <a href="https://linkedin.com/in/zubair-shaikh-6779a432a/" target="_blank" rel="noopener noreferrer" className="text-xl font-black uppercase tracking-tighter hover:text-blue-700 transition-all hover:tracking-[0.1em] interactive leading-none">AUTH_LINKEDIN_</a>
             <a href="https://github.com/zubairshaikh379" target="_blank" rel="noopener noreferrer" className="text-xl font-black uppercase tracking-tighter hover:text-zinc-500 transition-all hover:tracking-[0.1em] interactive leading-none">ROOT_GITHUB_</a>
          </div>

          <div className="mt-60 font-mono text-[9px] text-zinc-800 uppercase tracking-[0.8em]">
            HANDCRAFTED_FOR_THE_SECURE_ERA — ZUBAIR_SHAIKH_V3.2 — ©2024
          </div>
        </div>
        
        <motion.div 
          style={{ x: yParallaxFast }}
          className="absolute -bottom-10 left-0 text-[20vw] font-black uppercase tracking-tighter text-white/5 opacity-10 select-none pointer-events-none leading-none whitespace-nowrap"
        >
          GLOBAL.SECURE.TRANSIT.CORE
        </motion.div>
      </section>
    </div>
  );
}
