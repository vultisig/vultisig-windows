import { useQuery } from '@tanstack/react-query'

export const cameraPermissionQueryKey = ['cameraPermission']

export const useCameraPermissionQuery = () => {
  return useQuery({
    queryKey: cameraPermissionQueryKey,
    queryFn: async () => {
      const { state } = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      })
      return state
    },
    refetchOnWindowFocus: false,
  })
}
