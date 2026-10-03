import { seedphraseWordCounts } from '../config'

/**
 * The seedphrase length the word counter shows next to the number of words
 * typed: the shortest supported length the input has not passed yet, or the
 * longest one once the input is past every length.
 */
export const getSeedphraseTargetWordCount = (wordCount: number): number =>
  seedphraseWordCounts.find(count => count >= wordCount) ??
  Math.max(...seedphraseWordCounts)
