import { deepLinkBaseUrl } from '@core/config'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { GetOSArgs } from '../../../wailsjs/go/main/App'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'

export const LauncherObserver = () => {
  const navigate = useAppNavigate()

  const { mutate } = useMutation({
    mutationFn: async () => {
      const args = await GetOSArgs()

      const url = args.find(arg => arg.startsWith(deepLinkBaseUrl))
      const filePath = args.find(arg => arg.endsWith('.vult'))

      if (url) {
        navigate('deeplink', { state: { url } })
      } else if (filePath) {
        navigate('importVaultFromFile', { state: { filePath } })
      }
    },
  })

  useEffect(mutate, [mutate])

  return null
}
