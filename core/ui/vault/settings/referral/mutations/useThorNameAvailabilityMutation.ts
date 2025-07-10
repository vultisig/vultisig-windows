import { useMutation } from '@tanstack/react-query'

import { checkAvailability } from '../services/getThorname'

export const useThorNameAvailabilityMutation = () =>
  useMutation({
    mutationFn: (name: string) => checkAvailability(name),
  })
