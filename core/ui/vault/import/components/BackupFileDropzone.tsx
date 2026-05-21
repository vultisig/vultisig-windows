import {
  importableVaultBackupExtensions,
  vaultBackupArchiveExtensions,
  vaultBackupExtensions,
} from '@core/ui/vault/import/VaultBackupExtension'
import { CircleCrossFilledIcon } from '@lib/ui/icons/CircleCrossFilledIcon'
import { CloudUploadIcon } from '@lib/ui/icons/CloudUploadIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InteractiveDropZoneContainer } from '@lib/ui/inputs/upload/DropZoneContainer'
import { DropZoneContent } from '@lib/ui/inputs/upload/DropZoneContent'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type BackupFileDropzoneProps = {
  onFinish: (data: File) => void
  onError: (error: Error) => void
  error?: string
  fileName?: string
}

export const BackupFileDropzone = ({
  onFinish,
  onError,
  error,
  fileName,
}: BackupFileDropzoneProps) => {
  const { t } = useTranslation()
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/octet-stream': vaultBackupExtensions.map(
        extension => `.${extension}`
      ),
      'application/zip': vaultBackupArchiveExtensions.map(
        extension => `.${extension}`
      ),
      'application/x-zip-compressed': vaultBackupArchiveExtensions.map(
        extension => `.${extension}`
      ),
    },
    onDrop: acceptedFiles => {
      const [file] = acceptedFiles
      if (file) {
        onFinish(file)
      } else {
        onError(new Error(t('invalid_file_format')))
      }
    },
  })
  const hasError = !!error && !!fileName

  return (
    <>
      <Container $hasError={hasError} {...getRootProps()}>
        {hasError ? (
          <VStack gap={16} alignItems="center">
            <ErrorIconContainer>
              <CircleCrossFilledIcon />
            </ErrorIconContainer>
            <Text color="regular" weight="600" size={14}>
              {fileName}
            </Text>
            <Text centerHorizontally color="danger" size={13}>
              {error}
            </Text>
          </VStack>
        ) : (
          <DropZoneContent
            icon={
              <div style={{ color: '#2155DF' }}>
                <CloudUploadIcon />
              </div>
            }
          >
            <Text color="supporting">{t('select_backup_file')}</Text>
          </DropZoneContent>
        )}
        <input {...getInputProps()} />
      </Container>
      <Text color="shy">
        Supported file types:
        {importableVaultBackupExtensions
          .map(extension => `.${extension}`)
          .join(', ')}
      </Text>
    </>
  )
}

const Container = styled(InteractiveDropZoneContainer)<{ $hasError: boolean }>`
  border-color: ${({ $hasError }) =>
    $hasError ? getColor('danger') : getColor('foregroundSuper')};
  background: ${({ theme, $hasError }) =>
    $hasError
      ? theme.colors.danger.getVariant({ a: () => 0.08 }).toCssValue()
      : theme.colors.foreground.toCssValue()};
`

const ErrorIconContainer = styled(IconWrapper)`
  color: ${getColor('danger')};
  font-size: 60px;
`
