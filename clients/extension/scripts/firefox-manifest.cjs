const fs = require('fs')
const path = require('path')

const manifestPath = path.resolve(__dirname, '../dist/manifest.json')
const manifestBase = require(manifestPath)

// Clean up incompatible fields
delete manifestBase.version_name
delete manifestBase.author

// Ensure we're using Manifest V3 correctly with `service_worker`
manifestBase.background = {
  scripts: ['background.js'],
  service_worker: 'background.js',
  type: 'module',
}

// Fix content_security_policy for build

manifestBase.content_security_policy.extension_pages =
  manifestBase.content_security_policy.extension_pages.replace(
    'http://localhost',
    ''
  )

// Remove unsupported 'use_dynamic_url' from web_accessible_resources
if (Array.isArray(manifestBase.web_accessible_resources)) {
  manifestBase.web_accessible_resources =
    manifestBase.web_accessible_resources.map(resource => {
      const { use_dynamic_url, ...rest } = resource
      return rest
    })
}

// Ensure <all_urls> is in host_permissions without duplicates or unnecessary entries
const uniqueHostPermissions = new Set(manifestBase.host_permissions || [])
uniqueHostPermissions.add('<all_urls>')
uniqueHostPermissions.delete('https://*/*')
manifestBase.host_permissions = Array.from(uniqueHostPermissions)

// Add Firefox-specific settings for Gecko
manifestBase.browser_specific_settings = {
  gecko: {
    id: 'vultisigextension@vultisig.com',
    strict_min_version: '115.0',
  },
}

fs.writeFileSync(manifestPath, JSON.stringify(manifestBase, null, 2))

console.log('✔️ Firefox-compatible manifest updated successfully.')
