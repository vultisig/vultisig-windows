CREATE TABLE
    IF NOT EXISTS agent_auth_tokens (
        public_key_ecdsa TEXT PRIMARY KEY NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (public_key_ecdsa) REFERENCES vaults (public_key_ecdsa) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_agent_auth_tokens_expires_at ON agent_auth_tokens (expires_at);
