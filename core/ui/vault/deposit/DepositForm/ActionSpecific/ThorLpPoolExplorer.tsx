import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { DepositActionOption } from '../DepositActionOption'

type Props = {
  pools: string[]
  activePool: string | null
  onPoolClick: (pool: string) => void
  onClose: () => void
}

export const ThorLpPoolExplorer: FC<Props> = ({
  pools,
  activePool,
  onPoolClick,
  onClose,
}) => {
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title={t('select_pool')}>
      <VStack gap={8}>
        {pools.length > 0 ? (
          pools.map(pool => (
            <DepositActionOption
              key={pool}
              value={pool}
              isActive={activePool === pool}
              onClick={() => onPoolClick(pool)}
            />
          ))
        ) : (
          <Text size={16} color="contrast">
            {t('loading')}
          </Text>
        )}
      </VStack>
    </Modal>
  )
}
