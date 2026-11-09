import { describe, expect, it } from 'vitest'
import { COUNCIL_COLORS, councilColorForName, councilSeatForName } from './councilPalette'
import { membersFromPreset, presetFromSession } from './councilPreset'
import type { Session, GroupSettings } from './types'

const defaults: GroupSettings = { rounds: 2, order: 'random', announceRoster: true }

const session: Session = {
  id: 'previous', title: 'Old session', kind: 'group', messages: [], createdAt: 1, updatedAt: 1,
  participants: [
    { id: 'a', providerId: 'p', modelId: 'astra', name: 'General Aeuron', color: '#old1', systemPrompt: 'Build' },
    { id: 'b', providerId: 'p', modelId: 'sol', name: 'Solara', color: '#old2', systemPrompt: 'Care' },
    { id: 'c', providerId: 'p', modelId: 'terra', name: 'Vector', color: '#old3', systemPrompt: 'Challenge' },
  ],
}

describe('Council seat colors', () => {
  it('maps the three roles and Vectone alias, not the underlying model', () => {
    expect(councilColorForName('General Aeuron')).toBe(COUNCIL_COLORS.general)
    expect(councilColorForName('Solara')).toBe(COUNCIL_COLORS.solara)
    expect(councilColorForName('Vector')).toBe(COUNCIL_COLORS.vector)
    expect(councilColorForName('Vectone')).toBe(COUNCIL_COLORS.vector)
    expect(councilSeatForName('Unnamed model')).toBeUndefined()
  })
  it('recolors a saved Council and keeps the prompts, models and fresh IDs', () => {
    const preset = presetFromSession(session, defaults)
    expect(preset.participants.map(p => p.color)).toEqual(Object.values(COUNCIL_COLORS))
    let n = 0
    const seats = membersFromPreset(preset, () => `fresh-${++n}`)
    expect(seats.map(s => s.id)).toEqual(['fresh-1','fresh-2','fresh-3'])
    expect(seats.map(s => s.modelId)).toEqual(['astra','sol','terra'])
    expect(seats.map(s => s.systemPrompt)).toEqual(['Build','Care','Challenge'])
  })
})
