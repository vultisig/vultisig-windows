import {
  animate,
  AnimationOptions,
  DOMKeyframesDefinition,
  stagger,
} from 'framer-motion'

import { Glyph } from './splitIntoGlyphs'

// No bounce, so the glyphs settle without overshooting. `visualDuration` is
// how long the motion looks, not how long the spring's tail takes to rest.
const spring: AnimationOptions = {
  type: 'spring',
  visualDuration: 0.5,
  bounce: 0,
}

// Each glyph starts a beat after the one before it, so a swap sweeps across
// the value from its leading edge. The whole sweep is capped so a long value
// (the 34-dot row) doesn't drag.
const glyphStagger = 0.03
const maxStaggerSpread = 0.25

const getStaggerOptions = (glyphCount: number): AnimationOptions => ({
  ...spring,
  delay: stagger(
    Math.min(glyphStagger, maxStaggerSpread / Math.max(glyphCount - 1, 1))
  ),
})

const travel = '0.4em'
const blur = '0.12em'

const exitKeyframes: DOMKeyframesDefinition = {
  opacity: [1, 0],
  transform: ['translateY(0em)', `translateY(${travel})`],
  filter: ['blur(0em)', `blur(${blur})`],
}

const enterKeyframes: DOMKeyframesDefinition = {
  opacity: [0, 1],
  transform: [`translateY(-${travel})`, 'translateY(0em)'],
  filter: [`blur(${blur})`, 'blur(0em)'],
}

type AnimateGlyphSwapInput = {
  outgoing: Glyph[]
  incoming: Glyph[]
}

/**
 * Rolls the outgoing glyphs down and out while the incoming ones roll in from
 * above, blurring through the change, one glyph after another from the start
 * of the value.
 */
export const animateGlyphSwap = ({
  outgoing,
  incoming,
}: AnimateGlyphSwapInput) => {
  // Glyphs still waiting on their stagger delay would otherwise show at rest.
  incoming.forEach(glyph => {
    glyph.style.opacity = '0'
  })

  const controls = [
    { glyphs: outgoing, keyframes: exitKeyframes },
    { glyphs: incoming, keyframes: enterKeyframes },
  ]
    .filter(({ glyphs }) => glyphs.length > 0)
    .map(({ glyphs, keyframes }) =>
      animate(glyphs, keyframes, getStaggerOptions(glyphs.length))
    )

  return {
    finished: Promise.all(controls),
    stop: () => controls.forEach(control => control.stop()),
  }
}
