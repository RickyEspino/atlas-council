/** Visual identity for the three Council seats, independent of the provider/model. */
export const COUNCIL_COLORS = {
  general: '#F06472',
  solara: '#F4C757',
  vector: '#60B8FA',
} as const

export type CouncilSeat = keyof typeof COUNCIL_COLORS

export function councilSeatForName(name: string): CouncilSeat | undefined {
  const normalized = name.trim().toLowerCase()
  if (/^general(?:\b|[- ])/.test(normalized)) return 'general'
  if (/^solara(?:\b|[- ])/.test(normalized)) return 'solara'
  // Support the established Vector name and the Vectone spelling.
  if (/^(?:vector|vectone)(?:\b|[- ])/.test(normalized)) return 'vector'
  return undefined
}

export function councilColorForName(name: string): string | undefined {
  const seat = councilSeatForName(name)
  return seat ? COUNCIL_COLORS[seat] : undefined
}
