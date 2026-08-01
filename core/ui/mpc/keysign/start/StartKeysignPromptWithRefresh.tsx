import { VStack } from '@lib/ui/layout/Stack'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { useState } from 'react'

import { StartKeysignPrompt } from '../prompt/StartKeysignPrompt'
import { StartKeysignPromptProps } from '../prompt/StartKeysignPromptProps'
import { getKeysignPayloadToSign } from './getKeysignPayloadToSign'
import { RefetchableKeysignPayloadQuery } from './refreshKeysignPayload'

type StartKeysignPromptWithRefreshProps<T> = {
  /** The query that built `promptProps.keysignPayload`, rebuilt on start. */
  keysignPayloadQuery: RefetchableKeysignPayloadQuery<T>
  /** Wraps what the query builds into the payload the ceremony consumes. */
  toKeysignPayload: (data: T) => KeysignMessagePayload
  promptProps: StartKeysignPromptProps
}

/**
 * The start-keysign button, with the payload rebuilt at the moment signing
 * starts.
 *
 * Keysign payload queries never refetch on their own, so without this the
 * payload is whatever was built when the review screen mounted — and the SDK's
 * fail-closed gates live inside those builders, which turns them into
 * mount-time checks. A rebuild that fails blocks signing and says why, instead
 * of falling back to the payload whose freshness is in doubt.
 */
export const StartKeysignPromptWithRefresh = <T,>({
  keysignPayloadQuery,
  toKeysignPayload,
  promptProps,
}: StartKeysignPromptWithRefreshProps<T>) => {
  const [refreshError, setRefreshError] = useState<string | null>(null)

  const onBeforeStart = async () => {
    setRefreshError(null)

    return getKeysignPayloadToSign({
      query: keysignPayloadQuery,
      toKeysignPayload,
      onError: setRefreshError,
    })
  }

  return (
    <VStack gap={12} fullWidth>
      {refreshError ? <WarningBlock>{refreshError}</WarningBlock> : null}
      <StartKeysignPrompt {...promptProps} onBeforeStart={onBeforeStart} />
    </VStack>
  )
}
