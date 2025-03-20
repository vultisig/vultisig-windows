import { TxOverviewChainDataRow } from '@clients/desktop/src/chain/tx/components/TxOverviewRow'
import {
  getParsedMemo,
  ParsedMemoParams,
} from '@core/chain/chains/evm/tx/getParsedMemo'
import { ValueProp } from '@lib/ui/props'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  parsedMemo?: ParsedMemoParams
}

export const TxOverviewMemo = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { parsedMemo } = state

  const componentDidMount = (): void => {
    getParsedMemo(value)
      .then(parsedMemo => {
        setState(prevState => ({ ...prevState, parsedMemo }))
      })
      .catch(() => {})
  }

  useEffect(componentDidMount, [value])

  return parsedMemo ? (
    <>
      <TxOverviewChainDataRow>
        <span>{t('function_signature')}</span>
        <span>{parsedMemo.functionSignature}</span>
      </TxOverviewChainDataRow>
      <TxOverviewChainDataRow>
        <span>{t('function_arguments')}</span>
        <pre style={{ width: '100%' }}>
          <code style={{ display: 'block', overflowX: 'auto', width: '100%' }}>
            {parsedMemo.functionArguments}
          </code>
        </pre>
      </TxOverviewChainDataRow>
    </>
  ) : (
    <TxOverviewChainDataRow>
      <span>{t('memo')}</span>
      <span>{value}</span>
    </TxOverviewChainDataRow>
  )
}
