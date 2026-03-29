import { rootApiUrl } from '@core/config'

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __FAST_VAULT_URL__: string | undefined

const fastVaultUrlOverride =
  typeof __FAST_VAULT_URL__ !== 'undefined' && __FAST_VAULT_URL__ !== ''
    ? __FAST_VAULT_URL__
    : null

export const fastVaultServerUrl = fastVaultUrlOverride ?? `${rootApiUrl}/vault`
