import { describe, expect, it } from 'vitest'
import { membersFromPreset, presetFromSession } from './councilPreset'
import type { Session, GroupSettings } from './types'

const group: GroupSettings = { rounds: 1, order: 'sequential', announceRoster: true }
const sample: Session = {
  id: 'old', title: 'Previous conversation', kind: 'group', createdAt: 0, updatedAt: 0,
  messages: [{ id: 'msg', role: 'user', content: 'private discussion', createdAt: 0 }],
  rounds: 3, order: 'random', independentOpenings: true,
  participants: [
    { id: 'a', providerId: 'chatgpt', modelId: 'gpt-6-astra', name: 'General Aeuron', color: '#123', systemPrompt: 'Build reliable systems', muted: true },
    { id: 'b', providerId: 'chatgpt', modelId: 'gpt-6.1-sol', name: 'Solara', color: '#456', systemPrompt: 'Preserve humanity' },
  ],
}

describe('saved Council', () => {
  it('preserves seats and group settings without retaining history or IDs', () => {
    const preset = presetFromSession(sample, group)
    expect(preset.rounds).toBe(3)
    expect(preset.independentOpenings).toBe(true)
    expect(JSON.stringify(preset)).not.toContain('private discussion')
    expect(JSON.stringify(preset)).not.toContain('"id":"a"')
    let n = 0
    const fresh = membersFromPreset(preset, () => `new-${++n}`)
    expect(fresh.map((p) => p.id)).toEqual(['new-1', 'new-2'])
    expect(fresh[0].systemPrompt).toBe('Build reliable systems')
    expect(fresh[0].muted).toBeUndefined()
    expect(fresh[1].name).toBe('Solara')
  })
})
