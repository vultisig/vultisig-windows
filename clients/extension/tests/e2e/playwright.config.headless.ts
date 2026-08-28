import base from './playwright.config'

/**
 * QA-only override: run the extension suite in Chrome's new headless mode so
 * local runs never steal window focus. Extensions load fine under
 * `--headless=new`; the known cost is GPU-backed canvas (Rive) interactions,
 * which false-green under the software renderer and must be smoke-checked in
 * real Chrome separately.
 */
export default {
  ...base,
  use: {
    ...base.use,
    headless: true,
  },
}
