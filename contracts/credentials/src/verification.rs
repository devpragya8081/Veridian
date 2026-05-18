use crate::{Credential, CredentialStatus, VerificationResult};
use soroban_sdk::Env;

pub fn verify_credential(e: &Env, credential: &Credential) -> VerificationResult {
    let current_ledger = e.ledger().sequence();

    let mut computed_status = credential.status.clone();

    if credential.expires_at > 0 && current_ledger > credential.expires_at {
        computed_status = CredentialStatus::Expired;
    }

    let valid = matches!(computed_status, CredentialStatus::Active);

    VerificationResult {
        credential_id: credential.id,
        valid,
        issuer: credential.issuer.clone(),
        holder: credential.holder.clone(),
        credential_type: credential.credential_type.clone(),
        issued_at: credential.issued_at,
        expires_at: credential.expires_at,
        status: computed_status,
    }
}