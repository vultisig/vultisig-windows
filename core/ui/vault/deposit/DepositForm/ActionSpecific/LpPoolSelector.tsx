import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { AssetRequiredLabel, Container } from '../DepositForm.styled'
import { ThorLpPoolExplorer } from './ThorLpPoolExplorer'

type LpPoolSelectorProps = InputProps<string | null> & {
  pools: string[]
}

/** Field that opens the pool list, marked required until a pool is picked. */
export const LpPoolSelector = ({
  value,
  onChange,
  pools,
}: LpPoolSelectorProps) => {
  const { t } = useTranslation()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Container onClick={onOpen}>
          <HStack alignItems="center" gap={4}>
            <Text weight="400" family="mono" size={16}>
              {value || t('select_pool')}
            </Text>
            {!value && (
              <AssetRequiredLabel as="span" color="danger" size={14}>
                *
              </AssetRequiredLabel>
            )}
          </HStack>
          <IconWrapper style={{ fontSize: 20 }}>
            <ChevronRightIcon />
          </IconWrapper>
        </Container>
      )}
      renderContent={({ onClose }) => (
        <ThorLpPoolExplorer
          pools={pools}
          activePool={value}
          onPoolClick={pool => {
            onChange(pool)
            onClose()
          }}
          onClose={onClose}
        />
      )}
    />
  )
}
