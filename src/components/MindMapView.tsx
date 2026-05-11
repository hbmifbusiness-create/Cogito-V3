import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Line, Text, Group } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Download, Trash2, Scissors, Zap } from 'lucide-react';

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  parentId?: string;
}

export function MindMapView({ entity, onUpdate }: any) {
  const [nodes, setNodes] = useState<Node[]>(entity.mindMap?.nodes || [
    { id: 'root', text: entity.name, x: 400, y: 300, color: '#3B82F6' }
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, []);

  const saveNodes = (newNodes: Node[]) => {
    setNodes(newNodes);
    onUpdate({
      ...entity,
      mindMap: { nodes: newNodes }
    });
  };

  const addNode = (parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const angle = Math.random() * Math.PI * 2;
    const distance = 150;
    const newNode: Node = {
      id: `node-${Date.now()}`,
      text: 'New Idea',
      x: parentNode.x + Math.cos(angle) * distance,
      y: parentNode.y + Math.sin(angle) * distance,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      parentId
    };

    saveNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const updateNodeText = (id: string, text: string) => {
    saveNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  };

  const deleteNode = (id: string) => {
    if (id === 'root') return;
    saveNodes(nodes.filter(n => n.id !== id && n.parentId !== id));
    setSelectedNodeId(null);
  };

  const handleDragEnd = (id: string, e: any) => {
    saveNodes(nodes.map(n => n.id === id ? { ...n, x: e.target.x(), y: e.target.y() } : n));
  };

  const aiSuggest = async () => {
    setIsSuggesting(true);
    // Simulate AI suggestion
    setTimeout(() => {
      const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
      const suggestions = ['Expand Brand Identity', 'Social Media Campaign', 'Collaborations', 'Live Tour Strategy'];
      const newNodes = [...nodes];
      
      suggestions.forEach((text, i) => {
        const angle = (i / suggestions.length) * Math.PI * 2;
        const distance = 180;
        newNodes.push({
          id: `ai-${Date.now()}-${i}`,
          text,
          x: selectedNode.x + Math.cos(angle) * distance,
          y: selectedNode.y + Math.sin(angle) * distance,
          color: '#10B981',
          parentId: selectedNode.id
        });
      });

      saveNodes(newNodes);
      setIsSuggesting(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden relative" ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-6 left-6 z-20 flex gap-2">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-2 shadow-2xl flex gap-2">
            <button 
                onClick={() => addNode(selectedNodeId || 'root')}
                className="p-3 bg-[var(--accent)] text-black rounded-xl hover:scale-105 transition-transform"
                title="Add Branch"
            >
                <Plus size={20} />
            </button>
            <button 
                onClick={aiSuggest}
                disabled={isSuggesting}
                className="p-3 bg-purple-500 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                title="AI Expand"
            >
                {isSuggesting ? <Zap size={20} className="animate-pulse" /> : <Sparkles size={20} />}
            </button>
            <div className="w-px bg-[var(--border-color)] mx-1" />
            <button 
                onClick={() => selectedNodeId && deleteNode(selectedNodeId)}
                className="p-3 bg-rose-500 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                disabled={!selectedNodeId || selectedNodeId === 'root'}
                title="Remove Node"
            >
                <Trash2 size={20} />
            </button>
        </div>

        {selectedNodeId && (
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-2 shadow-2xl"
            >
                <input 
                    type="text" 
                    value={nodes.find(n => n.id === selectedNodeId)?.text || ''}
                    onChange={(e) => updateNodeText(selectedNodeId, e.target.value)}
                    className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--accent)] font-bold text-sm w-48"
                    placeholder="Edit idea..."
                />
            </motion.div>
        )}
      </div>

      <div className="absolute top-6 right-6 z-20">
         <div className="bg-[var(--bg-surface)]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs font-bold text-[var(--text-muted)] flex flex-col gap-1">
            <p>DRAG NODES TO ORGANIZE</p>
            <p>CLICK TO SELECT</p>
            <p>AI ADAPTIVE BRAINSTORM ACTIVE</p>
         </div>
      </div>

      <Stage width={dimensions.width} height={dimensions.height} draggable>
        <Layer>
            {/* Lines first (under nodes) */}
            {nodes.map(node => {
                if (!node.parentId) return null;
                const parent = nodes.find(n => n.id === node.parentId);
                if (!parent) return null;
                return (
                    <Line
                        key={`line-${node.id}`}
                        points={[parent.x, parent.y, node.x, node.y]}
                        stroke={node.color}
                        strokeWidth={3}
                        opacity={0.4}
                        lineCap="round"
                        tension={0.5}
                    />
                );
            })}

            {/* Nodes */}
            {nodes.map(node => (
                <Group 
                    key={node.id} 
                    x={node.x} 
                    y={node.y} 
                    draggable
                    onDragEnd={(e) => handleDragEnd(node.id, e)}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer"
                >
                    <Circle
                        radius={node.id === 'root' ? 50 : 35}
                        fill={node.id === 'root' ? '#000' : node.color}
                        stroke={selectedNodeId === node.id ? '#FFF' : 'transparent'}
                        strokeWidth={selectedNodeId === node.id ? 4 : 0}
                        shadowBlur={10}
                        shadowColor={node.color}
                        shadowOpacity={0.5}
                    />
                    <Text
                        text={node.text}
                        fontSize={node.id === 'root' ? 14 : 12}
                        fontStyle="bold"
                        fontFamily="Space Grotesk"
                        fill="white"
                        align="center"
                        verticalAlign="middle"
                        width={node.id === 'root' ? 80 : 60}
                        offsetX={node.id === 'root' ? 40 : 30}
                        offsetY={node.id === 'root' ? 7 : 6}
                        pointerEvents="none"
                    />
                </Group>
            ))}
        </Layer>
      </Stage>

      {/* Floating Sparkle Animation for isSuggesting */}
      <AnimatePresence>
        {isSuggesting && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none bg-purple-500/5 backdrop-blur-[2px] flex items-center justify-center z-50 overflow-hidden"
            >
                <div className="relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        className="w-96 h-96 border-4 border-dashed border-purple-500/20 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 bg-[var(--bg-surface)] p-8 rounded-[40px] shadow-2xl border border-purple-500/30">
                            <Sparkles className="text-purple-500 animate-bounce" size={48} />
                            <h3 className="font-bold text-xl text-[var(--text-primary)]">AI Brainstorming Paths...</h3>
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <motion.div 
                                        key={i}
                                        animate={{ scale: [1, 1.5, 1] }}
                                        transition={{ delay: i * 0.2, repeat: Infinity }}
                                        className="w-2 h-2 rounded-full bg-purple-500"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
