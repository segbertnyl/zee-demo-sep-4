/* NYL brand palette + a stable pseudo-random helper for the point cloud. */

export const NYL = {
  blue: '#0468ff',
  blueLight: '#80baff',
  navy: '#000a62',
  mint: '#a5efbf',
  green: '#016355',
  cream: '#ffe8cf',
  orange: '#ff9522',
  purple: '#4d1773',
  white: '#ffffff',
} as const

/* Deterministic pseudo-random in [0,1) — keeps the point cloud stable across
 * renders (no Math.random in render) so dots don't jump every frame. */
export function rand(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}
