
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Sale } from '../types';

interface PredictiveChartProps {
  sales: Sale[];
}

const PredictiveChart: React.FC<PredictiveChartProps> = ({ sales }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || sales.length < 2) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3.scaleTime()
      .domain(d3.extent(sales, d => new Date(d.timestamp)) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(sales, d => d.total) || 1000])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<Sale>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.total))
      .curve(d3.curveMonotoneX);

    // Area for glow
    const area = d3.area<Sale>()
      .x(d => x(new Date(d.timestamp)))
      .y0(height - margin.bottom)
      .y1(d => y(d.total))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(sales)
      .attr("fill", "url(#line-gradient)")
      .attr("d", area);

    svg.append("path")
      .datum(sales)
      .attr("fill", "none")
      .attr("stroke", "#22d3ee")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Gradient definitions
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "line-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#22d3ee").attr("stop-opacity", 0.2);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#22d3ee").attr("stop-opacity", 0);

    // Grid
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-height + margin.top + margin.bottom).tickFormat(() => ""))
      .attr("stroke-opacity", 0.1);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10))
      .attr("color", "#52525b");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(10))
      .attr("color", "#52525b");

  }, [sales]);

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
        <span className="text-[10px] font-orbitron text-zinc-500 uppercase tracking-widest">Live Predictive Layer</span>
      </div>
    </div>
  );
};

export default PredictiveChart;
