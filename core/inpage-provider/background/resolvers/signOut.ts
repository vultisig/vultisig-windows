import {
  getVaultsAppSessions,
  setVaultsAppSessions,
} from '@core/extension/storage/appSessions'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { omit } from '@lib/utils/record/omit'
import { recordMap } from '@lib/utils/record/recordMap'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

export const signOut: BackgroundResolver<'signOut'> = async ({
  context: { requestOrigin },
}) => {
  const appId = getUrlBaseDomain(requestOrigin)
  const newValue = recordMap(await getVaultsAppSessions(), sessions =>
    omit(sessions, appId)
  )

  await setVaultsAppSessions(newValue)
}
