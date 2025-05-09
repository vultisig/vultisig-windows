import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { PrintableQrCode } from '@core/ui/qr/PrintableQrCode'
import { FileUpIcon } from '@lib/ui/icons/FileUpIcon'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { ValueProp } from '@lib/ui/props'

export const DownloadAddressQrCode = ({ value }: ValueProp<string>) => {
  return (
    <SaveAsImage
      fileName={value}
      renderTrigger={({ onClick }) => (
        <PageHeaderIconButton icon={<FileUpIcon />} onClick={onClick} />
      )}
      value={<PrintableQrCode title={value} value={value} />}
    />
  )
}
