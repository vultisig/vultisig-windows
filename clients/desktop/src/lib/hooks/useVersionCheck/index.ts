import { useQuery } from '@tanstack/react-query';

import buildInfo from '../../../../build.json';
import { attempt } from '@lib/utils/attempt';
import { LATEST_VERSION_QUERY_KEY, VULTISIG_RELEASES_API } from './constants';
import { isValidVersion, isVersionNewer } from './utils';

const useVersionCheck = () => {
  const localVersion = buildInfo?.version;

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

  const latestVersion = latestVersionData?.version;

  const updateAvailable = attempt(() => {
    return isVersionNewer({
      remoteVersion: latestVersion,
      localVersion,
    });
  }, false);

  return {
    localVersion,
    latestVersion,
    updateAvailable,
    remoteError,
    isLocalVersionValid: isValidVersion(localVersion),
    isLoading: isRemoteFetching,
  };
};

export default useVersionCheck;
