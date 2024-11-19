import { useQuery } from '@tanstack/react-query';

import { attempt } from '../../utils/attempt';
import {
  LATEST_VERSION_QUERY_KEY,
  LOCAL_VERSION_QUERY_KEY,
  VULTISIG_LOCAL_BUILD_API,
  VULTISIG_RELEASES_API,
} from './constants';
import { isValidVersion, isVersionNewer } from './utils';

const useVersionCheck = () => {
  const {
    data: localVersionData,
    error: localError,
    isFetching: isLocalFetching,
  } = useQuery({
    queryKey: [LOCAL_VERSION_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch(VULTISIG_LOCAL_BUILD_API);
      if (!response.ok) {
        throw new Error('Failed to fetch local build version.');
      }
      const data = await response.json();
      if (!isValidVersion(data?.version)) {
        throw new Error(`Invalid local version format: ${data?.version}`);
      }
      return { version: data.version };
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
        throw new Error('Failed to fetch latest version data.');
      }

      const data = await response.json();
      const tagName = data?.tag_name || '';
      const version = tagName.startsWith('v') ? tagName.slice(1) : tagName;

      if (!isValidVersion(version)) {
        throw new Error(`Invalid latest version format: ${version}`);
      }
      return { version };
    },
  });

  const localVersion = localVersionData?.version;
  const latestVersion = latestVersionData?.version;

  const updateAvailable = attempt(() => {
    return isVersionNewer({
      remoteVersion: latestVersion,
      localVersion,
    });
  }, false);

  const isLoading = isLocalFetching || isRemoteFetching;

  return {
    localVersion,
    latestVersion,
    updateAvailable,
    localError,
    remoteError,
    isLoading,
  };
};

export default useVersionCheck;
