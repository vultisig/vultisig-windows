import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const manifestFileName = "manifest.json";
const appManifestPath = "dist/.vite";
const contentManifestPath = "dist/content/.vite";
const relayManifestPath = "dist/relay/.vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
);

const appManifestJson = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, appManifestPath, manifestFileName),
    "utf8",
  ),
);

const contentManifestJson = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, contentManifestPath, manifestFileName),
    "utf8",
  ),
);

const relayManifestJson = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, relayManifestPath, manifestFileName),
    "utf8",
  ),
);

const { author, description, manifest, version } = packageJson;

const contentJS = `content/${contentManifestJson[manifest.content].file}`;
const relayJS = `relay/${relayManifestJson[manifest.relay].file}`;

const manifestData = {
  manifest_version: 3,
  name: "Vulticonnect",
  description,
  author,
  version: version,
  version_name: version,
  action: {
    default_icon: {
      16: "icon16.png",
      32: "icon32.png",
      48: "icon48.png",
      64: "icon64.png",
      128: "icon128.png",
    },
    default_popup: "popup.html",
  },
  background: {
    service_worker: appManifestJson[manifest.background].file,
    type: "module",
  },
  content_scripts: [
    {
      js: [contentJS],
      matches: ["<all_urls>"],
      world: "MAIN",
    },
    {
      js: [relayJS],
      matches: ["<all_urls>"],
    },
  ],
  content_security_policy: {
    extension_pages:
      "script-src 'self' 'wasm-unsafe-eval' http://localhost;object-src 'self';",
  },
  host_permissions: ["https://*/*"],
  icons: {
    16: "icon16.png",
    32: "icon32.png",
    48: "icon48.png",
    64: "icon64.png",
    128: "icon128.png",
  },
  permissions: ["storage"],
  web_accessible_resources: [
    {
      matches: ["<all_urls>"],
      resources: ["wallet-core.wasm"],
      use_dynamic_url: false,
    },
    {
      matches: ["<all_urls>"],
      resources: [contentJS, relayJS],
      use_dynamic_url: true,
    },
  ],
};

fs.writeFileSync(
  path.resolve(__dirname, "dist", manifestFileName),
  JSON.stringify(manifestData, null, 2),
  "utf8",
);

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currentPath = path.join(folderPath, file);

      if (fs.lstatSync(currentPath).isDirectory()) {
        deleteFolderRecursive(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

deleteFolderRecursive(path.resolve(__dirname, appManifestPath));
deleteFolderRecursive(path.resolve(__dirname, contentManifestPath));
deleteFolderRecursive(path.resolve(__dirname, relayManifestPath));
