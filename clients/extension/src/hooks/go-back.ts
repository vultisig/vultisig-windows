import { useLocation, useNavigate } from 'react-router-dom'

const useGoBack = (): ((path?: string) => void) => {
  const { pathname, state } = useLocation()
  const navigate = useNavigate()

  const goBack = (path?: string) => {
    if (state) {
      navigate(-1)
    } else if (path) {
      navigate(path)
    } else {
      navigate(pathname, { replace: true })
    }
  }

  return goBack
}

export default useGoBack
