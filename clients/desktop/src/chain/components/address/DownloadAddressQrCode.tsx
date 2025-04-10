import { FileUpIcon } from '@lib/ui/icons/FileUpIcon'
import { ValueProp } from '@lib/ui/props'

import { SaveAsImage } from '../../../ui/file/SaveAsImage'
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton'
import { PrintableQrCode } from '../../../ui/qr/PrintableQrCode'

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
