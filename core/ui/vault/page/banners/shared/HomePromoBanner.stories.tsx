import { VStack } from '@lib/ui/layout/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { homePromoBannerVisuals } from '../homePromoBanners'
import { HomePromoBanner } from './HomePromoBanner'
import { HomePromoBannerIcon } from './HomePromoBannerIcon'

const meta = {
  title: 'Vault/HomePromoBanner',
  component: HomePromoBanner,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof HomePromoBanner>

export default meta

const noop = () => {}

const banners: {
  id: keyof typeof homePromoBannerVisuals
  caption: string
  title: string
}[] = [
  {
    id: 'migrate',
    caption: 'Sign faster than ever before',
    title: 'Upgrade your vault now',
  },
  {
    id: 'rujiraStaking',
    caption: 'Stake & earn',
    title: 'Rujira staking live now',
  },
  {
    id: 'followOnX',
    caption: 'Vultisig is building with you',
    title: 'Follow us on X',
  },
  {
    id: 'vaultBackup',
    caption: 'Back Up Your Vault',
    title: 'Request full vault custody',
  },
  {
    id: 'referralCode',
    caption: 'Don’t miss rewards',
    title: 'Add your referral code',
  },
  {
    id: 'buyVultPromo',
    caption: 'Buy $VULT',
    title: 'And save on swap fees',
  },
  {
    id: 'kamino',
    caption: 'New on Solana',
    title: 'Start earning with Kamino',
  },
]

/** Every campaign variant stacked, to check accents and art side by side. */
export const AllBanners: StoryObj<typeof meta> = {
  args: {
    caption: '',
    title: '',
    icon: null,
    accent: 'bannerAccentUpgrade',
    artSrc: '',
    onClick: noop,
    onDismiss: noop,
  },
  render: () => (
    <VStack gap={16} style={{ width: 361 }}>
      {banners.map(({ id, caption, title }) => {
        const visuals = homePromoBannerVisuals[id]

        return (
          <HomePromoBanner
            key={id}
            caption={caption}
            title={title}
            accent={visuals.accent}
            artSrc={visuals.artSrc}
            icon={<HomePromoBannerIcon visuals={visuals} />}
            onClick={noop}
            onDismiss={noop}
          />
        )
      })}
    </VStack>
  ),
}
