import { expect, test } from '../fixtures/extension-loader'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const wallet = '0x1234567890123456789012345678901234567890'
const id = `0x${'ab'.repeat(32)}`
const contents =
  'Please review every item and the maker and taker before signing this harmless QA order. '.repeat(
    5
  )
const order = {
  domain: {
    name: 'A marketplace with a deliberately long domain name for readable EIP-712 signing review '.repeat(
      2
    ),
    version: '1',
    chainId: 1,
    verifyingContract: token,
  },
  primaryType: 'Order',
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Order: [
      { name: 'contents', type: 'string' },
      { name: 'items', type: 'OrderItem[]' },
      { name: 'maker', type: 'Person' },
      { name: 'taker', type: 'Person' },
    ],
    OrderItem: [
      { name: 'amount', type: 'uint256' },
      { name: 'id', type: 'bytes32' },
      { name: 'token', type: 'address' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
  },
  message: {
    contents,
    items: [
      { amount: '1000000000000000000', id, token },
      { amount: '2000000000000000000', id, token },
    ],
    maker: { name: 'Alice', wallet },
    taker: { name: 'Bob', wallet },
    unexpected: { note: 'An unexpected field remains visible' },
  },
}

test('EIP-712 review shows nested data, copies exact values, retains raw data and rejects without signing', async ({
  context,
  extensionId,
}) => {
  test.setTimeout(180_000)
  const config = getVaultConfigFromEnv()
  test.skip(!config, 'Requires the designated vault fixture')
  if (!config) throw new Error('Missing designated vault fixture')
  expect(
    await ensureVaultExists(
      context,
      extensionId,
      config.vaultPath,
      config.password
    )
  ).toBe(true)
  const page = await context.newPage()
  const errors: string[] = []
  context.on('page', popup =>
    popup.on('pageerror', error => errors.push(error.message))
  )
  try {
    await page.goto('https://community-tools-tau.vercel.app/eth/ethereum')
    await page.waitForFunction(
      () => typeof window.vultisig?.ethereum?.request === 'function'
    )
    const connectionPopup = context.waitForEvent('page')
    const accountsPromise = page.evaluate(() =>
      window.vultisig.ethereum.request({ method: 'eth_requestAccounts' })
    )
    const connection = await connectionPopup
    await connection
      .getByRole('button', { name: /connect|allow|approve/i })
      .click()
    const accounts = await accountsPromise
    expect(accounts).toEqual([expect.stringMatching(/^0x[\da-f]{40}$/i)])

    const openReview = async (payload: unknown) => {
      const popupPromise = context.waitForEvent('page')
      await page.evaluate(
        ({ payload, accounts }) => {
          Reflect.set(window, 'eip712ReviewResult', null)
          void window.vultisig.ethereum
            .request({
              method: 'eth_signTypedData_v4',
              params: [accounts[0], JSON.stringify(payload)],
            })
            .then(
              result =>
                Reflect.set(window, 'eip712ReviewResult', {
                  signature: result,
                }),
              error =>
                Reflect.set(window, 'eip712ReviewResult', {
                  code: error.code,
                  message: error.message,
                })
            )
        },
        { payload, accounts }
      )
      const popup = await popupPromise
      await popup.setViewportSize({ width: 480, height: 600 })
      await expect(
        popup.getByText('eth_signTypedData_v4', { exact: true })
      ).toBeVisible()
      return popup
    }

    const popup = await openReview(order)
    for (const text of [
      'contents',
      'items',
      '[0]',
      '[1]',
      'maker',
      'taker',
      'Alice',
      'Bob',
      order.message.unexpected.note,
    ]) {
      await expect(
        popup.getByText(text, { exact: true }).first()
      ).toBeAttached()
    }
    await expect(popup.getByText(contents, { exact: true })).toBeAttached()
    const layout = await popup
      .getByText(contents, { exact: true })
      .evaluate(element => ({
        align: getComputedStyle(element).textAlign,
        width: element.getBoundingClientRect().width,
        viewport: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }))
    expect(layout.align).toBe('left')
    expect(layout.overflow).toBe(false)
    await popup.screenshot({ path: test.info().outputPath('generic-top.png') })
    await popup.setViewportSize({ width: 360, height: 600 })
    expect(
      await popup.evaluate(
        () => document.documentElement.scrollWidth > innerWidth
      )
    ).toBe(false)
    await popup.screenshot({
      path: test.info().outputPath('generic-narrow.png'),
    })
    await popup.setViewportSize({ width: 480, height: 600 })
    await popup.getByText(contents, { exact: true }).scrollIntoViewIfNeeded()
    await popup.screenshot({
      path: test.info().outputPath('generic-contents.png'),
    })
    for (const index of [0, 1]) {
      await popup
        .getByText(`[${index}]`, { exact: true })
        .first()
        .scrollIntoViewIfNeeded()
      await popup.screenshot({
        path: test.info().outputPath(`generic-item-${index}.png`),
      })
    }
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    for (const [label, expected] of [
      ['id', id],
      ['wallet', wallet],
    ]) {
      await popup
        .getByRole('button', { name: `Copy ${label}`, exact: true })
        .first()
        .click()
      expect(await popup.evaluate(() => navigator.clipboard.readText())).toBe(
        expected
      )
      await popup.screenshot({
        path: test.info().outputPath(`generic-${label}.png`),
      })
    }
    await popup.getByText('taker', { exact: true }).scrollIntoViewIfNeeded()
    await popup.screenshot({
      path: test.info().outputPath('generic-nested.png'),
    })
    await popup
      .getByText(order.message.unexpected.note, { exact: true })
      .scrollIntoViewIfNeeded()
    await popup.screenshot({
      path: test.info().outputPath('generic-unexpected.png'),
    })
    const raw = popup.getByRole('button', { name: /raw message/i })
    await raw.click()
    const rawText = await popup.locator('pre code').textContent()
    expect(JSON.parse(rawText ?? '')).toEqual(order)
    await popup.close()
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(window, 'eip712ReviewResult'))
      )
      .toMatchObject({ code: 4001 })

    const permit = {
      ...order,
      primaryType: 'Permit',
      types: {
        EIP712Domain: order.types.EIP712Domain,
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      message: {
        owner: accounts[0],
        spender: wallet,
        value: '1000000',
        nonce: '0',
        deadline: '0',
      },
    }
    const permitPopup = await openReview(permit)
    await expect(
      permitPopup.getByText('Token Approval', { exact: true })
    ).toBeVisible()
    await expect(permitPopup.getByText('1 USDC', { exact: true })).toBeVisible()
    await permitPopup
      .getByText('No expiry', { exact: true })
      .scrollIntoViewIfNeeded()
    await expect(
      permitPopup.getByText('Spender', { exact: true })
    ).toBeVisible()
    await expect(
      permitPopup.getByText('No expiry', { exact: true })
    ).toBeVisible()
    await expect(
      permitPopup.getByText('USDC', { exact: false }).first()
    ).toBeVisible()
    await permitPopup.screenshot({ path: test.info().outputPath('permit.png') })
    await permitPopup.close()
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(window, 'eip712ReviewResult'))
      )
      .toMatchObject({ code: 4001 })
    expect(errors).toEqual([])
  } finally {
    await page.close()
  }
})
