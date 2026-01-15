
import React from 'react';
import { CosmicResponse } from '../types';

interface ResponseViewProps {
  response: CosmicResponse;
  isLoading: boolean;
}

const ResponseView: React.FC<ResponseViewProps> = ({ response, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-10 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-3xl animate-pulse space-y-6">
        <div className="h-2 bg-blue-500/20 rounded w-24"></div>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
          <div className="h-4 bg-white/10 rounded w-4/5"></div>
        </div>
        <div className="pt-6 flex gap-2">
            <div className="h-10 bg-white/10 rounded w-32"></div>
            <div className="h-10 bg-white/10 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.4)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <h3 className="text-[10px] font-orbitron text-cyan-500 mb-8 tracking-[0.4em] uppercase text-center">Resonancia Activa</h3>
        
        <div className="prose prose-invert max-w-none text-gray-100 leading-[1.8] text-xl font-light">
          {response.answer.split('\n').map((para, i) => (
            para.trim() && <p key={i} className="mb-6 last:mb-0 transition-all hover:text-white">{para}</p>
          ))}
        </div>
      </div>

      {response.sources.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <h4 className="text-[10px] font-orbitron text-gray-600 uppercase tracking-[0.4em]">Integrated Sources</h4>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {response.sources.map((source, i) => (
              <a 
                key={i} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all group flex items-start gap-4"
              >
                <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-200 group-hover:text-cyan-400 transition-colors truncate">{source.title}</div>
                  <div className="text-[10px] text-gray-500 font-mono truncate mt-1">{source.uri}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseView;
