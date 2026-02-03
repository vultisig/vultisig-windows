---
name: storybook-debugging
description: Access and inspect Storybook story DOM. Use when browser snapshot shows Storybook shell instead of actual story content.
---

# Storybook Debugging

## The Problem

Storybook renders stories inside an **iframe**. Browser snapshots show the shell UI (sidebar, toolbar), not the story content.

## Solution: Access the Iframe Directly

### Option 1: Isolation Mode

1. In Storybook UI, click **Share** > **Open in isolation mode**
2. Take snapshot of the new tab (viewId will be different)

### Option 2: Direct URL

Navigate to: `http://localhost:6007/iframe.html?globals=&id=<story-id>&viewMode=story`

Story ID format: lowercase with hyphens, e.g., `screens-backupoverviewscreen--four-devices`

### Option 3: Ask User

If browser tools fail, ask user to inspect in DevTools and share:

- DOM path
- Element dimensions
- Computed styles (especially overflow)
