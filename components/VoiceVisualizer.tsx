// components/VoiceVisualizer.tsx
interface VoiceVisualizerProps {
    audioLevel: number;
    isActive: boolean;
  }
  
  export function VoiceVisualizer({ audioLevel, isActive }: VoiceVisualizerProps) {
    const bars = Array.from({ length: 20 });
    
    return (
      <div className="relative">
        <div className="flex items-center justify-center gap-1.5 h-20">
          {bars.map((_, index) => {
            const height = isActive 
              ? Math.random() * audioLevel * 100 + 15
              : 15;
            
            return (
              <div
                key={index}
                className="w-2.5 rounded-full transition-all duration-150"
                style={{
                  height: `${height}%`,
                  background: `linear-gradient(to top, 
                    ${index % 3 === 0 ? '#8b5cf6' : index % 3 === 1 ? '#ec4899' : '#06b6d4'}, 
                    ${index % 3 === 0 ? '#a78bfa' : index % 3 === 1 ? '#f472b6' : '#22d3ee'})`,
                  opacity: isActive ? 1 : 0.3,
                  boxShadow: isActive ? `0 0 20px ${index % 3 === 0 ? '#8b5cf640' : index % 3 === 1 ? '#ec489940' : '#06b6d440'}` : 'none',
                  animationDelay: `${index * 50}ms`
                }}
              />
            );
          })}
        </div>
        {isActive && (
          <div className="absolute inset-0 blur-xl opacity-30">
            <div className="flex items-center justify-center gap-1.5 h-20">
              {bars.map((_, index) => (
                <div
                  key={`glow-${index}`}
                  className="w-2.5 rounded-full"
                  style={{
                    height: `${Math.random() * audioLevel * 100 + 15}%`,
                    background: `linear-gradient(to top, #8b5cf6, #ec4899)`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  