import { Text } from '@lib/ui/text'
import styled from 'styled-components'

/**
 * Text for EVM addresses. Brockmann's contextual alternates turn the `x` in
 * `0x3f…` into `×` when a digit follows it, so they are switched off here to
 * render the address exactly as typed.
 */
export const EvmAddressText = styled(Text)`
  font-feature-settings: 'calt' 0;
`
