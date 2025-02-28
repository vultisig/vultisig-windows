import { Href, useRouter } from 'expo-router'

export const useExpoRouter = () => {
  const router = useRouter()

  const navigate = (path: Href) => router.replace(path)

  return { navigate }
}
