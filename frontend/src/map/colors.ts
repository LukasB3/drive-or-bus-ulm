/*
Update color markes for the parking garages occupancy percentage.
Green (0%) to Red (100%). Uses HSL color space for smooth gradient.
*/
export function occupancyColor(pct: number): string {

  const ratio = Math.max(0, Math.min(1, pct));

  const hue = (1 - ratio) * 120;

  return `hsl(${hue}, 84%, 45%)`;
}

export const LINE_COLORS: Record<number, string> = {
  1:  '#E42229', // Tram — red
  2:  '#40AC56', // Tram — green
  3:  '#005DA3', // Tram — blue
  4:  '#06806E', // Tram — teal
  5:  '#1AA8BE', // Bus — cyan
  6:  '#F29337', // Bus — orange
  7:  '#B1116C', // Bus — magenta
  8:  '#77408D', // Bus — purple
  9:  '#DF9CBB', // Bus — pink
  10: '#A4A058', // Bus — olive
  11: '#015EA3', // Bus — blue
  12: '#B22E2A', // Bus — crimson
  13: '#7CC090', // Bus — sage
  14: '#2BAAE2', // Bus — sky blue
  15: '#B180B7', // Bus — mauve
}

const FALLBACK_COLOR = '#888888'

export function lineColor(routeNumber: number): string {
  return LINE_COLORS[routeNumber] ?? FALLBACK_COLOR
}