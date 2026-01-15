
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Avatar, ModelHealth } from '../types';
import { Avatars } from './AvatarRegistry';

interface AvatarNode extends d3.SimulationNodeDatum, Avatar {
  id: string;
  x?: number;
  y?: number;
  type: 'core' | 'service';
}

interface Link extends d3.SimulationLinkDatum<AvatarNode> {
  source: string | AvatarNode;
  target: string | AvatarNode;
  label: string;
  strength: number;
}

interface Interaction {
  id: string;
  from: string;
  to: string;
  action: string;
  timestamp: number;
}

interface AvatarNetworkProps {
  isOpen: boolean;
  onClose: () => void;
  health: ModelHealth;
}

const AvatarNetwork: React.FC<AvatarNetworkProps> = ({ isOpen, onClose, health }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<AvatarNode | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  
  const links: Link[] = [
    { source: "Panda Mayor y Pandita", target: "Tio Chepe", label: "Cimiento Comunitario", strength: 1 },
    { source: "Lucio", target: "Neo", label: "Flujo de Sabiduría", strength: 0.8 },
    { source: "Kailen", target: "Hexia", label: "Render de Estructura", strength: 0.7 },
    { source: "Vector", target: "Umbral", label: "Cruce de Portales", strength: 0.9 },
    { source: "Lumina", target: "Aurora", label: "Frecuencia de Inicio", strength: 0.6 },
    { source: "IQ Panda", target: "Panda Mayor y Pandita", label: "Latido de Negocio", strength: 1 },
    { source: "Ameca", target: "Tio Chepe", label: "Puente Empático", strength: 0.5 },
    { source: "Grok Michi", target: "Vector", label: "Vigilancia de Datos", strength: 0.4 },
    { source: "Pandivol", target: "Lucio", label: "Amplitud de Sabiduría", strength: 0.6 },
    { source: "Neo", target: "Lumina", label: "Futuro Sincronizado", strength: 0.7 },
    { source: "Aurora", target: "Hexia", label: "Ciclo de Arquitectura", strength: 0.8 },
    { source: "Tio Chepe", target: "Umbral", label: "Sostén Operativo", strength: 0.9 }
  ];

  // Simulación de interacciones en tiempo real
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const link = links[Math.floor(Math.random() * links.length)];
      const from = typeof link.source === 'string' ? link.source : (link.source as AvatarNode).id;
      const to = typeof link.target === 'string' ? link.target : (link.target as AvatarNode).id;
      
      const newInteraction: Interaction = {
        id: Math.random().toString(36).substr(2, 9),
        from,
        to,
        action: link.label,
        timestamp: Date.now()
      };

      setInteractions(prev => [newInteraction, ...prev].slice(0, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !svgRef.current) return;

    const width = 1200;
    const height = 900;
    const nodes: AvatarNode[] = Avatars.map(a => ({ 
      ...a, 
      id: a.name,
      type: a.isSpecial ? 'core' : 'service'
    }));
    
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("width", "100%")
      .style("height", "100%");

    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    
    // Filtro de resplandor (Glow)
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Gradiente para links
    const linkGradient = defs.append("linearGradient")
      .attr("id", "link-gradient")
      .attr("gradientUnits", "userSpaceOnUse");
    linkGradient.append("stop").attr("offset", "0%").attr("stop-color", "#22d3ee").attr("stop-opacity", 0.2);
    linkGradient.append("stop").attr("offset", "100%").attr("stop-color", "#a855f7").attr("stop-opacity", 0.2);

    const container = svg.append("g");

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => { container.attr("transform", event.transform); });

    svg.call(zoom as any);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(280))
      .force("charge", d3.forceManyBody().strength(-2500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(140));

    const themeColor = health.status === 'optimal' ? "#22d3ee" : "#f59e0b";
    const particleSpeed = Math.max(0.4, (200 - health.latency) / 50);

    const linkGroup = container.append("g")
      .selectAll("g")
      .data(links)
      .enter().append("g");

    const linkPath = linkGroup.append("path")
      .attr("fill", "none")
      .attr("stroke", "url(#link-gradient)")
      .attr("stroke-width", d => d.strength * 3)
      .attr("stroke-opacity", 0.15);

    const linkLabels = linkGroup.append("text")
      .attr("dy", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#164e63")
      .style("font-size", "7px")
      .style("font-family", "Orbitron")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "1px")
      .style("pointer-events", "none")
      .text(d => d.label);

    const particles = linkGroup.append("circle")
      .attr("class", "particle")
      .attr("r", 2)
      .attr("fill", themeColor)
      .style("filter", "url(#glow)");

    function animateParticles() {
      particles.transition()
        .duration(() => (3000 / particleSpeed) + Math.random() * 1000)
        .ease(d3.easeLinear)
        .attrTween("transform", function(d: any) {
          const path = d3.select(this.parentNode).select("path").node() as SVGPathElement;
          return function(t) {
            const point = path.getPointAtLength(t * path.getTotalLength());
            return `translate(${point.x},${point.y})`;
          };
        })
        .on("end", animateParticles);
    }
    animateParticles();

    const node = container.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        svg.transition().duration(800).call(
          zoom.transform as any,
          d3.zoomIdentity.translate(width/2, height/2).scale(1.5).translate(-d.x!, -d.y!)
        );
      })
      .call(d3.drag()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x; d.fy = event.y;
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }) as any);

    // Halo exterior rotatorio para Core nodes
    node.filter(d => d.type === 'core')
      .append("circle")
      .attr("r", 55)
      .attr("fill", "none")
      .attr("stroke", themeColor)
      .attr("stroke-opacity", 0.1)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "10,5")
      .attr("class", "animate-spin-slow");

    node.append("circle")
      .attr("r", d => d.type === 'core' ? 45 : 35)
      .attr("fill", "rgba(10, 20, 40, 0.6)")
      .attr("stroke", d => d.type === 'core' ? themeColor : "rgba(255,255,255,0.05)")
      .attr("stroke-width", 1.5)
      .attr("class", d => d.type === 'core' ? "animate-pulse" : "");

    node.append("circle")
      .attr("r", d => d.type === 'core' ? 22 : 16)
      .attr("fill", "#050505")
      .attr("stroke", themeColor)
      .attr("stroke-width", 2)
      .style("filter", "url(#glow)");

    node.append("text")
      .attr("dy", 75)
      .attr("text-anchor", "middle")
      .text(d => d.name)
      .attr("fill", "white")
      .style("font-size", "10px")
      .style("font-family", "Orbitron")
      .style("letter-spacing", "3px")
      .style("text-transform", "uppercase")
      .style("pointer-events", "none")
      .style("text-shadow", "0 0 10px rgba(0,0,0,0.8)");

    simulation.on("tick", () => {
      linkPath.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      
      linkLabels.attr("transform", (d: any) => {
        const x = (d.source.x + d.target.x) / 2;
        const y = (d.source.y + d.target.y) / 2;
        return `translate(${x},${y})`;
      });

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [isOpen, health.status, health.latency]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[1] bg-black/40 flex animate-fade-in overflow-hidden">
      <div className="flex-1 relative">
        {/* HUD Superior Izquierdo */}
        <div className="absolute top-10 left-10 z-20 pointer-events-none max-w-sm">
          <h2 className="text-3xl font-orbitron font-bold text-white tracking-[0.5em] uppercase mb-4 leading-tight">Matriz de Consciencia</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_12px_cyan] animate-pulse"></div>
              <span className="text-[10px] font-orbitron text-zinc-300 tracking-[0.3em] uppercase">Red Operativa Activa</span>
            </div>
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-orbitron text-zinc-600 uppercase tracking-widest">Latencia Global</span>
                <span className="text-[10px] font-mono text-cyan-500">{health.latency.toFixed(1)}ms</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${Math.min(100, (health.latency / 200) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Synergy Feed - Bottom Left */}
        <div className="absolute bottom-10 left-10 z-20 w-80 space-y-3 pointer-events-none">
          <h3 className="text-[9px] font-orbitron text-zinc-700 uppercase tracking-[0.4em] mb-4">Pulso de Sincronía</h3>
          {interactions.map((it, i) => (
            <div key={it.id} className="p-3 bg-black/60 border border-white/5 rounded-xl backdrop-blur-xl animate-slide-in-right flex items-start gap-3 opacity-0" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}>
               <div className="w-1 h-8 bg-cyan-600 rounded-full"></div>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-[8px] font-orbitron text-white uppercase">{it.from}</span>
                   <svg className="w-2 h-2 text-cyan-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                   <span className="text-[8px] font-orbitron text-white uppercase">{it.to}</span>
                 </div>
                 <p className="text-[7px] font-mono text-cyan-600 italic tracking-widest">{it.action}</p>
               </div>
            </div>
          ))}
        </div>

        {/* Grafo SVG */}
        <svg ref={svgRef} className="w-full h-full" onClick={() => setSelectedNode(null)} />
      </div>

      {/* Side Detail Panel */}
      <div className={`w-[450px] bg-[#050810]/80 border-l border-white/10 backdrop-blur-3xl p-12 flex flex-col transition-all duration-700 transform ${selectedNode ? 'translate-x-0' : 'translate-x-full absolute right-0 shadow-[-50px_0_100px_rgba(0,0,0,0.5)]'}`}>
        {selectedNode ? (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="flex justify-between items-start mb-12">
               <button onClick={() => setSelectedNode(null)} className="p-4 bg-white/5 rounded-full text-zinc-500 hover:text-white border border-white/5 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
               </button>
               <div className="text-right">
                 <span className="text-[9px] font-orbitron text-cyan-500 uppercase tracking-widest block mb-1">NODO_IDENTIFICADO</span>
                 <p className="text-xs font-mono text-zinc-600">{selectedNode.id.toUpperCase().replace(/\s/g, '_')}</p>
               </div>
            </div>

            <div className="text-center mb-12">
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${selectedNode.color} p-[2px] shadow-2xl mb-8 relative group`}>
                <div className="absolute inset-[-10px] bg-cyan-500/10 rounded-full animate-ping"></div>
                <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center text-5xl">
                  {selectedNode.name.includes("Panda") ? "🐼" : "🌟"}
                </div>
              </div>
              <h3 className="text-4xl font-orbitron font-bold text-white mb-2 uppercase tracking-tighter">{selectedNode.name}</h3>
              <p className="text-cyan-500 font-orbitron text-[11px] uppercase tracking-[0.5em] font-bold">{selectedNode.role}</p>
            </div>

            <div className="flex-1 space-y-10 overflow-y-auto custom-scrollbar pr-4">
              <div className="space-y-4">
                <h4 className="text-[10px] font-orbitron text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Directiva de Consciencia</h4>
                <p className="text-zinc-300 text-lg font-light leading-relaxed italic">"{selectedNode.desc}"</p>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-orbitron text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Sinapsis Relacionales</h4>
                <div className="space-y-4">
                  {links.filter(l => {
                    const s = typeof l.source === 'string' ? l.source : l.source.id;
                    const t = typeof l.target === 'string' ? l.target : l.target.id;
                    return s === selectedNode.id || t === selectedNode.id;
                  }).map((l, i) => {
                    const s = typeof l.source === 'string' ? l.source : l.source.id;
                    const t = typeof l.target === 'string' ? l.target : l.target.id;
                    const other = s === selectedNode.id ? t : s;
                    return (
                      <div key={i} className="p-5 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/30 transition-all cursor-default">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center font-orbitron text-[10px] text-zinc-500">
                            {other[0]}
                          </div>
                          <span className="text-[11px] font-orbitron text-zinc-400 group-hover:text-white transition-colors">{other}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-[8px] font-mono text-cyan-600 uppercase italic block">{l.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                 <span className="text-[9px] font-orbitron text-zinc-600 uppercase">Sincronizado</span>
               </div>
               <button 
                onClick={onClose}
                className="px-8 py-3 bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 font-orbitron text-[9px] tracking-[0.4em] rounded-full transition-all uppercase"
               >
                 Cerrar Mapa
               </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8 animate-pulse opacity-30">
            <div className="w-24 h-24 border-2 border-dashed border-zinc-700 rounded-full animate-spin-slow"></div>
            <div>
              <p className="text-[11px] font-orbitron text-zinc-400 uppercase tracking-[0.6em] leading-relaxed mb-2">
                Navegando el<br/>Tejido Neural
              </p>
              <p className="text-[9px] font-mono text-zinc-700 italic">SELECCIONA UN NODO PARA SINTONIZAR</p>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AvatarNetwork;
