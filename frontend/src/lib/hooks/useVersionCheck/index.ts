import { useQuery } from '@tanstack/react-query';

import {
  LATEST_VERSION_QUERY_KEY,
  LOCAL_VERSION_QUERY_KEY,
  VULTISIG_LOCAL_BUILD_API,
  VULTISIG_RELEASES_API,
} from './constants';
import { isVersionNewer } from './utils';

const useVersionCheck = () => {
  const { data: localVersionData, error: localError } = useQuery({
    queryKey: [LOCAL_VERSION_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch(VULTISIG_LOCAL_BUILD_API);
      if (!response.ok) {
        throw new Error('Error loading local build file');
      }
      return await response.json();
    },
  });

  const {
    data: latestVersionData,
    error: remoteError,
    isFetching: isRemoteFetching,
  } = useQuery({
    queryKey: [LATEST_VERSION_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch(VULTISIG_RELEASES_API);
      if (!response.ok) {
        throw new Error('Error fetching the latest release');
      }
      const data = await response.json();
      return data.tag_name.slice(1);
    },
  });

  const localVersion = localVersionData?.version || '';
  const latestVersion = latestVersionData || '';
  const updateAvailable = isVersionNewer({
    remoteVersion: latestVersion,
    localVersion,
  });

  return {
    localVersion,
    latestVersion,
    updateAvailable,
    localError,
    remoteError,
    isRemoteFetching,
  };
};

export default useVersionCheck;
