
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Planet {
  id: string;
  name: string;
  distance: number;
  radius: number;
  speed: number;
  color: string;
  angle: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  twinkle: number;
  vx: number;
  vy: number;
}

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !svgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const svg = d3.select(svgRef.current);
    
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      svg.attr('width', width).attr('height', height);
    };

    window.addEventListener('resize', resize);
    resize();

    // Star data with movement vectors
    const starCount = 180;
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.5,
      opacity: Math.random(),
      twinkle: Math.random() * 0.01 + 0.005,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    // Planets (SVG Overlay for interactivity and sharp text)
    const planets: Planet[] = [
      { id: 'p1', name: 'Júpiter (Estabilidad)', distance: 150, radius: 25, speed: 0.002, color: '#f59e0b', angle: 0 },
      { id: 'p2', name: 'Aurora (Ventas)', distance: 280, radius: 18, speed: 0.001, color: '#22d3ee', angle: Math.PI / 2 },
      { id: 'p3', name: 'Hexia (Geometría)', distance: 400, radius: 12, speed: 0.0005, color: '#a855f7', angle: Math.PI },
      { id: 'p4', name: 'Chepe-9 (Cimiento)', distance: 550, radius: 35, speed: 0.0002, color: '#ec4899', angle: 1.5 * Math.PI },
    ];

    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    // Orbit paths
    const orbitGroup = svg.append('g').attr('opacity', 0.08);
    orbitGroup.selectAll('.orbit')
      .data(planets)
      .enter()
      .append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', d => d.distance)
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5);

    const planetGroup = svg.append('g');
    const planetElements = planetGroup.selectAll('.planet-container')
      .data(planets)
      .enter()
      .append('g')
      .attr('class', 'planet-container');

    planetElements.append('circle')
      .attr('class', 'planet-glow')
      .attr('r', d => d.radius * 2.2)
      .attr('fill', d => d.color)
      .attr('opacity', 0.15)
      .attr('filter', 'url(#glow)');

    planetElements.append('circle')
      .attr('class', 'planet-core')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('filter', 'url(#glow)');

    planetElements.append('text')
      .attr('dy', d => d.radius + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .style('font-family', 'Orbitron')
      .style('font-size', '9px')
      .style('letter-spacing', '3px')
      .style('text-transform', 'uppercase')
      .style('pointer-events', 'none')
      .text(d => d.name);

    let frame = 0;
    const connectionRadius = 140;

    const animate = () => {
      frame++;
      if (!ctx) return;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);
      
      // Update & Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        
        // Move stars
        s.x += s.vx;
        s.y += s.vy;

        // Wrap around screen
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Twinkle
        const currentOpacity = 0.3 + Math.abs(Math.sin(frame * s.twinkle)) * 0.7;
        
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
        ctx.fill();

        // Draw connections (Neural/Constellation effect)
        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j];
          const dx = s.x - s2.x;
          const dy = s.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionRadius) {
            const lineOpacity = (1 - dist / connectionRadius) * 0.2 * currentOpacity;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${lineOpacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Update Planet Orbits (SVG)
      planetElements.attr('transform', (d) => {
        d.angle += d.speed;
        const x = width / 2 + Math.cos(d.angle) * d.distance;
        const y = height / 2 + Math.sin(d.angle) * d.distance;
        return `translate(${x},${y})`;
      });

      // Maintain orbit centers on resize
      orbitGroup.selectAll('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#010206]" style={{ background: 'radial-gradient(circle at center, #050a1a 0%, #010206 100%)' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <svg ref={svgRef} className="absolute inset-0" />
    </div>
  );
};

export default StarField;
