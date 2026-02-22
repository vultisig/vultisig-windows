---
name: linear
description: Linear ticket workflows for Vultisig — fetch ticket, create branch, implement feature.
---

# Linear

## Workflows

### Implement a Ticket
1. Extract ticket ID from URL or reference
2. Fetch via MCP: `get_issue` with the ticket ID
3. Get `gitBranchName` from the response
4. Setup branch: `git checkout main && git pull && git checkout -b {gitBranchName}`
5. Summarize requirements, plan, then implement

### Create a Branch from Ticket
1. Call `get_issue` to get `gitBranchName`
2. `git checkout -b {gitBranchName}`

## Rules
- ALWAYS use exact `gitBranchName` from Linear — do not modify it
- If no Linear ticket in context, ask the user for the ticket ID
