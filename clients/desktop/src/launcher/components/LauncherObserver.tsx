import { useMutation } from '@tanstack/react-query'
import { deepLinkBaseUrl, deepLinkBaseUrlAt } from '@vultisig/core-config'
import { useEffect } from 'react'

import { GetOSArgs } from '../../../wailsjs/go/main/App'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'

export const LauncherObserver = () => {
  const navigate = useAppNavigate()

  const { mutate } = useMutation({
    mutationFn: async () => {
      const args = await GetOSArgs()

      const url = args.find(arg =>
        [deepLinkBaseUrl, deepLinkBaseUrlAt].some(base => arg.startsWith(base))
      )
      const filePath = args.find(arg => arg.endsWith('.vult'))

      if (url) {
        navigate({ id: 'deeplink', state: { url } })
      } else if (filePath) {
        navigate({ id: 'importVaultFromFile', state: { filePath } })
      }
    },
  })

  useEffect(mutate, [mutate])

  return null
}
