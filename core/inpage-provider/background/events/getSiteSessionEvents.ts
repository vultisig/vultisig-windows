import { SiteSessions } from '../core/appSession'

type GetSiteSessionEventsInput = {
  prevSiteSessions: SiteSessions
  nextSiteSessions: SiteSessions
}

/** Apps to notify after the sessions serving sites changed. */
type SiteSessionEvents = {
  disconnect: string[]
  accountsChanged: string[]
}

/**
 * Splits the sites affected by a change of the sessions serving them: a site
 * no vault serves anymore loses its accounts (`disconnect`), and a site now
 * served by a different vault re-reads them (`accountsChanged`). Switching the
 * current vault alone touches neither for a site held by one vault; a legacy
 * site held by several vaults follows the current vault (see
 * `resolveSiteSessions`).
 */
export const getSiteSessionEvents = ({
  prevSiteSessions,
  nextSiteSessions,
}: GetSiteSessionEventsInput): SiteSessionEvents => {
  const prevApps = Object.keys(prevSiteSessions)
  const isServed = (appId: string) =>
    Object.prototype.hasOwnProperty.call(nextSiteSessions, appId)

  return {
    disconnect: prevApps.filter(appId => !isServed(appId)),
    accountsChanged: prevApps.filter(
      appId =>
        isServed(appId) &&
        nextSiteSessions[appId].vaultId !== prevSiteSessions[appId].vaultId
    ),
  }
}
