import {
  currentProductBrand,
  currentProductBrandConfig,
} from '../product/brand'

export const vultisigWindowsGithubUrl =
  'https://github.com/vultisig/vultisig-windows'

export const discordReferralUrl = 'https://discord.gg/ngvW8tRRfB'
export const vultisigTwitterUrl = 'https://x.com/vultisig'
export const currentProductWebsiteUrl = currentProductBrandConfig.websiteUrl
export const vultisigPrivacyPolicyUrl = `${currentProductWebsiteUrl}/privacy`
export const vultisigTermsOfServiceUrl = `${currentProductWebsiteUrl}/termofservice`
const vultisigEducationUrl = 'https://docs.vultisig.com'
export const currentProductEducationUrl =
  currentProductBrand === 'station'
    ? currentProductWebsiteUrl
    : vultisigEducationUrl
export const shouldShowVultisigCommunity = currentProductBrand === 'vultisig'
