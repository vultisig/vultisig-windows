import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { PrintableQrCode } from '@core/ui/qr/PrintableQrCode'
import { ElementSizeAware } from '@lib/ui/base/ElementSizeAware'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FileUpIcon } from '@lib/ui/icons/FileUpIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { FramedQrCode } from '@lib/ui/qr/FramedQrCode'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const AddressPage = () => {
  const [{ address }] = useCoreViewState<'address'>()

  const { t } = useTranslation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <SaveAsImage
            fileName={address}
            renderTrigger={({ onClick }) => (
              <IconButton onClick={onClick}>
                <FileUpIcon />
              </IconButton>
            )}
            value={<PrintableQrCode title={address} value={address} />}
          />
        }
        title={t('address')}
        hasBorder
      />
      <PageContent
        alignItems="center"
        gap={24}
        justifyContent="center"
        flexGrow
      >
        <Text color="contrast" family="mono" size={14} weight="600">
          {address}
        </Text>
        <ElementSizeAware
          render={({ setElement, size }) => (
            <VStack ref={setElement}>
              {size && <FramedQrCode value={address} />}
            </VStack>
          )}
        />
      </PageContent>
    </VStack>
  )
}
