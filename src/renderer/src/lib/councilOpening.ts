import type { Message } from './types'

/** Avoid accidental "blind" mode on a continue/regenerate or single-member message. */
export function shouldOpenIndependently(
  round: number,
  hasNewPrompt: boolean,
  enabled: boolean,
  speakerCount: number,
): boolean {
  return round === 0 && hasNewPrompt && enabled && speakerCount > 1
}

/** Concurrent opening calls share one frozen-in-time history *array*.
 * Message objects are treated immutably by the existing store.
 */
export async function runIndependentOpening<T>(
  participants: readonly T[],
  history: readonly Message[],
  generate: (participant: T, snapshot: Message[]) => Promise<void>,
): Promise<void> {
  const snapshot = [...history]
  await Promise.all(participants.map((participant) => generate(participant, snapshot)))
}
