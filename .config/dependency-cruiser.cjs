/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Circular dependencies make package and app boundaries harder to reason about.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'shared-lib-stays-low-level',
      severity: 'error',
      comment:
        'Shared lib packages should not depend on product clients or core app layers.',
      from: {
        path: '^lib/',
      },
      to: {
        path: '^(clients|core)/',
      },
    },
    {
      name: 'core-does-not-import-clients',
      severity: 'error',
      comment:
        'Core packages are shared by clients and must not depend on product client code.',
      from: {
        path: '^core/',
      },
      to: {
        path: '^clients/',
      },
    },
    {
      name: 'desktop-does-not-import-extension',
      severity: 'error',
      comment:
        'Desktop and extension client code should communicate through shared core/lib packages.',
      from: {
        path: '^clients/desktop/',
      },
      to: {
        path: '^clients/extension/',
      },
    },
    {
      name: 'extension-does-not-import-desktop',
      severity: 'error',
      comment:
        'Desktop and extension client code should communicate through shared core/lib packages.',
      from: {
        path: '^clients/extension/',
      },
      to: {
        path: '^clients/desktop/',
      },
    },
  ],
  options: {
    combinedDependencies: true,
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: [
        '(^|/)(dist|coverage|node_modules|storybook-static|wailsjs)(/|$)',
        '(^|/)tests/e2e/(playwright-report|test-results)(/|$)',
        '\\.d\\.ts$',
        '_pb\\.ts$',
        '^lib/(dkls|schnorr|mldsa)(/|$)',
      ].join('|'),
    },
    includeOnly: '^(clients|core|lib)/',
    progress: {
      type: 'none',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
}
