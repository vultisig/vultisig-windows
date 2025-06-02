import { useJoinKeygenUrlQuery } from '@core/ui/mpc/keygen/queries/useJoinKeygenUrlQuery'
import { useEffect } from 'react'

interface JoinKeygenUrlSenderProps {
  onJoinUrl: (url: string) => void
}

export const JoinKeygenUrlSender = ({
  onJoinUrl,
}: JoinKeygenUrlSenderProps) => {
  const joinUrlQuery = useJoinKeygenUrlQuery()

  useEffect(() => {
    if (joinUrlQuery.data) {
      onJoinUrl(joinUrlQuery.data)
    }
  }, [joinUrlQuery.data, onJoinUrl])

  return null
}
