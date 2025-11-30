import { fromTssType } from '@core/mpc/types/utils/tssType'
import { LibType } from '@core/mpc/types/vultisig/keygen/v1/lib_type_message_pb'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useMutation } from '@tanstack/react-query'

import { NewVaultData } from '../queries/useParseDeeplinkQuery'

export const useProcessNewVaultMutation = () => {
  const navigate = useCoreNavigate()
  const { mpcDevice } = useCore()

  return useMutation({
    mutationFn: async (data: NewVaultData) => {
      const { keygenMsg, tssType } = data
      const libType = 'libType' in keygenMsg ? keygenMsg.libType : LibType.GG20

      if (libType === LibType.GG20 && mpcDevice === 'extension') {
        throw new Error(
          'GG20 vault type is not supported on extension. Please use desktop app or mobile app.'
        )
      }

      const keygenOperation = fromTssType(tssType)
      navigate(
        {
          id: 'joinKeygen',
          state: {
            keygenOperation,
            keygenMsg,
          },
        },
        {
          replace: true,
        }
      )
    },
  })
}
