import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'

import { AppView } from '../AppView'

export function useAppNavigate() {
  return useNavigate<AppView>()
}
