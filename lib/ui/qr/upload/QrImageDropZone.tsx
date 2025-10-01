import { ComputerUploadIcon } from '@lib/ui/icons/ComputerUploadIcon'
import { InteractiveDropZoneContainer } from '@lib/ui/inputs/upload/DropZoneContainer'
import { DropZoneContent } from '@lib/ui/inputs/upload/DropZoneContent'
import { useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'

type QrImageDropZoneProps = {
  onFinish: (data: File) => void
}

export const QrImageDropZone = ({ onFinish }: QrImageDropZoneProps) => {
  const { getRootProps, getInputProps, inputRef } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/webp': ['.webp'],
      'image/tiff': ['.tiff', '.tif'],
      'image/svg+xml': ['.svg'],
    },
    onDrop: acceptedFiles => {
      const [file] = acceptedFiles
      if (file) {
        onFinish(file)
      }
    },
  })

  useEffect(() => {
    const input = inputRef.current

    if (!input) return

    const handlePaste = async (event: ClipboardEvent) => {
      if (event.clipboardData?.files) {
        input.files = event.clipboardData.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [inputRef])

  const { t } = useTranslation()

  return (
    <InteractiveDropZoneContainer {...getRootProps()}>
      <DropZoneContent
        icon={
          <div style={{ color: '#2155DF' }}>
            <ComputerUploadIcon />
          </div>
        }
      >
        {t('upload_file_or_drag_and_drop')}
      </DropZoneContent>
      <input {...getInputProps()} />
    </InteractiveDropZoneContainer>
  )
}
