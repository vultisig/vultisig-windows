import { OnFinishProp } from '@lib/ui/props'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { StepTransition } from '../../lib/ui/base/StepTransition'
import { Button } from '../../lib/ui/buttons/Button'
import { toSizeUnit } from '../../lib/ui/css/toSizeUnit'
import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon'
import { HStack, vStack } from '../../lib/ui/layout/Stack'
import { gradientText, text } from '../../lib/ui/text'
import { Animation } from '../../ui/animations/Animation'
import { FlowPageHeader } from '../../ui/flow/FlowPageHeader'
import { FitPageContent } from '../../ui/page/PageContent'

const contentMaxWidth = 560

const Container = styled.div`
  ${vStack({
    gap: 40,
    flexGrow: true,
  })}
`

const Content = styled.div`
  ${vStack({
    flexGrow: true,
  })}

  > * {
    &:first-child {
      max-height: ${toSizeUnit(contentMaxWidth)};
    }
  }
`

const PrimaryText = styled.p`
  ${text({ size: 32, color: 'contrast', centerHorizontally: true })}

  b {
    font-weight: inherit;
    ${gradientText}
  }
`

export const MigrateIntro = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  return (
    <>
      <FlowPageHeader title={t('upgrade_vault')} />
      <FitPageContent contentMaxWidth={contentMaxWidth}>
        <Container>
          <StepTransition
            from={({ onForward }) => (
              <>
                <Content>
                  <Animation value="upgrade/upgrade" />
                  <PrimaryText>
                    <Trans
                      i18nKey="upgrade_vault_description"
                      components={{ b: <b /> }}
                    />
                  </PrimaryText>
                </Content>
                <Button onClick={onForward}>{t('upgrade_now')}</Button>
              </>
            )}
            to={() => (
              <>
                <Content>
                  <Animation value="upgrade/all_devices" />
                  <PrimaryText>
                    <Trans
                      i18nKey="upgrade_all_devices"
                      components={{ b: <b /> }}
                    />
                  </PrimaryText>
                </Content>
                <Button onClick={onFinish}>
                  <HStack alignItems="center" gap={8}>
                    {t('got_it')}
                    <ChevronRightIcon size={20} />
                  </HStack>
                </Button>
              </>
            )}
          />
        </Container>
      </FitPageContent>
    </>
  )
}
