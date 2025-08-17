import { useSetHasFinishedOnboardingMutation } from '@core/ui/storage/onboarding'
import { Button } from '@lib/ui/buttons/Button'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CloudDownloadIcon } from '@lib/ui/icons/CloudDownloadIcon'
import { LayersIcon } from '@lib/ui/icons/LayersIcon'
import { SplitIcon } from '@lib/ui/icons/SplitIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { NewHStack, NewStack, NewVStack } from '@lib/ui/layout/Stack'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

export const OnboardingSummary = () => {
  const { t } = useTranslation()
  const { mutateAsync: onFinish } = useSetHasFinishedOnboardingMutation()
  const [isChecked, { toggle }] = useBoolean(false)
  const { colors } = useTheme()

  const items = [
    {
      color: colors.primaryAlt.toCssValue(),
      icon: CloudDownloadIcon,
      title: t('fastVaultSetup.summary.summaryItemOneTitle'),
    },
    {
      color: colors.primaryAlt.toCssValue(),
      icon: SplitIcon,
      title: t('fastVaultSetup.summary.summaryItemTwoTitle'),
    },
    {
      color: colors.primaryAlt.toCssValue(),
      icon: LayersIcon,
      title: t('fastVaultSetup.summary.summaryItemThreeTitle'),
    },
    {
      color: colors.idle.toCssValue(),
      icon: TriangleAlertIcon,
      title: t('fastVaultSetup.summary.summaryItemFourTitle'),
    },
  ]

  return (
    <NewVStack
      $style={{
        alignItems: 'center',
        flexGrow: '1',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <NewVStack
        as={AnimatedVisibility}
        animationConfig="bottomToTop"
        config={{ duration: 1000 }}
        delay={300}
        $style={{
          gap: '32px',
          maxWidth: '480px',
          padding: '24px',
          width: '100%',
        }}
      >
        <NewVStack $style={{ gap: '24px', overflow: 'hidden' }}>
          <NewStack
            $style={{
              backgroundColor: colors.foreground.toCssValue(),
              border: `1px solid ${colors.foregroundExtra.toCssValue()}`,
              borderLeft: 'none',
              borderRadius: '0 16px 16px 0',
              lineHeight: '16px',
              marginLeft: '2px',
              padding: '8px 12px',
              maxWidth: 'fit-content',
            }}
          >
            <NewStack
              as="span"
              $style={{ color: colors.textShy.toCssValue(), fontSize: '12px' }}
            >
              {t('fastVaultSetup.summary.pillText')}
            </NewStack>
          </NewStack>
          <NewVStack
            $style={{
              borderRadius: '8px',
              fontSize: '24px',
              gap: '16px',
              paddingLeft: '24px',
            }}
          >
            <NewStack
              as="span"
              $style={{
                fontSize: '34px',
                lineHeight: '36px',
                fontWeight: '500',
              }}
            >
              {t('fastVaultSetup.summary.title')}
            </NewStack>
            {items.map((item, index) => (
              <NewHStack
                key={index}
                $after={
                  index + 1 === items.length
                    ? {
                        backgroundColor: colors.foreground.toCssValue(),
                        bottom: '50%',
                        left: '-24px',
                        position: 'absolute',
                        top: '-1000px',
                        width: '2px',
                      }
                    : undefined
                }
                $before={{
                  backgroundColor: colors.foreground.toCssValue(),
                  height: '2px',
                  left: '-24px',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '23px',
                }}
                $style={{
                  alignItems: 'center',
                  backgroundColor: colors.foreground.toCssValue(),
                  border: `1px solid ${colors.foregroundExtra.toCssValue()}`,
                  borderRadius: '16px',
                  gap: '12px',
                  padding: '16px',
                  position: 'relative',
                }}
              >
                <NewStack
                  as={item.icon}
                  $style={{ color: item.color, flex: 'none', fontSize: '24px' }}
                />
                <NewStack
                  as="span"
                  $style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    lineHeight: '18px',
                  }}
                >
                  {item.title}
                </NewStack>
              </NewHStack>
            ))}
          </NewVStack>
        </NewVStack>
        <NewVStack $style={{ alignItems: 'start', gap: '16px' }}>
          <NewHStack
            onClick={toggle}
            role="button"
            tabIndex={0}
            $style={{ alignItems: 'center', cursor: 'pointer', gap: '8px' }}
          >
            <NewStack
              as={Checkbox}
              onChange={() => {}}
              value={isChecked}
              $style={{ pointerEvents: 'none' }}
            />
            <NewStack
              as="span"
              $style={{ fontSize: '14px', fontWeight: '500' }}
            >
              {t('fastVaultSetup.summary.agreementText')}
            </NewStack>
          </NewHStack>
          <Button disabled={!isChecked} onClick={() => onFinish(true)}>
            {t('fastVaultSetup.summary.ctaText')}
          </Button>
        </NewVStack>
      </NewVStack>
    </NewVStack>
  )
}
