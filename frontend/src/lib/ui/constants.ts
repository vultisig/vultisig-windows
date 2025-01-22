export const BREAKPOINTS = {
  phone: 600,
  tablet: 950,
  laptop: 1300,
  desktop: 1920,
};

export const QUERIES = {
  tabletAndUp: `(min-width: ${BREAKPOINTS.phone / 16}rem)`,
  laptopAndUp: `(min-width: ${BREAKPOINTS.tablet / 16}rem)`,
  desktopAndUp: `(min-width: ${BREAKPOINTS.laptop / 16}rem)`,
};
