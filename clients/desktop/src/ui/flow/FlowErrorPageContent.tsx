import { Button } from '@lib/ui/buttons/Button'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ActionProp, MessageProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { makeAppPath } from '../../navigation'
import { PageContent } from '../page/PageContent'

export const FlowErrorPageContent = ({
  action,
  message,
  title,
}: Partial<ActionProp> & Partial<MessageProp> & TitleProp) => {
  const { t } = useTranslation()

  return (
    <PageContent>
      <VStack flexGrow gap={24} alignItems="center" justifyContent="center">
        <IconWrapper justifyContent="center" alignItems="center">
          <CrossIcon />
        </IconWrapper>
        <VStack style={{ maxWidth: 320 }} alignItems="center" gap={8}>
          <Text size={22} color="danger" centerHorizontally>
            {title}
          </Text>
          {message && (
            <Text
              style={{ wordBreak: 'break-word', maxWidth: '100%' }}
              centerHorizontally
              color="supporting"
            >
              {message}
            </Text>
          )}
        </VStack>
      </VStack>
      {action ?? (
        <Link to={makeAppPath('vault')}>
          <Button as="div">{t('try_again')}</Button>
        </Link>
      )}
    </PageContent>
  )
}

const IconWrapper = styled(HStack)`
  font-size: 16px;
  height: 24px;
  width: 26px;
  border-radius: 99px;
  background-color: ${getColor('danger')};
  color: ${getColor('foreground')};
`
