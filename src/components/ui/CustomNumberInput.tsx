import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface CustomNumberInputProps {
  value: string | number;
  onIncrement: () => void;
  onDecrement: () => void;
  label?: string;
  variant?: 'horizontal' | 'vertical';
  darkMode: boolean;
}

export function CustomNumberInput({ value, onIncrement, onDecrement, label, variant = 'horizontal', darkMode }: CustomNumberInputProps) {
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#888' : '#666';

  if (variant === 'vertical') {
    return (
      <div className="flex items-center justify-between border px-3 py-2" style={{ borderColor, backgroundColor: 'transparent' }}>
        <span className="text-[10px] font-bold uppercase" style={{ color: textColor }}>{value}</span>
        <div className="flex flex-col border-l pl-2 gap-1" style={{ borderColor }}>
          <button onClick={onIncrement} className="hover:opacity-70 transition-opacity">
            <ChevronUp className="w-3 h-3" style={{ color: mutedText }} />
          </button>
          <button onClick={onDecrement} className="hover:opacity-70 transition-opacity">
            <ChevronDown className="w-3 h-3" style={{ color: mutedText }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={onDecrement}
        className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-accent"
        style={{ borderColor, color: mutedText }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div 
        className="flex-1 h-8 flex items-center justify-center border px-3"
        style={{ borderColor, color: textColor }}
      >
        <span className="text-[10px] font-bold uppercase">{value}</span>
      </div>
      <button 
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-accent"
        style={{ borderColor, color: mutedText }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
