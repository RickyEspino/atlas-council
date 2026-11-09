import { describe, expect, it } from 'vitest'
import { runIndependentOpening, shouldOpenIndependently } from './councilOpening'
import { groupTurns } from './prompt'
import type { Message, Session, Participant } from './types'

const seats: Participant[] = [
  { id: 'g', providerId: 'p', modelId: 'astra', name: 'General Aeuron', color: 'red' },
  { id: 's', providerId: 'p', modelId: 'sol', name: 'Solara', color: 'yellow' },
  { id: 'v', providerId: 'p', modelId: 'terra', name: 'Vector', color: 'blue' },
]

const initial: Message = { id: 'q', role: 'user', content: 'Make a recommendation.', createdAt: 1 }
const group: Session = { id: 'c', kind: 'group', title: 'Council', participants: seats, messages: [], createdAt: 0, updatedAt: 0 }

describe('independent opening round', () => {
  it('only activates for a new multi-speaker group prompt with the option enabled', () => {
    expect(shouldOpenIndependently(0, true, true, 3)).toBe(true)
    expect(shouldOpenIndependently(1, true, true, 3)).toBe(false)
    expect(shouldOpenIndependently(0, false, true, 3)).toBe(false)
    expect(shouldOpenIndependently(0, true, false, 3)).toBe(false)
    expect(shouldOpenIndependently(0, true, true, 1)).toBe(false)
  })
  it('passes a shared pre-round snapshot, never another opening reply', async () => {
    const liveHistory = [initial]
    const seen: Message[][] = []
    await runIndependentOpening(seats, liveHistory, async (seat, snapshot) => {
      seen.push(snapshot)
      // Simulate streaming an opening reply into the live store while other requests launch.
      liveHistory.push({ id: seat.id, role: 'assistant', participantId: seat.id, content: `${seat.name} reply`, createdAt: 2 })
      const turns = groupTurns(group, seat, snapshot)
      expect(turns).toEqual([{ role: 'user', content: '[User]: Make a recommendation.' }])
      await Promise.resolve()
    })
    expect(seen).toHaveLength(3)
    expect(seen[0]).toBe(seen[1])
    expect(seen[1]).toBe(seen[2])
    expect(seen[0]).not.toBe(liveHistory)
    expect(seen[0]).toHaveLength(1)
    expect(liveHistory).toHaveLength(4)
  })
})
