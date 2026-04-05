import { Button } from '@lib/ui/buttons/Button'
import { Modal } from '@lib/ui/modal'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { KeysignNotificationBanner } from './KeysignNotificationBanner'

const meta = {
  title: 'Notifications/KeysignNotificationBanner',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

type Story = StoryObj

function BannerPreview(props: {
  title: string
  vaultName: string
  description: string
  isFastVault: boolean
}) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button kind="primary" onClick={() => setOpen(true)}>
        Show banner
      </Button>
      {open && (
        <Modal
          title="Keysign banner preview"
          onClose={() => {
            setOpen(false)
          }}
        >
          <div
            style={{
              background: '#02122b',
              minHeight: 480,
              position: 'relative',
              width: '100%',
            }}
          >
            <KeysignNotificationBanner
              description={props.description}
              isFastVault={props.isFastVault}
              title={props.title}
              vaultName={props.vaultName}
              onAction={() => {
                setOpen(false)
              }}
              onDismiss={() => {
                setOpen(false)
              }}
            />
            <div
              style={{
                color: '#8295ae',
                fontSize: 14,
                marginTop: 220,
                padding: 24,
                textAlign: 'center',
              }}
            >
              Wallet content placeholder — compare to Figma 70608:121371
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

/** Swap summary, secure vault (shield), Figma-style copy. */
export const SwapSecureVault: Story = {
  render: () => (
    <BannerPreview
      description="Swap 10 ETH → USDC"
      isFastVault={false}
      title="Join transaction"
      vaultName="Vault #2"
    />
  ),
}

/** Send flow, fast vault (lightning). */
export const SendFastVault: Story = {
  render: () => (
    <BannerPreview
      description="Send 1.5 ETH"
      isFastVault
      title="Join transaction"
      vaultName="Main Vault"
    />
  ),
}

/** Generic / custom payload style. */
export const GenericBell: Story = {
  render: () => (
    <BannerPreview
      description="Transaction pending approval"
      isFastVault={false}
      title="Join transaction"
      vaultName="Shared vault"
    />
  ),
}

/** Full-viewport banner only (iframe QA / Figma diff). */
export const FullViewportSwapSecure: Story = {
  render: () => (
    <div style={{ background: '#02122b', minHeight: '100vh', width: '100%' }}>
      <KeysignNotificationBanner
        description="Swap 10 ETH → USDC"
        isFastVault={false}
        title="Join transaction"
        vaultName="Vault #2"
        onAction={() => {}}
        onDismiss={() => {}}
      />
    </div>
  ),
}

/**
 * Same copy as Figma 70608:121371 — 360px wide frame, absolute banner, for
 * pixel comparison to design screenshots.
 */
export const FigmaFrame360SwapSecure: Story = {
  render: () => (
    <div
      style={{
        background: '#02122b',
        margin: '0 auto',
        minHeight: 400,
        position: 'relative',
        width: 360,
      }}
    >
      <KeysignNotificationBanner
        description="Swap 10 ETH → USDC"
        isFastVault={false}
        layout="contained"
        title="Join transaction"
        vaultName="Vault #2"
        onAction={() => {}}
        onDismiss={() => {}}
      />
    </div>
  ),
}
