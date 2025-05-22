import { initialCoreView } from '@core/ui/navigation/CoreView'
import { GetInitialViewFunction } from '@core/ui/storage/initialView'

const getInitialView: GetInitialViewFunction = async () => initialCoreView

export const initialViewStorage = {
  getInitialView,
}
