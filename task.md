# Notes for the task related to the current pull request.

The content of this file should be cleared on Pull Request submit.

- [ ] FastReshareVaultPage and FastMigrateVaultPage KeygenAction providers depend on state provided in the FastVaultKeygenFlow, so those providers should be lifted up to a separate component that will be a parent for KeygenAction providers.
