import { useLocation, useNavigate } from "react-router-dom";

const useGoBack = (): ((path?: string) => void) => {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();

  const goBack = (path?: string) => {
    state
      ? navigate(-1)
      : path
      ? navigate(path)
      : navigate(pathname, { replace: true });
  };

  return goBack;
};

export default useGoBack;
