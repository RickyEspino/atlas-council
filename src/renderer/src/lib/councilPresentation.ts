import { councilSeatForName } from './councilPalette'

/** Display order is independent of speaking order. */
export function orderCouncilSeats<T extends { name: string }>(seats: readonly T[]): T[] {
  const priority = (name: string): number => {
    const role = councilSeatForName(name)
    if (role === 'general') return 0
    if (role === 'solara') return 1
    if (role === 'vector') return 2
    return 3
  }
  return seats
    .map((seat, index) => ({ seat, index }))
    .sort((a, b) => priority(a.seat.name) - priority(b.seat.name) || a.index - b.index)
    .map(({ seat }) => seat)
}

export const COUNCIL_STARTER_EVENT = 'atlas-council:starter'

export interface CouncilStarterDetail {
  sessionId: string
  prompt: string
}

export const COUNCIL_STARTERS = [
  {
    label: 'Stress-test an idea',
    prompt: 'Council, stress-test this idea: [describe your idea]. Examine its human impact, feasibility, assumptions, alternatives, and failure modes. Challenge one another where needed, then propose a practical next experiment.',
  },
  {
    label: 'Make a difficult decision',
    prompt: 'Council, help me decide: [describe the decision, options, and constraints]. Consider the people affected, execution risks, and strongest counterarguments. End with a recommendation and what evidence would change it.',
  },
  {
    label: 'Debate the future',
    prompt: 'Council, debate the future of [describe the topic and time horizon]. Offer distinct perspectives, test optimistic and skeptical scenarios, and identify practical implications.',
  },
] as const
