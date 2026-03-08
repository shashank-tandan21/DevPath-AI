import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Bot, Send, Settings, Download, Plus, LayoutDashboard, Sun, Moon, MessageSquare, Loader2 } from "lucide-react";
import { useEffect } from 'react';

const getThemeStyles = (isDark: boolean) => {
  const baseShadow = isDark ? '0 4px 6px -1px rgb(0 0 0 / 0.6)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)';

  return {
    Process: {
      background: isDark ? '#262633' : '#ffffff',
      color: isDark ? '#f8fafc' : '#333333',
      borderColor: isDark ? '#47475e' : '#e2e8f0',
      boxShadow: isDark ? `0 0 8px rgba(71, 71, 94, 0.4), ${baseShadow}` : baseShadow
    },
    Start: {
      background: isDark ? '#065f46' : '#dcfce7',
      color: isDark ? '#a7f3d0' : '#166534',
      borderColor: isDark ? '#10b981' : '#86efac',
      boxShadow: isDark ? `0 0 10px rgba(16, 185, 129, 0.3), ${baseShadow}` : `0 0 8px rgba(34, 197, 94, 0.2), ${baseShadow}`
    },
    Display: {
      background: isDark ? '#1e40af' : '#dbeafe',
      color: isDark ? '#bfdbfe' : '#1e3a8a',
      borderColor: isDark ? '#60a5fa' : '#93c5fd',
      boxShadow: isDark ? `0 0 10px rgba(96, 165, 250, 0.3), ${baseShadow}` : `0 0 8px rgba(59, 130, 246, 0.2), ${baseShadow}`
    },
    Decision: {
      background: isDark ? '#78350f' : '#fef3c7',
      color: isDark ? '#fde68a' : '#92400e',
      borderColor: isDark ? '#f59e0b' : '#fcd34d',
      boxShadow: isDark ? `0 0 10px rgba(245, 158, 11, 0.3), ${baseShadow}` : `0 0 8px rgba(245, 158, 11, 0.2), ${baseShadow}`
    },
    Error: {
      background: isDark ? '#7f1d1d' : '#fee2e2',
      color: isDark ? '#fecaca' : '#991b1b',
      borderColor: isDark ? '#ef4444' : '#fca5a5',
      boxShadow: isDark ? `0 0 10px rgba(239, 68, 68, 0.3), ${baseShadow}` : `0 0 8px rgba(239, 68, 68, 0.2), ${baseShadow}`
    },
    End: {
      background: isDark ? '#334155' : '#f1f5f9',
      color: isDark ? '#cbd5e1' : '#334155',
      borderColor: isDark ? '#64748b' : '#cbd5e1',
      boxShadow: isDark ? `0 0 10px rgba(100, 116, 139, 0.3), ${baseShadow}` : `0 0 8px rgba(100, 116, 139, 0.2), ${baseShadow}`
    }
  };
};

const getBaseNodeStyle = () => ({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  padding: '12px 16px',
  width: 180,
  textAlign: 'center' as const,
});

// Fallback empty states
const emptyNodes: Node[] = [];
const emptyEdges: Edge[] = [];

const getEdgeOptions = (isDark: boolean) => ({
  animated: true,
  style: { stroke: isDark ? '#64748b' : '#94a3b8', strokeWidth: 2 },
  labelStyle: { fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, fontSize: 10 },
  labelBgPadding: [4, 4] as [number, number],
  labelBgBorderRadius: 4,
  labelBgStyle: { fill: isDark ? '#1e1e24' : '#f8fafc', stroke: isDark ? '#30303a' : '#e2e8f0' },
});

const initialEdges: Edge[] = [];

const ProjectFlowchart = ({ moduleId }: { moduleId: string | null }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const reactFlowWrapper = useRef(null);

  useEffect(() => {
    if (!moduleId) {
      setNodes(emptyNodes);
      setEdges(emptyEdges);
      return;
    }

    setIsLoading(true);
    fetch(`/api/tutorial-modules/${moduleId}/graph`)
      .then(res => {
        if (!res.ok) throw new Error("Graph not found");
        return res.json();
      })
      .then(data => {
        const theme = getThemeStyles(isDarkMode);
        const base = getBaseNodeStyle();

        if (!data.nodes || data.nodes.length === 0) {
          setNodes([{ id: 'error', position: { x: 250, y: 200 }, data: { label: 'No concept graph data available for this module.' }, style: base }]);
          setEdges([]);
          return;
        }

        const formattedNodes = data.nodes.map((n: any, i: number) => ({
          ...n,
          id: String(n.id),
          position: n.position || { x: 250 + (i % 2 * 200), y: 100 + (Math.floor(i / 2) * 150) },
          style: { ...base, ...theme[n.type as keyof typeof theme] || theme.Process },
          data: { label: n.label }
        }));

        setNodes(formattedNodes);
        setEdges((data.edges || []).map((e: any) => ({
          ...e,
          id: String(e.id),
          source: String(e.source),
          target: String(e.target),
          animated: true,
          style: { stroke: isDarkMode ? '#64748b' : '#94a3b8', strokeWidth: 2 }
        })));
      })
      .catch(err => {
        console.error("Failed to load graph:", err);
        setNodes([{
          id: 'error',
          position: { x: 250, y: 200 },
          data: { label: 'Failed to generate concept graph. Try analyzing the video again.' },
          style: { ...getBaseNodeStyle(), ...getThemeStyles(isDarkMode).Error }
        }]);
      })
      .finally(() => setIsLoading(false));
  }, [moduleId, isDarkMode, setNodes, setEdges]);

  // Update theme state
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = () => {
    const newNode: Node = {
      id: `new_node_${nodes.length + 1}`,
      data: { label: 'New Concept' },
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      style: { ...getBaseNodeStyle(), ...getThemeStyles(isDarkMode).Process }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const containerBg = isDarkMode ? 'bg-[#0f111a]' : 'bg-[#f8fafc]';
  const controlBg = isDarkMode ? 'bg-[#1e1e24]' : 'bg-white';
  const controlBorder = isDarkMode ? 'border-[#30303a]' : 'border-slate-200';
  const controlFill = isDarkMode ? 'fill-slate-300' : 'fill-slate-600';
  const controlHover = isDarkMode ? '[&>button:hover]:bg-[#2a2a35]' : '[&>button:hover]:bg-slate-50';

  const dotColor = isDarkMode ? '#334155' : '#cbd5e1';
  const miniMapBg = isDarkMode ? '#1e1e24' : '#ffffff';
  const miniMapMask = isDarkMode ? 'rgba(15, 17, 26, 0.7)' : 'rgba(248, 250, 252, 0.7)';
  const miniMapBorder = isDarkMode ? '#30303a' : '#e2e8f0';

  // Floating Header styles
  const headerBg = isDarkMode ? 'bg-[#1e1e24]/90' : 'bg-white/90';
  const headerBorder = isDarkMode ? 'border-[#30303a]' : 'border-slate-200';
  const headerText = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const btnHover = isDarkMode ? 'hover:bg-[#2a2a35]' : 'hover:bg-slate-100';
  const iconColor = isDarkMode ? 'text-slate-300' : 'text-slate-600';

  // Chat panel styles
  const chatPanelBg = isDarkMode ? 'bg-[#1e1e24]/95' : 'bg-white/95';
  const chatPanelBorder = isDarkMode ? 'border-[#30303a]' : 'border-slate-200';
  const chatHeaderBg = isDarkMode ? 'bg-[#18181b]/50' : 'bg-slate-50';
  const chatBubbleBg = isDarkMode ? 'bg-[#2a2a35]' : 'bg-slate-100';
  const chatBubbleBorder = isDarkMode ? 'border-[#3c3c4a]' : 'border-slate-200';
  const chatInputBg = isDarkMode ? 'bg-[#1e1e24]' : 'bg-white';
  const chatInputBorder = isDarkMode ? 'border-[#30303a]' : 'border-slate-300';

  return (
    <div className={`w-full h-full flex ${containerBg} rounded-2xl overflow-hidden border border-border/50 shadow-2xl relative transition-colors duration-300`}>

      {/* Canvas Area */}
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          colorMode={isDarkMode ? "dark" : "light"}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          defaultEdgeOptions={getEdgeOptions(isDarkMode)}
          fitView
          attributionPosition="bottom-right"
        >
          <Controls className={`${controlBg} ${controlBorder} shadow-sm ${controlFill} [&>button]:${controlBorder} ${controlHover}`} showInteractive={false} />
          <MiniMap
            nodeColor={(n) => {
              if (n.style?.borderColor) return n.style.borderColor as string;
              return isDarkMode ? '#475569' : '#94a3b8';
            }}
            maskColor={miniMapMask}
            style={{ backgroundColor: miniMapBg, borderColor: miniMapBorder }}
            className={`border rounded-lg shadow-sm`}
          />
          <Background variant={BackgroundVariant.Dots} gap={24} size={2} color={dotColor} />
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Generating concept graph...</p>
              </div>
            </div>
          )}
        </ReactFlow>

        {/* Floating Top Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
          <div className={`${headerBg} backdrop-blur-md px-4 py-2 flex items-center gap-3 rounded-lg shadow-md border ${headerBorder} pointer-events-auto transition-colors`}>
            <LayoutDashboard size={18} className="text-primary" />
            <h2 className={`font-semibold text-sm ${headerText}`}>
              Concept Architecture
            </h2>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={addNode}
              className={`${headerBg} ${btnHover} backdrop-blur-md px-3 py-2 rounded-lg text-sm font-medium ${headerText} shadow-md border ${headerBorder} transition-colors flex items-center gap-2`}
            >
              <Plus size={16} /> Add Box
            </button>
            <button className={`${headerBg} ${btnHover} backdrop-blur-md p-2 rounded-lg ${iconColor} shadow-md border ${headerBorder} transition-colors`}>
              <Download size={18} />
            </button>
            <button onClick={toggleTheme} className={`${headerBg} ${btnHover} backdrop-blur-md p-2 rounded-lg ${iconColor} shadow-md border ${headerBorder} transition-colors`} aria-label="Toggle Theme">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className={`${headerBg} ${btnHover} backdrop-blur-md p-2 rounded-lg ${iconColor} shadow-md border ${headerBorder} transition-colors`}>
              <Settings size={18} />
            </button>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`${isChatOpen ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 hover:bg-primary/90' : `${headerBg} ${iconColor} ${headerBorder} ${btnHover} shadow-md`} backdrop-blur-md p-2 rounded-lg transition-all ml-2 flex items-center gap-2`}
            >
              <MessageSquare size={18} />
              <span className="text-sm font-medium pr-1">Ask AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Resizable Side Chat Bar for AI Mentor */}
      {/* Floating Resizable Side Chat Bar for AI Mentor - Dropdown Mode */}
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          drag
          dragMomentum={false}
          dragConstraints={reactFlowWrapper}
          className={`absolute top-16 right-4 z-50 ${chatPanelBg} backdrop-blur-xl shadow-2xl rounded-2xl border ${chatPanelBorder} flex flex-col overflow-hidden pointer-events-auto`}
          style={{ width: '320px', height: '450px', resize: 'both', minWidth: '280px', minHeight: '300px' }}
        >
          {/* Drag Handle Header */}
          <div className={`h-14 border-b ${chatPanelBorder} flex items-center px-4 gap-3 ${chatHeaderBg} cursor-grab active:cursor-grabbing shrink-0 transition-colors`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center pointer-events-none">
              <Bot size={18} className="text-primary" />
            </div>
            <div className="pointer-events-none">
              <h3 className={`font-semibold tracking-tight ${headerText}`}>AI Architect</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Graph Assistant</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <div className={`${chatBubbleBg} p-3 rounded-2xl rounded-tl-sm ${headerText} border ${chatBubbleBorder} leading-relaxed transition-colors`}>
              I'm your AI Graph Assistant! You can ask me questions about this architecture, or have me analyze the layout.
              <br /><br />
              I am now a floating dropdown. You can toggle me from the top right button, resize my window, and drag me around.
            </div>
          </div>

          <div className={`p-3 border-t ${chatPanelBorder} ${chatHeaderBg} shrink-0 transition-colors`}>
            <div className="relative flex items-center">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about this flow..."
                className={`w-full ${chatInputBg} ${headerText} border ${chatInputBorder} rounded-xl pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground shadow-sm`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setChatInput("");
                  }
                }}
              />
              <button
                onClick={() => setChatInput("")}
                className="absolute right-2 p-1.5 rounded-lg text-primary hover:bg-primary/20 transition-colors"
              >
                <Send size={16} className={chatInput.trim() ? "opacity-100" : "opacity-50"} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectFlowchart;
