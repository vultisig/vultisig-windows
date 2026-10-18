import { ChildrenProp } from '@lib/ui/props'
import { motion, useTransform } from 'framer-motion'
import styled from 'styled-components'

import { useHomeMotion } from './homeMotion'

type HomePagerPageProps = ChildrenProp & {
  index: number
  isActive: boolean
}

/** Only the active page is focusable and exposed to assistive tech. */
export const HomePagerPage = ({
  index,
  isActive,
  children,
}: HomePagerPageProps) => {
  const { position } = useHomeMotion()
  const visibility = useTransform(position, value =>
    Math.abs(value - index) >= 1 ? 'hidden' : 'visible'
  )

  return (
    <Page style={{ visibility }} aria-hidden={!isActive} inert={!isActive}>
      {children}
    </Page>
  )
}

const Page = styled(motion.div)`
  display: flex;
  flex-direction: column;
  flex: 0 0 100%;
  min-width: 0;
  min-height: 0;
`
