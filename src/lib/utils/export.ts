export const generateSVG = (pixels: { [key: string]: string }, gridSize: number, size: number = 600) => {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridSize} ${gridSize}" width="${size}" height="${size}">`;
  Object.entries(pixels).forEach(([key, color]) => {
    const [x, y] = key.split(',').map(Number);
    svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />`;
  });
  svgContent += `</svg>`;
  return svgContent;
};

export const generatePNG = (pixels: { [key: string]: string }, gridSize: number, size: number = 600, bgColor: string = '#ffffff'): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    const cellSize = size / gridSize;
    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    });
    
    resolve(canvas.toDataURL('image/png'));
  });
};
