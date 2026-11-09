import { describe, expect, it } from 'vitest'
import { COUNCIL_STARTERS, orderCouncilSeats } from './councilPresentation'

describe('Council visual presentation', () => {
  it('shows General, Solara and Vector in order without changing the stored roster', () => {
    const original = [
      { name: 'Solara', id: 's' },
      { name: 'Guest AI', id: 'x' },
      { name: 'Vector', id: 'v' },
      { name: 'General Aeuron', id: 'g' },
      { name: 'Another guest', id: 'y' },
    ]
    const ordered = orderCouncilSeats(original)
    expect(ordered.map((m) => m.id)).toEqual(['g', 's', 'v', 'x', 'y'])
    expect(original.map((m) => m.id)).toEqual(['s', 'x', 'v', 'g', 'y'])
    expect(ordered[0]).toBe(original[3])
  })

  it('has three editable starter prompts', () => {
    expect(COUNCIL_STARTERS.map((starter) => starter.label)).toEqual([
      'Stress-test an idea', 'Make a difficult decision', 'Debate the future',
    ])
    expect(COUNCIL_STARTERS.every((starter) => starter.prompt.includes('['))).toBe(true)
    expect(COUNCIL_STARTERS.every((starter) => starter.prompt.length > 60)).toBe(true)
  })
})
