import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import {
  useClearCustomRpcOverrideMutation,
  useCustomRpcOverrides,
  useSetCustomRpcOverrideMutation,
} from '@core/ui/storage/customRpcOverrides'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { probeRpcHealth } from '@vultisig/core-chain/chains/customRpc/rpcHealthProbe'
import { attempt } from '@vultisig/lib-utils/attempt'
import { match } from '@vultisig/lib-utils/match'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const isValidRpcUrl = (raw: string): boolean => {
  const result = attempt(() => new URL(raw))
  if ('error' in result) {
    return false
  }
  const { protocol, hostname } = result.data
  return (protocol === 'http:' || protocol === 'https:') && hostname.length > 0
}

export const CustomRpcDetailPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [{ chain }] = useCoreViewState<'customRpcDetail'>()
  const overrides = useCustomRpcOverrides()

  const existingOverride = overrides[chain]
  const [value, setValue] = useState(existingOverride ?? '')

  const probe = useMutation({
    mutationFn: (url: string) => probeRpcHealth({ chain, url }),
  })
  const setOverride = useSetCustomRpcOverrideMutation()
  const clearOverride = useClearCustomRpcOverrideMutation()

  const trimmed = value.trim()
  const isValid = isValidRpcUrl(trimmed)
  const isEmpty = trimmed.length === 0
  const showInvalid = !isEmpty && !isValid

  // Saving an emptied field clears an existing override (falls back to default).
  const clearsExisting = isEmpty && Boolean(existingOverride)
  const canSave = isValid || clearsExisting
  const isSaving = setOverride.isPending || clearOverride.isPending

  const onValueChange = (next: string) => {
    setValue(next)
    probe.reset()
  }

  const goBack = () => navigate({ id: 'customRpc' })

  const onSave = () => {
    if (clearsExisting) {
      clearOverride.mutate(chain, { onSuccess: goBack })
    } else {
      setOverride.mutate({ chain, url: trimmed }, { onSuccess: goBack })
    }
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={chain}
      />
      <PageContent gap={12} flexGrow scrollable>
        <TextInput
          label={t('custom_rpc_url_label')}
          placeholder={t('custom_rpc_url_hint')}
          value={value}
          onValueChange={onValueChange}
          validation={showInvalid ? 'invalid' : undefined}
        />
        {showInvalid && (
          <Text color="danger" size={12}>
            {t('custom_rpc_invalid_url')}
          </Text>
        )}
        <TestResult isTesting={probe.isPending} result={probe.data} />
      </PageContent>
      <PageFooter gap={12}>
        <HStack gap={12}>
          <Button
            kind="secondary"
            style={{ flex: 1 }}
            disabled={!isValid || probe.isPending}
            loading={probe.isPending}
            onClick={() => probe.mutate(trimmed)}
          >
            {t('custom_rpc_test_button')}
          </Button>
          <Button
            style={{ flex: 1 }}
            disabled={!canSave || isSaving}
            loading={isSaving}
            onClick={onSave}
          >
            {t('save')}
          </Button>
        </HStack>
        {existingOverride && (
          <Button
            kind="primary"
            status="danger"
            loading={clearOverride.isPending}
            onClick={() => clearOverride.mutate(chain, { onSuccess: goBack })}
          >
            {t('custom_rpc_reset_button')}
          </Button>
        )}
      </PageFooter>
    </VStack>
  )
}

type TestResultProps = {
  isTesting: boolean
  result: Awaited<ReturnType<typeof probeRpcHealth>> | undefined
}

const TestResult = ({ isTesting, result }: TestResultProps) => {
  const { t } = useTranslation()

  if (isTesting) {
    return (
      <Text color="shy" size={12}>
        {t('custom_rpc_testing')}
      </Text>
    )
  }

  if (!result) {
    return null
  }

  if (result.status === 'reachable') {
    return (
      <Text color="success" size={12}>
        {result.networkVerified
          ? t('custom_rpc_reachable', { ms: result.latencyMs })
          : t('custom_rpc_reachable_unverified', { ms: result.latencyMs })}
      </Text>
    )
  }

  return (
    <Text color="danger" size={12}>
      {match(result.status, {
        wrongChain: () => t('custom_rpc_wrong_chain'),
        invalidResponse: () => t('custom_rpc_invalid_response'),
        unreachable: () => t('custom_rpc_unreachable'),
      })}
    </Text>
  )
}
