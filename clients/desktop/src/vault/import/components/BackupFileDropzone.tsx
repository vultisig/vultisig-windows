import { t } from 'i18next'
import { useDropzone } from 'react-dropzone'

import { CloudUploadIcon } from '../../../lib/ui/icons/CloudUploadIcon'
import { InteractiveDropZoneContainer } from '../../../lib/ui/inputs/upload/DropZoneContainer'
import { DropZoneContent } from '../../../lib/ui/inputs/upload/DropZoneContent'
import { Text } from '../../../lib/ui/text'
import { vaultBackupExtensions } from '../VaultBackupExtension'

type BackupFileDropzoneProps = {
  onFinish: (data: File) => void
}

export const BackupFileDropzone = ({ onFinish }: BackupFileDropzoneProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/octet-stream': vaultBackupExtensions.map(
        extension => `.${extension}`
      ),
    },
    onDrop: acceptedFiles => {
      const [file] = acceptedFiles
      if (file) {
        onFinish(file)
      }
    },
  })

  return (
    <>
      <InteractiveDropZoneContainer {...getRootProps()}>
        <DropZoneContent
          icon={
            <div style={{ color: '#2155DF' }}>
              <CloudUploadIcon />
            </div>
          }
        >
          <Text color="supporting">{t('select_backup_file')}</Text>
        </DropZoneContent>
        <input {...getInputProps()} />
      </InteractiveDropZoneContainer>
      <Text color="shy">Supported file types: .bak & .vult</Text>
    </>
  )
}
