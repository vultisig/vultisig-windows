import { Text } from '@lib/ui/text'

import { SettingsBaselineText } from '../../../settings/SettingsBaselineText'

/** How the gate draws its text and spacing in each look. */
export const featureTierGateLooks = {
  default: {
    Label: Text,
    title: { size: 22, weight: 500 },
    description: { size: 14, weight: 500, height: 'large' },
    footnote: { size: 13, weight: 500 },
    tierName: { size: 14, weight: 500 },
    headingPadding: undefined,
    tierNamePadding: undefined,
    tierIconStyle: undefined,
  },
  settings: {
    Label: SettingsBaselineText,
    title: { variant: 'title2' },
    description: { size: 14, weight: 500, height: 20 / 14 },
    footnote: { size: 13, weight: 500, height: 18 / 13 },
    tierName: { size: 14, weight: 500, height: 20 / 14 },
    headingPadding: '0 12px',
    tierNamePadding: '2px 0 0',
    tierIconStyle: { flexShrink: 0 },
  },
} as const
