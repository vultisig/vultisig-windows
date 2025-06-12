import fs from 'fs'

type CreateFileParams = {
  directory: string
  fileName: string
  content: string
  extension: string
}

export const createFile = ({
  directory,
  fileName,
  content,
  extension,
}: CreateFileParams) => {
  fs.mkdirSync(directory, { recursive: true })

  const tsFilePath = `${directory}/${fileName}.${extension}`

  fs.writeFileSync(tsFilePath, content)
}
