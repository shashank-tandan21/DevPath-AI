import { useState, useEffect } from 'react';
import { BookOpen, Clock, ChevronRight, Search, Filter, Lock, CheckCircle, Brain, Zap, Terminal, ChevronLeft, Trash2, LayoutGrid, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";

const categoryColors: Record<string, string> = {
  JavaScript: '#6366f1',
  React: '#06b6d4',
  Python: '#10b981',
  HTML: '#e44d26',
  CSS: '#264de4',
  General: '#6366f1',
};

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_time_minutes: number;
  category: string;
  source_video_id: string;
  created_at?: string;
  content: {
    raw_markdown?: string;
    learning_objectives?: string[];
    key_concepts?: string[];
  };
}

export default function StructuredLessonsDashboard({
  mode = 'learn',
  activeModuleId,
  onStartQuiz,
  onStartCodingTasks,
  onStartGuidedLearning,
  onBackToVideo
}: {
  mode?: 'learn' | 'practice';
  activeModuleId?: string | null;
  onStartQuiz: (id: string) => void;
  onStartCodingTasks: (id: string) => void;
  onStartGuidedLearning: (id: string) => void;
  onBackToVideo: () => void;
}) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetch('/api/tutorial-modules')
      .then(res => res.json())
      .then(data => {
        setModules(data || []);
      })
      .catch(err => {
        console.error('Failed to fetch modules', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the module "${title}"?`)) return;
    try {
      const res = await fetch(`/api/tutorial-modules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setModules(prev => prev.filter(m => m.id !== id));
      } else {
        alert("Failed to delete module");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting module");
    }
  };

  const filtered = modules
    .filter(m => {
      const matchesSearch = (m.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === 'All' || m.category === activeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const categories = ['All', ...Array.from(new Set(modules.map(m => m.category || 'General')))];

  return (
    <div className="space-y-10 fade-in min-h-full flex flex-col max-w-7xl mx-auto w-full pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <LayoutGrid size={22} />
            </div>
            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-muted-foreground/60">Hub</h2>
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight leading-[0.9]">
            {mode === 'practice' ? (
              <>Practice <br /><span className="text-gradient">Grounds</span></>
            ) : (
              <>Learning <br /><span className="text-gradient">Modules</span></>
            )}
          </h1>
          <p className="text-muted-foreground max-w-md font-medium text-lg border-l-2 border-primary/20 pl-4 py-1">
            {isLoading ? 'Decrypting your knowledge library...' : `You have unlocked ${filtered.length} advanced skill paths.`}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-7 rounded-[1.25rem] text-lg font-black flex items-center gap-3 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
            onClick={onBackToVideo}
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 translate-y-1 group-hover:translate-y-0 transition-transform" />
            <Zap size={22} className="fill-current" /> GENERATE NEW MODULE
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row items-center gap-6 bg-secondary/10 p-2 rounded-[2rem] border border-border/50 backdrop-blur-md">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search path, concept, or tech..."
            className="w-full bg-transparent border-none rounded-2xl pl-16 pr-6 py-5 text-base font-bold outline-none placeholder:text-muted-foreground/30"
          />
        </div>
        <div className="h-10 w-px bg-border/50 hidden lg:block" />
        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-2 lg:pb-0 w-full lg:w-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap border-2 ${activeFilter === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20'
                  : 'bg-transparent text-muted-foreground border-border/40 hover:border-primary/30 hover:text-foreground'
                }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground min-h-[400px]">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-[6px] border-primary/10" />
            <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-4 rounded-full border-[6px] border-primary/30 border-b-transparent animate-spin-slow" />
          </div>
          <p className="font-display font-black text-xl tracking-[0.2em] animate-pulse">SYNCING DATABYTES...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center p-20 glass-strong rounded-[3rem] border-2 border-border/50 border-dashed min-h-[500px] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="w-28 h-28 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-10 shadow-inner group relative">
            <div className="absolute inset-0 bg-primary/20 rounded-[2rem] animate-ping opacity-20" />
            <Brain size={56} className="text-primary relative z-10" />
          </div>
          <h2 className="text-4xl font-black font-display mb-6 tracking-tight">System Optimized. <br />Data Required.</h2>
          <p className="text-muted-foreground max-w-sm mb-12 text-lg font-medium leading-relaxed opacity-80">
            Paste a tutorial URL to transform raw pixels into a structured masterclass.
          </p>
          <Button
            size="lg"
            className="bg-primary px-10 py-8 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-110 active:scale-95 glow-primary"
            onClick={onBackToVideo}
          >
            <Zap size={24} className="fill-current mr-3" /> INITIALIZE CORE
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((module, idx) => {
              const catColor = categoryColors[module.category] || categoryColors.General;
              const isActive = activeModuleId === module.id;

              return (
                <motion.div
                  layout
                  key={module.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.05,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                  className={`group relative flex flex-col h-full bg-secondary/5 border-2 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] active:scale-[0.98] ${isActive ? 'border-primary shadow-2xl shadow-primary/20 bg-primary/5' : 'border-border/30 hover:border-primary/50'
                    }`}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100%] transition-all duration-700 group-hover:w-full group-hover:h-full group-hover:rounded-none group-hover:opacity-5 pointer-events-none" />

                  <div className="p-10 flex-1 flex flex-col relative z-10 h-full">
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex gap-2.5">
                        <div className="px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border-2 flex items-center gap-2" style={{ borderColor: `${catColor}40`, color: catColor }}>
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: catColor }} />
                          {module.category}
                        </div>
                        <div className="px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/5 text-foreground/50 border border-white/5">
                          {module.difficulty}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, module.id, module.title)}
                        className="text-muted-foreground/30 hover:text-destructive transition-all p-2.5 rounded-2xl hover:bg-destructive/10 backdrop-blur-sm"
                        title="Delete Roadmap"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 mb-10">
                      <h3 className="font-display font-black text-3xl leading-[1.05] tracking-tight mb-4 group-hover:text-primary transition-all duration-500">
                        {module.title}
                      </h3>
                      <p className="text-muted-foreground/70 font-medium text-sm leading-relaxed line-clamp-3 group-hover:text-foreground/80 transition-colors">
                        {module.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-10 font-black text-[10px] tracking-widest text-muted-foreground/40 border-t border-border/30 pt-8">
                      <div className="flex items-center gap-2.5 group-hover:text-foreground transition-colors">
                        <Clock size={16} className="text-primary/60" />
                        <span>{module.estimated_time_minutes} MIN</span>
                      </div>
                      <div className="flex items-center gap-2.5 group-hover:text-foreground transition-colors">
                        <BookOpen size={16} className="text-secondary-foreground/60" />
                        <span>{module.content.learning_objectives?.length || 0} GOALS</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => onStartQuiz(module.id)}
                        className="flex items-center justify-center gap-3 bg-secondary/30 hover:bg-secondary/50 text-foreground px-5 py-4 rounded-2xl text-[11px] font-black transition-all hover:scale-[1.02] active:scale-95 border border-border/50 group/btn"
                      >
                        <Brain size={16} className="text-primary transition-transform group-hover/btn:scale-125" />
                        ANALYSIS
                      </button>
                      <button
                        onClick={() => onStartCodingTasks(module.id)}
                        className="flex items-center justify-center gap-3 bg-secondary/30 hover:bg-secondary/50 text-foreground px-5 py-4 rounded-2xl text-[11px] font-black transition-all hover:scale-[1.02] active:scale-95 border border-border/50 group/btn"
                      >
                        <Terminal size={16} className="text-blue-400 transition-transform group-hover/btn:scale-125" />
                        COMPILER
                      </button>
                      <button
                        onClick={() => onStartGuidedLearning(module.id)}
                        className="col-span-2 relative h-16 rounded-[1.25rem] bg-primary text-primary-foreground font-black text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/20 group/go overflow-hidden"
                      >
                        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/10 transition-all group-hover/go:h-full group-hover/go:bg-black/[0.02]" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          EXECUTE SYLLABUS <ChevronRight size={20} className="transition-transform group-hover/go:translate-x-1" />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
