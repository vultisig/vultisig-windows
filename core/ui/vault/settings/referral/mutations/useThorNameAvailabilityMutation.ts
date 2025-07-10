import { useMutation } from '@tanstack/react-query'

import { checkAvailability } from '../serivces/getThorname'

export const useThorNameAvailabilityMutation = () =>
  useMutation({
    mutationFn: (name: string) => checkAvailability(name),
  })
