package verifier

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type workflowState struct {
	policyID      string
	publicKey     string
	pluginID      string
	pluginVersion string
	recipe        string
	lastSignature string
	billingCount  int
}

func TestClientWorkflowEndToEnd(t *testing.T) {
	state := &workflowState{}

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON := func(code int, v any) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(code)
			_ = json.NewEncoder(w).Encode(v)
		}

		requireAuth := func() bool {
			if r.Header.Get("Authorization") != "Bearer token-1" {
				writeJSON(http.StatusUnauthorized, map[string]any{"error": map[string]any{"message": "unauthorized"}})
				return false
			}
			return true
		}

		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/auth":
			writeJSON(http.StatusOK, map[string]any{"data": map[string]any{"token": "token-1"}})
			return
		case r.Method == http.MethodGet && r.URL.Path == "/plugins":
			writeJSON(http.StatusOK, map[string]any{"data": map[string]any{"plugins": []map[string]any{{"id": "vultisig-dca-0000", "title": "DCA"}}, "total_count": 1}})
			return
		case r.Method == http.MethodGet && r.URL.Path == "/vault/exist/vultisig-dca-0000/pub-key":
			writeJSON(http.StatusOK, map[string]any{"data": map[string]any{"exists": true}})
			return
		case r.Method == http.MethodPost && r.URL.Path == "/plugins/vultisig-dca-0000/recipe-specification/suggest":
			writeJSON(http.StatusOK, map[string]any{"data": map[string]any{"rules": []map[string]any{{"resource": "swap", "effect": "allow"}}, "rate_limit_window": 3600, "max_txs_per_window": 5}})
			return
		case r.Method == http.MethodPost && r.URL.Path == "/plugin/policy":
			if !requireAuth() {
				return
			}
			var req map[string]any
			_ = json.NewDecoder(r.Body).Decode(&req)
			state.policyID = "policy-1"
			state.publicKey = req["public_key"].(string)
			state.pluginID = req["plugin_id"].(string)
			state.pluginVersion = req["plugin_version"].(string)
			state.recipe = req["recipe"].(string)
			if billing, ok := req["billing"].([]any); ok {
				state.billingCount = len(billing)
			}
			writeJSON(http.StatusOK, map[string]any{"data": map[string]any{"id": state.policyID}})
			return
		case r.Method == http.MethodGet && strings.HasPrefix(r.URL.Path, "/plugin/policies/vultisig-dca-0000"):
			if !requireAuth() {
				return
			}
			writeJSON(http.StatusOK, map[string]any{"data": map[string]any{"policies": []map[string]any{{"id": state.policyID, "plugin_id": state.pluginID, "public_key": state.publicKey, "active": true, "configuration": map[string]any{"frequency": "daily"}, "created_at": "2026-02-06T00:00:00Z"}}, "total_count": 1}})
			return
		case r.Method == http.MethodGet && r.URL.Path == "/plugin/policy/policy-1":
			if !requireAuth() {
				return
			}
			writeJSON(http.StatusOK, map[string]any{"data": map[string]any{"id": "policy-1", "recipe": state.recipe, "public_key": state.publicKey, "policy_version": 1, "plugin_version": state.pluginVersion}})
			return
		case r.Method == http.MethodGet && strings.HasPrefix(r.URL.Path, "/plugin/transactions"):
			if !requireAuth() {
				return
			}
			writeJSON(http.StatusOK, map[string]any{"data": map[string]any{"history": []map[string]any{{"id": "tx-1", "policy_id": state.policyID, "tx_hash": "0xabc", "status": "executed", "status_onchain": "confirmed", "created_at": "2026-02-06T00:00:00Z"}}, "total_count": 1}})
			return
		case r.Method == http.MethodDelete && r.URL.Path == "/plugin/policy/policy-1":
			if !requireAuth() {
				return
			}
			var req map[string]any
			_ = json.NewDecoder(r.Body).Decode(&req)
			state.lastSignature, _ = req["signature"].(string)
			writeJSON(http.StatusNoContent, map[string]any{})
			return
		default:
			writeJSON(http.StatusNotFound, map[string]any{"error": map[string]any{"message": fmt.Sprintf("unexpected path: %s", r.URL.Path)}})
			return
		}
	}))
	defer ts.Close()

	client := NewClient(ts.URL)

	tok, err := client.Authenticate("pub-key", "chain-code", "sig", "msg")
	if err != nil {
		t.Fatalf("authenticate failed: %v", err)
	}
	if tok.Token != "token-1" {
		t.Fatalf("unexpected token: %s", tok.Token)
	}

	plugins, err := client.ListPlugins()
	if err != nil {
		t.Fatalf("list plugins failed: %v", err)
	}
	if plugins.TotalCount != 1 {
		t.Fatalf("expected 1 plugin, got %d", plugins.TotalCount)
	}

	installed, err := client.CheckPluginInstalled("vultisig-dca-0000", "pub-key", "")
	if err != nil {
		t.Fatalf("check installed failed: %v", err)
	}
	if !installed {
		t.Fatal("expected plugin to be installed")
	}

	suggest, err := client.SuggestPolicy("vultisig-dca-0000", map[string]any{"frequency": "daily"})
	if err != nil {
		t.Fatalf("suggest policy failed: %v", err)
	}
	if len(suggest.Rules) != 1 {
		t.Fatalf("expected one rule, got %d", len(suggest.Rules))
	}

	addResp, err := client.AddPolicy(&PolicyAddRequest{
		PluginID:      "vultisig-dca-0000",
		PublicKey:     "pub-key",
		PluginVersion: "1.0.0",
		PolicyVersion: 1,
		Signature:     "0xdeadbeef",
		Recipe:        "cmVjaXBl",
		Billing:       []any{map[string]any{"type": "once", "amount": 0}},
		Active:        true,
	}, "token-1")
	if err != nil {
		t.Fatalf("add policy failed: %v", err)
	}
	if addResp.ID != "policy-1" {
		t.Fatalf("unexpected policy id: %s", addResp.ID)
	}
	if state.pluginVersion != "1.0.0" {
		t.Fatalf("expected plugin version 1.0.0, got %s", state.pluginVersion)
	}
	if state.billingCount != 1 {
		t.Fatalf("expected one billing entry, got %d", state.billingCount)
	}

	policies, err := client.ListPolicies("vultisig-dca-0000", "pub-key", "token-1", true)
	if err != nil {
		t.Fatalf("list policies failed: %v", err)
	}
	if policies.TotalCount != 1 || len(policies.Policies) != 1 {
		t.Fatalf("unexpected policies payload: %+v", policies)
	}

	policy, err := client.GetPolicy("policy-1", "token-1")
	if err != nil {
		t.Fatalf("get policy failed: %v", err)
	}
	if policy.PluginVersion != "1.0.0" {
		t.Fatalf("unexpected plugin version from get policy: %s", policy.PluginVersion)
	}

	txs, err := client.GetTransactions("pub-key", "token-1")
	if err != nil {
		t.Fatalf("transactions failed: %v", err)
	}
	if txs.TotalCount != 1 || len(txs.History) != 1 {
		t.Fatalf("unexpected tx payload: %+v", txs)
	}

	if err := client.DeletePolicy("policy-1", "0xfeed", "token-1"); err != nil {
		t.Fatalf("delete policy failed: %v", err)
	}
	if state.lastSignature != "0xfeed" {
		t.Fatalf("unexpected delete signature: %s", state.lastSignature)
	}
}
