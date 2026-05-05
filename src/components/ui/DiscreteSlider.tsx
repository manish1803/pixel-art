import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DiscreteSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  darkMode: boolean;
}

export function DiscreteSlider({ value, min, max, onChange, darkMode }: DiscreteSliderProps) {
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#888' : '#666';
  const activeColor = darkMode ? '#FFFFFF' : '#000000';

  const steps = [1, 2, 4, 8, 16]; 
  const markers = [1, 2, 3, 4, 5]; 

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={handleDecrement}
        className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-accent"
        style={{ borderColor, color: mutedText }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div 
        className="flex-1 h-8 flex items-center px-2 gap-2 border"
        style={{ borderColor }}
      >
        {/* Square representing size */}
        <div 
          className="w-4 h-4 border"
          style={{ 
            backgroundColor: activeColor,
            borderColor: activeColor,
            transform: `scale(${Math.max(0.2, Math.min(1, value / max))})` 
          }}
        />
        
        {/* Markers */}
        <div className="flex-1 flex justify-between px-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className="w-[1px] h-2" 
              style={{ backgroundColor: i <= (value / max) * 5 ? activeColor : borderColor }} 
            />
          ))}
        </div>
      </div>

      <button 
        onClick={handleIncrement}
        className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-accent"
        style={{ borderColor, color: mutedText }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
