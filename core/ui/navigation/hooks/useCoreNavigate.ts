import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'

import { CoreView } from '../CoreView'

export function useCoreNavigate() {
  return useNavigate<CoreView>()
}
