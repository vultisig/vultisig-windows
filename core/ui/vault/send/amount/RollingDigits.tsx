import { ValueProp } from '@lib/ui/props'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const rollDurationS = 0.18

/**
 * Draws a line of text whose characters roll vertically into place when they
 * change. Display only: it never shows anything but `value`. Characters on
 * screen when it first mounts stay put.
 */
export const RollingDigits = ({ value }: ValueProp<string>) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <>
      {[...value].map((char, index) => (
        <Slot key={index}>
          <AnimatePresence initial={hasMounted} mode="popLayout">
            <Glyph
              key={char}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ duration: rollDurationS, ease: 'easeOut' }}
            >
              {char}
            </Glyph>
          </AnimatePresence>
        </Slot>
      ))}
    </>
  )
}

const Glyph = styled(motion.span)`
  display: inline-block;
`

const Slot = styled.span`
  position: relative;
  display: inline-block;
  overflow: hidden;
  white-space: pre;
  vertical-align: top;
`
