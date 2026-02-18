
## 2026-02-09 08:01:03
## Agent Code Review Findings

### CRITICAL Issues Found:
1. Line 130 in orchestrator.go: json.Unmarshal error not checked (ignored return value)
2. Line 162 in orchestrator.go: json.Marshal error not checked 
3. Line 194 in orchestrator.go: json.Marshal error not checked
4. Line 599 in orchestrator.go: json.Marshal error not checked
5. Line 572 in orchestrator.go: json.Marshal error not checked

### HIGH Issues:
1. Potential goroutine leak in agent.go:136 - no context cancellation cleanup
2. Missing error handling pattern issues throughout codebase
3. Password exposed in logging at line 117 of plugin_install.go

### MEDIUM Issues:
1. Race condition risk on pendingMu/pending/pendingReshare maps in dklsbridge
2. No explicit validation on type assertions (could panic)
3. Magic string constants for HTTP URLs and timeouts

### LOW Issues:
1. Code style: Some function patterns could be cleaner
2. Missing comments on non-obvious logic

## 2026-02-09 10:08:39
## Billing Format Research - Vultisig Verifier API

### Current Implementation (policy_add.go)

The `billingFromPricing()` function at lines 213-232 creates billing entries as:
```go
entry := map[string]any{
    "amount": p.Amount,        // float64
    "asset":  p.Asset,         // string
    "type":   p.Type,          // string (if not empty)
    "frequency": p.Frequency,  // string (if not empty)
}
```

This creates JSON like: `[{"amount": 100000, "asset": "usdc", "type": "per-tx"}]`

### AppPricing Struct (verifier/client.go lines 37-45)

```go
type AppPricing struct {
    ID        string  `json:"id"`
    PluginID  string  `json:"pluginId"`
    Amount    float64 `json:"amount"`       // Numeric amount
    Asset     string  `json:"asset"`       // Asset symbol (e.g., "usdc")
    Type      string  `json:"type"`        // Fee type (e.g., "per-tx", "once", "recurring")
    Frequency string  `json:"frequency"`   // Frequency if recurring
    Metric    string  `json:"metric"`      // Possibly "transaction" or similar
}
```

### PolicyAddRequest Struct (verifier/client.go lines 110-119)

```go
type PolicyAddRequest struct {
    PluginID      string `json:"plugin_id"`
    PublicKey     string `json:"public_key"`
    PluginVersion string `json:"plugin_version"`
    PolicyVersion int    `json:"policy_version"`
    Signature     string `json:"signature"`
    Recipe        string `json:"recipe"`
    Billing       []any  `json:"billing,omitempty"`    // <-- Type is []any
    Active        bool   `json:"active"`
}
```

The billing field is defined as `[]any` - NO strict type checking.

### AddPolicy Method (verifier/client.go lines 231-257)

```go
func (c *Client) AddPolicy(req *PolicyAddRequest, authToken string) (*PolicyAddResponse, error) {
    body := map[string]any{
        // ... other fields ...
        "billing": req.Billing,  // Passed through as-is if len > 0
    }
    // Lines 241-243: Only adds billing to body if it has items
    if len(req.Billing) > 0 {
        body["billing"] = req.Billing
    }
}
```

### Test Case (client_workflow_test.go lines 137-146)

The test passes:
```go
Billing: []any{map[string]any{"type": "once", "amount": 0}}
```

This is an array containing a single map with:
- `"type": "once"` (string)
- `"amount": 0` (numeric)
- NO `"asset"` field in the test

### Key Observations

1. **The test doesn't include "asset" field** - just type and amount
2. **No numeric conversion** - amount is passed as float64 directly (line 220)
3. **billingFromPricing includes "asset" field** - converts p.Asset string to lowercase in entry
4. **Type expectations** from plugin_list.go lines 97-110:
   - "per-tx" → "X ASSET per transaction"
   - "once" → "X ASSET one-time"
   - "recurring" → "X ASSET frequency"

### Question: Is "asset" field missing or misnamed?

The issue states policy creation fails with 400 "plugin policy is invalid" for Recurring Sends.
The current code generates: `[{"type": "per-tx", "amount": 100000, "asset": "usdc"}]`

But the test passes `[{"type": "once", "amount": 0}]` without "asset" field.

**Possible Issues:**
1. Asset field might need to be uppercase (USDC vs usdc)
2. Asset field might need to be named differently (currency? token?)
3. Amount format might be wrong (float vs integer)
4. Missing required field in billing object
5. Verifier API might expect specific format for amounts (string? scaled value?)


## 2026-02-16 00:55:17
## Complete Agent Architecture Analysis (for HTTP API replacement planning)

### Summary
The local agent is a Go-based AI assistant (VultiBot) embedded in a Wails desktop app. It uses the Anthropic Claude API directly from Go, manages conversations in-memory, and communicates with the React frontend via Wails events and bound methods. The plan is to replace this with an HTTP API backend.

### Key Components Identified:
1. Go Agent: agent/ directory with orchestrator, bridges, tools, verifier client
2. Frontend: core/ui/agent/ with hooks, bridge components, tool handlers, UI pages
3. Wails bindings: window.go.agent.AgentService.*
4. Wails events: agent:* event system for bidirectional communication
5. Six bridge components in App.tsx for Go<->TS operations
6. Two categories of tools: Go-native tools and bridged (TS-handled) tools

