import { CoreView } from '@core/ui/navigation/CoreView'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'

export function useCoreNavigate() {
  return useNavigate<CoreView>()
}
