#!/bin/bash

# Navigate to the project root directory
cd "$(dirname "$0")/../../../.." || exit

# Run the TypeScript file using ts-node
npx ts-node core/ui/i18n/scripts/duplicates.ts 