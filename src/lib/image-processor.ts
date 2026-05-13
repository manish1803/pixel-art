export function pixelateImage(
  image: HTMLImageElement, 
  targetSize: number, 
  smoothing: number = 0,
  mode: 'fit' | 'crop' | 'stretch' | 'aspect' = 'stretch'
): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  let source: CanvasImageSource = image;
  
  // Create a temporary canvas to apply smoothing if needed
  if (smoothing > 0) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = image.naturalWidth;
    tempCanvas.height = image.naturalHeight;
    tempCtx.filter = `blur(${smoothing}px)`;
    tempCtx.drawImage(image, 0, 0);
    source = tempCanvas;
  }
  
  let drawWidth = targetSize;
  let drawHeight = targetSize;
  let offsetX = 0;
  let offsetY = 0;

  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;

  if (mode === 'fit' || mode === 'aspect') {
    const scale = Math.min(targetSize / sourceWidth, targetSize / sourceHeight);
    drawWidth = sourceWidth * scale;
    drawHeight = sourceHeight * scale;
    offsetX = (targetSize - drawWidth) / 2;
    offsetY = (targetSize - drawHeight) / 2;
  } else if (mode === 'crop') {
    const scale = Math.max(targetSize / sourceWidth, targetSize / sourceHeight);
    drawWidth = sourceWidth * scale;
    drawHeight = sourceHeight * scale;
    offsetX = (targetSize - drawWidth) / 2;
    offsetY = (targetSize - drawHeight) / 2;
  }
  
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, offsetX, offsetY, drawWidth, drawHeight);
  
  return ctx.getImageData(0, 0, targetSize, targetSize);
}

export function reduceColors(imageData: ImageData, maxColors: number): ImageData {
  const data = imageData.data;
  
  // Simple color quantization by bit shifting or dividing
  const bits = Math.floor(Math.log2(maxColors) / 3);
  const factor = Math.max(1, 256 / Math.pow(2, bits || 1));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.floor(data[i] / factor) * factor;     // R
    data[i+1] = Math.floor(data[i+1] / factor) * factor; // G
    data[i+2] = Math.floor(data[i+2] / factor) * factor; // B
  }
  return imageData;
}

export function applyDithering(imageData: ImageData, maxColors: number): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  const bits = Math.floor(Math.log2(maxColors) / 3);
  const factor = Math.max(1, 256 / Math.pow(2, bits || 1));
  
  function findClosestColor(r: number, g: number, b: number) {
    return [
      Math.floor(r / factor) * factor,
      Math.floor(g / factor) * factor,
      Math.floor(b / factor) * factor
    ];
  }
  
  function clamp(val: number) {
    return Math.min(255, Math.max(0, val));
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldR = data[i];
      const oldG = data[i+1];
      const oldB = data[i+2];
      
      const [newR, newG, newB] = findClosestColor(oldR, oldG, oldB);
      
      data[i] = newR;
      data[i+1] = newG;
      data[i+2] = newB;
      
      const errR = oldR - newR;
      const errG = oldG - newG;
      const errB = oldB - newB;
      
      // Diffuse error (Floyd-Steinberg)
      if (x + 1 < width) {
        const i1 = (y * width + (x + 1)) * 4;
        data[i1] = clamp(data[i1] + errR * 7/16);
        data[i1+1] = clamp(data[i1+1] + errG * 7/16);
        data[i1+2] = clamp(data[i1+2] + errB * 7/16);
      }
      if (x - 1 >= 0 && y + 1 < height) {
        const i2 = ((y + 1) * width + (x - 1)) * 4;
        data[i2] = clamp(data[i2] + errR * 3/16);
        data[i2+1] = clamp(data[i2+1] + errG * 3/16);
        data[i2+2] = clamp(data[i2+2] + errB * 3/16);
      }
      if (y + 1 < height) {
        const i3 = ((y + 1) * width + x) * 4;
        data[i3] = clamp(data[i3] + errR * 5/16);
        data[i3+1] = clamp(data[i3+1] + errG * 5/16);
        data[i3+2] = clamp(data[i3+2] + errB * 5/16);
      }
      if (x + 1 < width && y + 1 < height) {
        const i4 = ((y + 1) * width + (x + 1)) * 4;
        data[i4] = clamp(data[i4] + errR * 1/16);
        data[i4+1] = clamp(data[i4+1] + errG * 1/16);
        data[i4+2] = clamp(data[i4+2] + errB * 1/16);
      }
    }
  }
  return imageData;
}

export function convertImageDataToProjectPixels(imageData: ImageData): { pixels: { [key: string]: string }, palette: string[] } {
  const pixels: { [key: string]: string } = {};
  const paletteSet = new Set<string>();
  const data = imageData.data;
  const width = imageData.width;
  
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];
      
      if (a > 128) { // Only add non-transparent pixels
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        pixels[`${x},${y}`] = hex;
        paletteSet.add(hex);
      }
    }
  }
  return { pixels, palette: Array.from(paletteSet) };
}

export function convertImageDataToLayersByColor(imageData: ImageData): { layers: { [color: string]: { [key: string]: string } }, palette: string[] } {
  const layers: { [color: string]: { [key: string]: string } } = {};
  const paletteSet = new Set<string>();
  const data = imageData.data;
  const width = imageData.width;
  
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];
      
      if (a > 128) {
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        paletteSet.add(hex);
        
        if (!layers[hex]) {
          layers[hex] = {};
        }
        layers[hex][`${x},${y}`] = hex;
      }
    }
  }
  return { layers, palette: Array.from(paletteSet) };
}
