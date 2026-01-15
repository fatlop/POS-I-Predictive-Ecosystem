
import React from 'react';

interface FrequencyVisualizerProps {
  isActive?: boolean;
}

const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({ isActive }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 h-12">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 bg-gradient-to-t from-cyan-600 via-white to-cyan-400 rounded-full ${isActive ? 'animate-freq-bar-active' : 'animate-freq-bar'}`}
          style={{
            height: '20%',
            animationDelay: `${i * 0.1}s`,
            animationDuration: isActive ? `${0.3 + Math.random() * 0.4}s` : `${0.6 + Math.random()}s`
          }}
        />
      ))}
      <style>{`
        @keyframes freq-bar {
          0%, 100% { height: 20%; opacity: 0.3; }
          50% { height: 60%; opacity: 0.8; }
        }
        @keyframes freq-bar-active {
          0%, 100% { height: 20%; opacity: 0.5; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-freq-bar {
          animation: freq-bar ease-in-out infinite;
        }
        .animate-freq-bar-active {
          animation: freq-bar-active ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FrequencyVisualizer;
