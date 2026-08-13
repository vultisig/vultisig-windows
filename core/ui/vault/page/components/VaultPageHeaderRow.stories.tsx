import { IconButton } from '@lib/ui/buttons/IconButton'
import { ClockRotateClockwiseIcon } from '@lib/ui/icons/ClockRotateClockwiseIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { NavigationProvider } from '@lib/ui/navigation/state'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

import { VaultPageHeaderRow } from './VaultPageHeaderRow'
import { VaultSelector } from './VaultSelector'

const vault = (name: string): Vault => ({
  name,
  publicKeys: { ecdsa: 'ecdsa', eddsa: 'eddsa' },
  signers: ['Mac-6001', 'Server-6002'],
  localPartyId: 'Mac-6001',
  hexChainCode: '0x123',
  keyShares: { ecdsa: 'ks-ecdsa', eddsa: 'ks-eddsa' },
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
})

const controls = (
  <>
    <IconButton>
      <IconWrapper size={24}>
        <RefreshCwIcon />
      </IconWrapper>
    </IconButton>
    <IconButton>
      <IconWrapper size={24}>
        <ClockRotateClockwiseIcon />
      </IconWrapper>
    </IconButton>
    <IconButton>
      <IconWrapper size={24}>
        <SettingsIcon />
      </IconWrapper>
    </IconButton>
  </>
)

const dappsButton = (
  <IconButton>
    <IconWrapper>
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'block',
        }}
      />
    </IconWrapper>
  </IconButton>
)

const meta: Meta<typeof VaultPageHeaderRow> = {
  title: 'Vault/VaultPageHeaderRow',
  component: VaultPageHeaderRow,
  decorators: [
    Story => (
      <NavigationProvider initialValue={{ history: [] }}>
        <Story />
      </NavigationProvider>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const ShortName: Story = {
  args: {
    secondaryControls: controls,
    title: <VaultSelector placement="pageHeader" value={vault('Main')} />,
  },
}

export const LongNameWithPrimaryControls: Story = {
  args: {
    primaryControls: dappsButton,
    secondaryControls: controls,
    title: (
      <VaultSelector
        placement="pageHeader"
        value={vault('android swap testing123334343434')}
      />
    ),
  },
}

export const LongName: Story = {
  args: {
    secondaryControls: controls,
    title: (
      <VaultSelector
        placement="pageHeader"
        value={vault('android swap testing123334343434')}
      />
    ),
  },
}
