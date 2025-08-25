import {
  getVaultsAppSessions,
  setVaultsAppSessions,
} from '@core/extension/storage/appSessions'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { omit } from '@lib/utils/record/omit'
import { recordMap } from '@lib/utils/record/recordMap'

export const signOut: BackgroundResolver<'signOut'> = async ({
  context: { requestOrigin },
}) => {
  const newValue = recordMap(await getVaultsAppSessions(), sessions =>
    omit(sessions, requestOrigin)
  )

  await setVaultsAppSessions(newValue)
}
