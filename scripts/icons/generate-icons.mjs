#!/usr/bin/env node
/**
 * Icons V3 codegen.
 *
 * Pulls icons from the Figma "Icons V3" library and writes them as React
 * components that follow this repo's icon contract (see
 * .claude/skills/svg-icon-pattern/SKILL.md): `width="1em" height="1em"`,
 * concrete colours swapped to `currentColor`, and `{...props}` spread on the
 * <svg>. Sizing/colour stay at the call site — geometry swaps don't disturb
 * layout, so a generated file is a drop-in body swap for the legacy icon.
 *
 * The Figma coordinates live in figma-icons.config.json (non-secret). The API
 * token is read from the FIGMA_TOKEN environment variable and is never written
 * to disk.
 *
 * Usage:
 *   FIGMA_TOKEN=figd_xxx node scripts/icons/generate-icons.mjs --list
 *   FIGMA_TOKEN=figd_xxx node scripts/icons/generate-icons.mjs --icon WalletIcon
 *   FIGMA_TOKEN=figd_xxx node scripts/icons/generate-icons.mjs --all --dry-run
 *   node scripts/icons/generate-icons.mjs --all --from-ios <iOS Icons dir>
 *
 * Flags:
 *   --list            Print every icon name available in the V3 section (for building the mapping).
 *   --icon <Name>     Generate a single desktop icon by its icon-mapping.json `desktop` name.
 *   --all             Generate every mapped icon that is not already `migrated`/`bespoke`.
 *   --from-ios <dir>  Read V3 art from a local iOS Assets.xcassets/Icons dir instead of Figma
 *                     (Figma-free, no token/rate-limit; `v3` names match the iOS folder names).
 *   --refresh         Ignore the cached Figma section tree and re-fetch it.
 *   --dry-run         Print what would be written without touching the filesystem.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..', '..')

const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const config = readJson(join(scriptDir, 'figma-icons.config.json'))
const mapping = readJson(join(scriptDir, 'icon-mapping.json'))

const figmaApiBase = 'https://api.figma.com/v1'

const token = process.env.FIGMA_TOKEN

const sleep = ms => new Promise(done => setTimeout(done, ms))

/** GET a Figma endpoint, retrying on 429/5xx with exponential backoff. */
const figma = async (path, attempt = 0) => {
  if (!token) {
    throw new Error(
      'FIGMA_TOKEN is not set. Set it for Figma access, or pass --from-ios <path> to generate from local iOS assets instead.'
    )
  }
  const res = await fetch(`${figmaApiBase}${path}`, {
    headers: { 'X-Figma-Token': token },
  })
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 5) {
      throw new Error(
        `Figma API ${res.status} for ${path} after ${attempt} retries`
      )
    }
    // Cap the wait: Figma's Retry-After can be a large reset window; never sleep
    // more than 60s per attempt so a rate-limit doesn't stall the run for hours.
    const headerWait = Number(res.headers.get('retry-after'))
    const backoff = 2 ** attempt * 1000
    const wait = Math.min(
      Number.isFinite(headerWait) && headerWait > 0
        ? headerWait * 1000
        : backoff,
      60_000
    )
    console.warn(
      `Figma API ${res.status} — retrying in ${Math.round(wait / 1000)}s (attempt ${attempt + 1}/5)`
    )
    await sleep(wait)
    return figma(path, attempt + 1)
  }
  if (!res.ok) {
    throw new Error(`Figma API ${res.status} for ${path}: ${await res.text()}`)
  }
  return res.json()
}

const cachePath = join(
  tmpdir(),
  `figma-icons-${config.fileKey}-${config.sectionNodeId.replace(/[:;]/g, '_')}.json`
)

/**
 * Walk the section tree and collect every icon instance keyed by its name.
 * The section node is an ~9MB response, so it's cached to the OS temp dir and
 * reused across runs — the biggest source of rate-limiting. Pass --refresh to
 * force a re-fetch.
 */
const collectSectionIcons = async ({ refresh } = {}) => {
  if (!refresh && existsSync(cachePath)) {
    return new Map(Object.entries(JSON.parse(readFileSync(cachePath, 'utf8'))))
  }
  // depth=2 stops at the icon instances (section -> category -> instance) and
  // skips their vector children, cutting the response from ~9MB to a fraction —
  // cheaper and far less likely to hit Figma's cost-based rate limit.
  const data = await figma(
    `/files/${config.fileKey}/nodes?ids=${encodeURIComponent(config.sectionNodeId)}&depth=2`
  )
  const root = data.nodes[Object.keys(data.nodes)[0]].document
  const byName = new Map()
  const walk = node => {
    if (node.type === 'INSTANCE' || node.type === 'COMPONENT') {
      if (!byName.has(node.name)) byName.set(node.name, node.id)
    }
    for (const child of node.children ?? []) walk(child)
  }
  walk(root)
  writeFileSync(cachePath, JSON.stringify(Object.fromEntries(byName)))
  return byName
}

/** Fetch rendered SVG markup for a batch of node ids. */
const fetchSvgs = async nodeIds => {
  const ids = nodeIds.join(',')
  const { images } = await figma(
    `/images/${config.fileKey}?ids=${encodeURIComponent(ids)}&format=svg`
  )
  const out = new Map()
  await Promise.all(
    Object.entries(images).map(async ([id, url]) => {
      if (!url) return
      const res = await fetch(url)
      out.set(id, await res.text())
    })
  )
  return out
}

const kebabToCamel = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'fill-opacity': 'fillOpacity',
  'clip-path': 'clipPath',
}

/** Turn raw Figma SVG markup into a repo-contract React icon component. */
const svgToComponent = (name, svg) => {
  const viewBox = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 24 24'

  // Inner markup: everything between the opening <svg ...> and closing </svg>.
  let inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

  // Drop id attributes (iOS assets carry id="Vector"; not needed, and duplicate
  // ids across icons on one page are invalid).
  inner = inner.replace(/\s*id="[^"]*"/g, '')

  // Swap concrete stroke/fill colours to currentColor; keep `none`.
  inner = inner.replace(
    /(stroke|fill)="(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))"/g,
    '$1="currentColor"'
  )

  // Kebab SVG attributes -> JSX camelCase.
  for (const [kebab, camel] of Object.entries(kebabToCamel)) {
    inner = inner.replace(new RegExp(`${kebab}=`, 'g'), `${camel}=`)
  }

  inner = inner
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `    ${line}`)
    .join('\n')

  return `import { SvgProps } from '@lib/ui/props'

export const ${name} = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="${viewBox}"
    fill="none"
    {...props}
  >
${inner}
  </svg>
)
`
}

const parseArgs = argv => {
  const flags = {
    list: false,
    all: false,
    dryRun: false,
    refresh: false,
    icon: null,
    fromIos: null,
  }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--list') flags.list = true
    else if (argv[i] === '--all') flags.all = true
    else if (argv[i] === '--dry-run') flags.dryRun = true
    else if (argv[i] === '--refresh') flags.refresh = true
    else if (argv[i] === '--icon') flags.icon = argv[++i]
    else if (argv[i] === '--from-ios') flags.fromIos = argv[++i]
  }
  return flags
}

/**
 * Read the raw V3 SVG for each target from the chosen source:
 * a local iOS asset dir (--from-ios, Figma-free) or the Figma library.
 */
const resolveSvgs = async (targets, flags) => {
  const raw = new Map()
  if (flags.fromIos) {
    for (const entry of targets) {
      const svgPath = join(
        flags.fromIos,
        `${entry.v3}.imageset`,
        `${entry.v3}.svg`
      )
      if (!existsSync(svgPath)) {
        console.warn(
          `⚠ no iOS asset ${entry.v3}.svg — skipping ${entry.desktop}`
        )
        continue
      }
      raw.set(entry.desktop, readFileSync(svgPath, 'utf8'))
    }
    return raw
  }
  const sectionIcons = await collectSectionIcons({ refresh: flags.refresh })
  const nodeIds = targets.map(e => sectionIcons.get(e.v3)).filter(Boolean)
  const svgs = await fetchSvgs(nodeIds)
  for (const entry of targets) {
    const nodeId = sectionIcons.get(entry.v3)
    const svg = nodeId && svgs.get(nodeId)
    if (!svg) {
      console.warn(`⚠ no V3 art for ${entry.desktop} (${entry.v3}) — skipping`)
      continue
    }
    raw.set(entry.desktop, svg)
  }
  return raw
}

const main = async () => {
  const flags = parseArgs(process.argv.slice(2))

  if (flags.list) {
    const sectionIcons = await collectSectionIcons({ refresh: flags.refresh })
    console.log(`${sectionIcons.size} icons in "${config.sectionName}":\n`)
    for (const name of [...sectionIcons.keys()].sort()) console.log(`  ${name}`)
    return
  }

  const targets = mapping.icons.filter(entry => {
    if (
      entry.status === 'bespoke' ||
      entry.status === 'migrated' ||
      !entry.v3
    ) {
      // --icon can still force a regenerate of an already-migrated icon
      if (!(flags.icon && entry.desktop === flags.icon && entry.v3))
        return false
    }
    if (flags.icon) return entry.desktop === flags.icon
    return flags.all
  })

  if (!targets.length) {
    console.error(
      flags.icon
        ? `No mappable icon named "${flags.icon}" in icon-mapping.json.`
        : 'Nothing to do. Pass --list, --icon <Name>, or --all.'
    )
    process.exit(1)
  }

  const svgs = await resolveSvgs(targets, flags)
  const origin = flags.fromIos ? 'ios' : 'v3'

  for (const entry of targets) {
    const svg = svgs.get(entry.desktop)
    if (!svg) continue
    const component = svgToComponent(entry.desktop, svg)
    const outPath = join(repoRoot, config.outputDir, `${entry.desktop}.tsx`)

    if (flags.dryRun) {
      console.log(
        `\n--- ${config.outputDir}/${entry.desktop}.tsx (dry-run) ---`
      )
      console.log(component)
      continue
    }
    const existed = existsSync(outPath)
    writeFileSync(outPath, component)
    console.log(
      `${existed ? 'updated' : 'created'} ${config.outputDir}/${entry.desktop}.tsx  ← ${origin}/${entry.v3}`
    )
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
