export interface ShortcutDefinition {
  id: string;
  key: string;
  description: string;
  category: string;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  { id: 'palette', key: 'Cmd+K', description: 'Open Command Palette', category: 'General' },
  { id: 'shortcuts', key: 'Cmd+/', description: 'Open Shortcuts Reference', category: 'General' },
  { id: 'undo', key: 'Cmd+Z', description: 'Undo', category: 'History' },
  { id: 'redo', key: 'Cmd+Shift+Z', description: 'Redo', category: 'History' },
  { id: 'save', key: 'Cmd+S', description: 'Save Project', category: 'File' },
  { id: 'clear', key: 'Cmd+X', description: 'Clear Canvas', category: 'Canvas' },
  
  // Tools
  { id: 'fill', key: 'F', description: 'Fill Tool (Draw)', category: 'Tools' },
  { id: 'erase', key: 'E', description: 'Erase Tool', category: 'Tools' },
  { id: 'picker', key: 'I', description: 'Color Picker', category: 'Tools' },
  { id: 'brush-dec', key: '[', description: 'Decrease Brush Size', category: 'Tools' },
  { id: 'brush-inc', key: ']', description: 'Increase Brush Size', category: 'Tools' },
  
  // Canvas Navigation
  { id: 'pan', key: 'Space + Drag', description: 'Pan Canvas', category: 'Navigation' },
  { id: 'zoom', key: 'Wheel', description: 'Zoom In/Out', category: 'Navigation' },
  
  // Animation
  { id: 'play', key: 'Space', description: 'Play/Pause (when not panning)', category: 'Animation' },
  { id: 'next-frame', key: 'N', description: 'Next Frame', category: 'Animation' },
  { id: 'prev-frame', key: 'B', description: 'Previous Frame', category: 'Animation' },
];
