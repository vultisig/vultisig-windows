export const convertSeconds = (streaming?: number, swap?: number): string => {
  const seconds = streaming ? streaming + (swap || 0) : swap;
  if (seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (!minutes && !hours) {
      return `${seconds}s`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
  return '~4s';
};
