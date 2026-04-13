DROP TABLE IF EXISTS login_mfa_challenges;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS webauthn_credentials;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS email_verification_tokens;

ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE users DROP COLUMN IF EXISTS mfa_enforced;
ALTER TABLE users DROP COLUMN IF EXISTS suspended_at;
ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at;
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

ALTER TABLE users ADD COLUMN IF NOT EXISTS srp_salt TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS srp_verifier TEXT NOT NULL DEFAULT '';
