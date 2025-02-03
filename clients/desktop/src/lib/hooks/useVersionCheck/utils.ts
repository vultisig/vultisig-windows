export const isVersionNewer = ({
  remoteVersion,
  localVersion,
}: {
  remoteVersion: string;
  localVersion: string;
}) => {
  const [rMajor, rMinor, rPatch] = remoteVersion.split('.').map(Number);
  const [lMajor, lMinor, lPatch] = localVersion.split('.').map(Number);

  if (rMajor > lMajor) return true;
  if (rMajor === lMajor && rMinor > lMinor) return true;
  if (rMajor === lMajor && rMinor === lMinor && rPatch > lPatch) return true;
  return false;
};

export const isValidVersion = (version: string | undefined): boolean => {
  if (!version) return false;
  return /^\d+\.\d+\.\d+$/.test(version);
};
