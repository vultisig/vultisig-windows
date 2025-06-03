import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { initializeMessenger } from '../../messengers/initializeMessenger'

const backgroundMessenger = initializeMessenger({ connect: 'background' })

export const PluginReshareMutation = ({ value }: ValueProp<string>) => {
  const { mutate: shareJoinUrl, ...mutationState } = useMutation({
    mutationFn: async (joinUrl: string) => {
      await backgroundMessenger.send('plugin:reshare', {
        joinUrl,
      })
    },
  })

  useEffect(() => {
    shareJoinUrl(value)
  }, [shareJoinUrl, value])

  return <MatchQuery value={mutationState} />
}
