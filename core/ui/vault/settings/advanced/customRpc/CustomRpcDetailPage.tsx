import { InputPasteAction } from '@core/ui/components/InputPasteAction'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import {
  useClearCustomRpcOverrideMutation,
  useCustomRpcOverrides,
  useSetCustomRpcOverrideMutation,
} from '@core/ui/storage/customRpcOverrides'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent as BasePageContent } from '@lib/ui/page/PageContent'
import { PageFooter as BasePageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useMutation } from '@tanstack/react-query'
import { Chain, CosmosChain, EvmChain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { tendermintRpcUrl } from '@vultisig/core-chain/chains/cosmos/tendermintRpcUrl'
import { probeRpcHealth } from '@vultisig/core-chain/chains/customRpc/rpcHealthProbe'
import { evmChainInfo } from '@vultisig/core-chain/chains/evm/chainInfo'
import { attempt } from '@vultisig/lib-utils/attempt'
import { match } from '@vultisig/lib-utils/match'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getCustomRpcChainName } from '.'

const isValidRpcUrl = (raw: string): boolean => {
  const result = attempt(() => new URL(raw))
  if ('error' in result) {
    return false
  }
  const { protocol, hostname } = result.data
  return protocol === 'https:' && hostname.length > 0
}

const getDefaultRpcUrl = (chain: Chain) => {
  if (isChainOfKind(chain, 'evm')) {
    return evmChainInfo[chain as EvmChain].rpcUrls.default.http[0]
  }

  if (isChainOfKind(chain, 'cosmos')) {
    return tendermintRpcUrl[chain as CosmosChain]
  }

  return undefined
}

export const CustomRpcDetailPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [{ chain }] = useCoreViewState<'customRpcDetail'>()
  const overrides = useCustomRpcOverrides()
  const { addToast } = useToast()

  const existingOverride = overrides[chain]
  const [value, setValue] = useState(existingOverride ?? '')
  const defaultRpcUrl = getDefaultRpcUrl(chain)

  const probe = useMutation({
    mutationFn: (url: string) => probeRpcHealth({ chain, url }),
  })
  const setOverride = useSetCustomRpcOverrideMutation()
  const clearOverride = useClearCustomRpcOverrideMutation()

  const trimmed = value.trim()
  const isValid = isValidRpcUrl(trimmed)
  const isEmpty = trimmed.length === 0
  const showInvalid = !isEmpty && !isValid

  const clearsExisting = isEmpty && Boolean(existingOverride)
  // A failed save-time probe blocks persisting the endpoint until the field changes.
  const probeFailed =
    probe.isError ||
    (probe.data !== undefined && probe.data.status !== 'reachable')
  const canSave = (isValid || clearsExisting) && !probeFailed
  const isSaving = setOverride.isPending || clearOverride.isPending

  const onValueChange = (next: string) => {
    setValue(next)
    probe.reset()
  }

  const goBack = () => navigate({ id: 'customRpc' })

  const onSave = async () => {
    if (clearsExisting) {
      clearOverride.mutate(chain, {
        onSuccess: () => {
          addToast({ message: t('custom_rpc_saved') })
          goBack()
        },
      })
    } else {
      const result = await probe.mutateAsync(trimmed).catch(() => undefined)

      if (result?.status !== 'reachable') {
        return
      }

      setOverride.mutate(
        { chain, url: trimmed },
        {
          onSuccess: () => {
            addToast({ message: t('custom_rpc_saved') })
            goBack()
          },
        }
      )
    }
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={`${getCustomRpcChainName(chain)} RPC`}
      />
      <PageContent flexGrow scrollable>
        <ContentFrame>
          <RpcInputField>
            <RpcFieldLabel
              as="label"
              color="shy"
              size={14}
              weight="500"
              height={20 / 14}
            >
              {t('rpc_endpoint')}
            </RpcFieldLabel>
            <RpcTextAreaWrapper $invalid={showInvalid}>
              <RpcTextArea
                placeholder={t('custom_rpc_url_hint')}
                value={value}
                onChange={event => onValueChange(event.currentTarget.value)}
              />
              <PasteAction onPaste={onValueChange} />
            </RpcTextAreaWrapper>
            <Text variant="footnote">{t('custom_rpc_editor_hint')}</Text>
          </RpcInputField>
          {showInvalid && (
            <Text color="danger" size={12}>
              {t('custom_rpc_invalid_url')}
            </Text>
          )}
          <TestResult
            hasError={probe.isError}
            isTesting={probe.isPending}
            result={probe.data}
          />
          {existingOverride && defaultRpcUrl && (
            <DefaultEndpointCard>
              <Text size={14} color="shy" weight="500" height={20 / 14}>
                {t('custom_rpc_default_endpoint')}
              </Text>
              <DefaultEndpointText size={14} color="shy" height={20 / 14}>
                {defaultRpcUrl}
              </DefaultEndpointText>
            </DefaultEndpointCard>
          )}
        </ContentFrame>
      </PageContent>
      <PageFooter>
        <FooterFrame>
          <Button
            disabled={!canSave || isSaving || probe.isPending}
            loading={isSaving || probe.isPending}
            onClick={onSave}
          >
            {t('custom_rpc_save_button')}
          </Button>
          {existingOverride && (
            <Button
              kind="secondary"
              loading={clearOverride.isPending}
              onClick={() =>
                clearOverride.mutate(chain, {
                  onSuccess: () => {
                    addToast({ message: t('custom_rpc_saved') })
                    goBack()
                  },
                })
              }
            >
              {t('custom_rpc_reset_button')}
            </Button>
          )}
        </FooterFrame>
      </PageFooter>
    </VStack>
  )
}

const PageContent = styled(BasePageContent)`
  align-items: center;
`

const PageFooter = styled(BasePageFooter)`
  align-items: center;
`

const ContentFrame = styled(VStack)`
  gap: 16px;
  width: min(100%, 343px);
`

const FooterFrame = styled(VStack)`
  gap: 12px;
  width: min(100%, 343px);
`

const RpcInputField = styled(VStack)`
  gap: 8px;
`

const RpcFieldLabel = styled(Text)`
  text-transform: uppercase;
`

const RpcTextAreaWrapper = styled.div<{ $invalid: boolean }>`
  background: ${getColor('foreground')};
  border: 1px solid
    ${({ $invalid }) =>
      $invalid ? getColor('danger') : getColor('foregroundSuper')};
  border-radius: 12px;
  display: flex;
  gap: 4px;
  min-height: 120px;
  padding: 16px;
`

const RpcTextArea = styled.textarea`
  background: transparent;
  border: 0;
  color: ${getColor('text')};
  flex: 1;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  min-width: 0;
  outline: 0;
  resize: none;

  &::placeholder {
    color: ${getColor('textShy')};
  }
`

const PasteAction = styled(InputPasteAction)`
  flex: none;
  margin: -8px -8px 0 0;
`

const DefaultEndpointCard = styled(VStack)`
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundSuper')};
  border-radius: 12px;
  gap: 20px;
  padding: 16px;
`

const DefaultEndpointText = styled(Text)`
  overflow-wrap: anywhere;
`

type TestResultProps = {
  hasError: boolean
  isTesting: boolean
  result: Awaited<ReturnType<typeof probeRpcHealth>> | undefined
}

const TestResult = ({ hasError, isTesting, result }: TestResultProps) => {
  const { t } = useTranslation()

  if (isTesting) {
    return (
      <Text color="shy" size={12}>
        {t('custom_rpc_testing')}
      </Text>
    )
  }

  if (!result && !hasError) {
    return null
  }

  if (result?.status === 'reachable') {
    return (
      <Text color="success" size={12}>
        {result.networkVerified
          ? t('custom_rpc_reachable', { ms: result.latencyMs })
          : t('custom_rpc_reachable_unverified', { ms: result.latencyMs })}
      </Text>
    )
  }

  if (!result) {
    return (
      <Text color="danger" size={12}>
        {t('custom_rpc_unreachable')}
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
