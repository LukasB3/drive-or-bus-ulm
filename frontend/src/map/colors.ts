/*
Update color markes for the parking garages occupancy percentage.
Green (0%) to Red (100%). Uses HSL color space for smooth gradient.
*/
export function occupancyColor(pct: number): string {
  
  const ratio = Math.max(0, Math.min(1, pct));
  
  const hue = (1 - ratio) * 120;
  
  return `hsl(${hue}, 84%, 45%)`;
}