import { ArrowWallDownIcon } from '@lib/ui/icons/ArrowWallDownIcon'
import { CalendarIcon } from '@lib/ui/icons/CalendarIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const CircleYieldDetails = () => {
  const { t } = useTranslation()

  return (
    <Container>
      <Header>
        <Text size={14} weight={500} color="shyExtra">
          {t('circle.yield_details')}
        </Text>
      </Header>
      <VStack gap={14}>
        <StatRow>
          <HStack gap={4} alignItems="center">
            <IconWrapper size={16} color="textSupporting">
              <PercentIcon />
            </IconWrapper>
            <Text size={14} weight={500} color="supporting">
              {t('circle.apy')}
            </Text>
          </HStack>
          <Text size={16} weight={500} color="success">
            5.17%
          </Text>
        </StatRow>

        <Divider />

        <HStack gap={16} fullWidth>
          <VStack gap={6} flexGrow>
            <HStack gap={4} alignItems="center">
              <IconWrapper size={16} color="textSupporting">
                <CalendarIcon />
              </IconWrapper>
              <Text size={14} weight={500} color="supporting">
                {t('circle.total_rewards')}
              </Text>
            </HStack>
            <Text size={16} weight={500} color="shyExtra">
              1,293.23 USDC
            </Text>
          </VStack>

          <VStack gap={6} flexGrow>
            <HStack gap={4} alignItems="center">
              <IconWrapper size={16} color="textSupporting">
                <TrophyIcon />
              </IconWrapper>
              <Text size={14} weight={500} color="supporting">
                {t('circle.current_rewards')}
              </Text>
            </HStack>
            <Text size={16} weight={500} color="success">
              +428.25 USDC
            </Text>
          </VStack>
        </HStack>

        <WithdrawButton>
          <ButtonIconWrapper>
            <ArrowWallDownIcon />
          </ButtonIconWrapper>
          <Text size={14} weight={600} color="contrast">
            {t('circle.withdraw')}
          </Text>
        </WithdrawButton>
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('foreground')};
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${getColor('foregroundSuper')};
`

const WithdrawButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  padding: 4px 40px 4px 4px;
  height: 42px;
  border-radius: 30px;
  border: 1px solid ${getColor('buttonPrimary')};
  background: transparent;
  cursor: pointer;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }
`

const ButtonIconWrapper = styled(IconWrapper)`
  width: 34px;
  height: 34px;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`
