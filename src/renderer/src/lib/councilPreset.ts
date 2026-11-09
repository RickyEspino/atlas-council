import type { CouncilPreset, GroupSettings, Participant, Session } from './types'
import { councilColorForName } from './councilPalette'

/** Save seat identities and rules, never the conversation transcript or participant IDs. */
export function presetFromSession(session: Session, group: GroupSettings): CouncilPreset {
  return {
    participants: session.participants.map(({ providerId, modelId, name, color, systemPrompt }) =>
      ({ providerId, modelId, name, color: councilColorForName(name) ?? color, systemPrompt })),
    systemPrompt: session.systemPrompt,
    rounds: session.rounds ?? group.rounds,
    order: session.order ?? group.order,
    independentOpenings: session.independentOpenings ?? false,
  }
}

/** Every fresh chat gets new participant IDs and no temporary muted state. */
export function membersFromPreset(preset: CouncilPreset, id: () => string): Participant[] {
  return preset.participants.map((seat) => ({ ...seat, color: councilColorForName(seat.name) ?? seat.color, id: id() }))
}
