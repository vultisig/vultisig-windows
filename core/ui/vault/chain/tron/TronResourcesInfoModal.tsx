import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCore } from '@core/ui/state/core'
import CaretDownIcon from '@lib/ui/icons/CaretDownIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TronBandwidthIcon } from '@lib/ui/icons/TronBandwidthIcon'
import { TronEnergyIcon } from '@lib/ui/icons/TronEnergyIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { vStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { motion, Transition } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const tronDocsUrl = 'https://developers.tron.network/docs/resource-model'

const bandwidthAccent = '#13C89D'
const energyAccent = '#FFC25C'

type AccordionSection = 'bandwidth' | 'energy'

const contentTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
}

type TronResourcesInfoModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const TronResourcesInfoModal = ({
  isOpen,
  onClose,
}: TronResourcesInfoModalProps) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const [expanded, setExpanded] = useState<AccordionSection | null>(null)

  const toggle = (section: AccordionSection) => {
    setExpanded(prev => (prev === section ? null : section))
  }

  return (
    <ResponsiveModal
      grabbable
      isOpen={isOpen}
      onClose={onClose}
      modalProps={{ withDefaultStructure: false }}
      containerStyles={{ padding: '24px' }}
    >
      <ContentContainer gap={24}>
        <VStack alignItems="center" gap={24}>
          <HStack alignItems="center" gap={8}>
            <ChainEntityIcon
              value={getChainLogoSrc(Chain.Tron)}
              style={{ fontSize: 24 }}
            />
            <Text size={13} weight="500" color="contrast">
              TRON
            </Text>
          </HStack>
          <Text size={18} weight="700" color="contrast">
            {t('tron_bandwidth_and_energy')}
          </Text>
        </VStack>

        <AccordionWrapper>
          <RowWrapper
            tabIndex={0}
            role="button"
            onClick={() => toggle('bandwidth')}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <HStack gap={8} alignItems="center">
                <BandwidthIconCircle>
                  <TronBandwidthIcon
                    style={{ fontSize: 16, color: bandwidthAccent }}
                  />
                </BandwidthIconCircle>
                <Text size={14} color="contrast" weight="600">
                  {t('tron_bandwidth')}
                </Text>
              </HStack>
              <motion.div
                animate={{ rotate: expanded === 'bandwidth' ? 180 : 0 }}
                transition={contentTransition}
              >
                <IconWrapper size={16} color="textSupporting">
                  <CaretDownIcon />
                </IconWrapper>
              </motion.div>
            </HStack>
            <motion.div
              initial="collapsed"
              animate={expanded === 'bandwidth' ? 'expanded' : 'collapsed'}
              variants={{
                collapsed: { height: 0, opacity: 0, marginTop: 0 },
                expanded: {
                  height: 'initial',
                  opacity: 1,
                  marginTop: 12,
                },
              }}
              transition={contentTransition}
            >
              <Text size={13} height="regular">
                {t('tron_bandwidth_description')}
              </Text>
            </motion.div>
          </RowWrapper>

          <Divider />

          <RowWrapper
            tabIndex={0}
            role="button"
            onClick={() => toggle('energy')}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <HStack gap={8} alignItems="center">
                <EnergyIconCircle>
                  <TronEnergyIcon
                    style={{ fontSize: 16, color: energyAccent }}
                  />
                </EnergyIconCircle>
                <Text size={14} color="contrast" weight="600">
                  {t('tron_energy')}
                </Text>
              </HStack>

              <motion.div
                animate={{ rotate: expanded === 'energy' ? 180 : 0 }}
                transition={contentTransition}
              >
                <IconWrapper size={16} color="textSupporting">
                  <CaretDownIcon />
                </IconWrapper>
              </motion.div>
            </HStack>

            <motion.div
              initial="collapsed"
              animate={expanded === 'energy' ? 'expanded' : 'collapsed'}
              variants={{
                collapsed: { height: 0, opacity: 0, marginTop: 0 },
                expanded: {
                  height: 'initial',
                  opacity: 1,
                  marginTop: 12,
                },
              }}
              transition={contentTransition}
            >
              <Text size={13} height="regular">
                {t('tron_energy_description')}
              </Text>
            </motion.div>
          </RowWrapper>
        </AccordionWrapper>

        <LearnMoreButton onClick={() => openUrl(tronDocsUrl)}>
          <Text size={14} weight="600" color="contrast">
            {t('learnMore')}
          </Text>
        </LearnMoreButton>
      </ContentContainer>
    </ResponsiveModal>
  )
}

const ContentContainer = styled(VStack)`
  padding: 0 16px 20px 16px;
  overflow: hidden;

  @media ${mediaQuery.tabletDeviceAndUp} {
    padding: 24px;
    background: ${getColor('background')};
    border-radius: 12px;
    border: 1px solid ${getColor('mistExtra')};
    max-width: 480px;
    width: 100%;
  }
`

const BandwidthIconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  background: rgba(19, 200, 157, 0.1);
  flex-shrink: 0;
`

const EnergyIconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  background: #1b2430;
  flex-shrink: 0;
`

const RowWrapper = styled.div`
  padding: 16px;
  ${vStack({
    gap: 4,
  })};
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`

const AccordionWrapper = styled.div`
  border-radius: 12px;
  background-color: ${getColor('foreground')};

  & > ${RowWrapper}:first-of-type {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  & > ${RowWrapper}:last-of-type {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
`

const LearnMoreButton = styled.button`
  display: flex;
  width: 100%;
  padding: 14px 32px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 99px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  box-shadow: 0 1px 1px 0 rgba(255, 255, 255, 0.1) inset;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`
