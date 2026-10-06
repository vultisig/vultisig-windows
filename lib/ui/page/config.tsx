export const pageConfig = {
  horizontalPadding: 16,
  verticalPadding: 16,
  /**
   * The width the app's action flows are laid out in — the send, deposit and
   * bond forms, and the review sheet that opens over them. Surfaces that cover
   * one of those columns size against this so they line up with it instead of
   * stretching across a maximised desktop window. Distinct from
   * `fitPageContent`'s wider default, which is for reading-oriented pages.
   */
  actionColumnWidth: 468,
  header: {
    iconButton: {
      offset: 8,
    },
  },
}
