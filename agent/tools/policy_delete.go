package tools

import (
	"fmt"

	"github.com/sirupsen/logrus"

	"github.com/vultisig/vultisig-win/agent/signing"
	"github.com/vultisig/vultisig-win/agent/verifier"
	"github.com/vultisig/vultisig-win/tss"
)

const deleteDerivePath = "m/44'/60'/0'/0/0"

type PolicyDeleteTool struct {
	client *verifier.Client
	tss    *tss.TssService
	logger *logrus.Logger
}

func NewPolicyDeleteTool(client *verifier.Client, tss *tss.TssService) *PolicyDeleteTool {
	return &PolicyDeleteTool{
		client: client,
		tss:    tss,
		logger: logrus.WithField("module", "policy_delete").Logger,
	}
}

func (t *PolicyDeleteTool) Name() string {
	return "policy_delete"
}

func (t *PolicyDeleteTool) Description() string {
	return "Delete a policy. This requires TSS signing."
}

func (t *PolicyDeleteTool) InputSchema() map[string]any {
	return map[string]any{
		"policy_id": map[string]any{
			"type":        "string",
			"description": "The ID of the policy to delete",
		},
	}
}

func (t *PolicyDeleteTool) RequiresPassword() bool {
	return true
}

func (t *PolicyDeleteTool) RequiresConfirmation() bool {
	return true
}

func (t *PolicyDeleteTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	policyIDRaw, ok := input["policy_id"]
	if !ok {
		return nil, fmt.Errorf("policy_id is required")
	}

	policyID, ok := policyIDRaw.(string)
	if !ok {
		return nil, fmt.Errorf("policy_id must be a string")
	}

	policyDetails, err := t.client.GetPolicy(policyID, ctx.AuthToken)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch policy: %w", err)
	}

	pluginVersion := policyDetails.PluginVersion
	if pluginVersion == "" {
		pluginVersion = "1.0.0"
	}

	messageToSign := fmt.Sprintf(
		"%s*#*%s*#*%d*#*%s",
		policyDetails.Recipe,
		policyDetails.PublicKey,
		policyDetails.PolicyVersion,
		pluginVersion,
	)

	t.logger.WithField("message", messageToSign).Debug("Signing delete message")

	messageHash := signing.EthereumSignHash(messageToSign)
	cfg := KeysignConfig{
		AppCtx:     ctx.AppCtx,
		Ctx:        ctx.Ctx,
		Vault:      ctx.Vault,
		Password:   ctx.Password,
		DerivePath: deleteDerivePath,
		TSS:        t.tss,
		Logger:     t.logger,
	}
	signature, err := FastVaultKeysign(cfg, messageHash)
	if err != nil {
		return nil, fmt.Errorf("failed to sign delete request: %w", err)
	}

	t.logger.Info("Delete signed successfully")

	err = t.client.DeletePolicy(policyID, signature, ctx.AuthToken)
	if err != nil {
		return nil, fmt.Errorf("failed to delete policy: %w", err)
	}

	return map[string]any{
		"success":   true,
		"policy_id": policyID,
		"message":   fmt.Sprintf("Policy %s deleted successfully.", policyID),
		"ui": map[string]any{
			"title": "Policy Deleted",
			"actions": []map[string]any{
				{
					"type":  "copy",
					"label": "Copy Policy ID",
					"value": policyID,
				},
			},
		},
	}, nil
}

