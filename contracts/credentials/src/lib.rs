mod credentials;
mod errors;
mod issuers;
mod verification;

use crate::credentials::{
    add_credential_to_holder, add_credential_to_issuer, get_credential, get_credential_count,
    get_credentials_by_holder, get_credentials_by_issuer, get_holder_credential_count,
    get_issuer_credential_count, set_credential_count, store_credential,
};
use crate::issuers::{
    get_config, get_issuer_at_index, get_issuer_count, get_issuer, is_initialized, set_config,
    set_issuer_count, store_issuer, store_issuer_at_index,
};
use crate::verification::verify_credential;
use soroban_sdk::{Address, Env};

#[derive(Clone, Debug, Eq, PartialEq)]
#[soroban_sdk]
pub enum IssuerCategory {
    Education,
    Employment,
    DAO,
    Certification,
    Other,
}

#[derive(Clone, Debug)]
#[soroban_sdk]
pub struct Issuer {
    pub address: Address,
    pub name: String,
    pub category: IssuerCategory,
    pub metadata_hash: Vec<u8>,
    pub active: bool,
    pub credentials_issued: u64,
    pub registered_at: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[soroban_sdk]
pub enum CredentialStatus {
    Active,
    Revoked,
    Expired,
}

#[derive(Clone, Debug)]
#[soroban_sdk]
pub struct Credential {
    pub id: u64,
    pub issuer: Address,
    pub holder: Address,
    pub credential_type: String,
    pub data_hash: Vec<u8>,
    pub issued_at: u64,
    pub expires_at: u64,
    pub status: CredentialStatus,
}

#[derive(Clone, Debug)]
#[soroban_sdk]
pub struct VerificationResult {
    pub credential_id: u64,
    pub valid: bool,
    pub issuer: Address,
    pub holder: Address,
    pub credential_type: String,
    pub issued_at: u64,
    pub expires_at: u64,
    pub status: CredentialStatus,
}

#[derive(Clone, Debug)]
#[soroban_sdk]
pub struct ProtocolConfig {
    pub admin: Address,
    pub registration_fee: i128,
    pub issuance_fee: i128,
    pub treasury_balance: i128,
}

#[soroban_sdk]
impl VeridianContract {
    pub fn initialize(e: Env, admin: Address, registration_fee: i128, issuance_fee: i128) {
        if is_initialized(&e) {
            panic!("Contract already initialized");
        }

        let config = ProtocolConfig {
            admin,
            registration_fee,
            issuance_fee,
            treasury_balance: 0,
        };
        set_config(&e, &config);
        set_issuer_count(&e, 0);
        set_credential_count(&e, 0);
    }

    pub fn register_issuer(
        e: Env,
        name: String,
        category: IssuerCategory,
        metadata_hash: Vec<u8>,
    ) -> Address {
        let caller = e.invoker();
        let config = get_config(&e);

        if metadata_hash.len() != 32 {
            panic!("Invalid metadata hash length");
        }

        if get_issuer(&e, &caller).is_some() {
            panic!("Issuer already registered");
        }

        let registration_fee = config.registration_fee;
        if registration_fee > 0 {
            let mut cfg = get_config(&e);
            cfg.treasury_balance += registration_fee;
            set_config(&e, &cfg);
        }

        let issuer = Issuer {
            address: caller.clone(),
            name,
            category,
            metadata_hash,
            active: true,
            credentials_issued: 0,
            registered_at: e.ledger().sequence(),
        };

        let count = get_issuer_count(&e);
        store_issuer_at_index(&e, count, &caller);
        store_issuer(&e, &caller, &issuer);
        set_issuer_count(&e, count + 1);

        caller
    }

    pub fn deactivate_issuer(e: Env, issuer_address: Address) {
        let caller = e.invoker();
        let config = get_config(&e);

        if caller != issuer_address && caller != config.admin {
            panic!("Unauthorized");
        }

        if let Some(mut issuer) = get_issuer(&e, &issuer_address) {
            issuer.active = false;
            store_issuer(&e, &issuer_address, &issuer);
        }
    }

    pub fn reactivate_issuer(e: Env, issuer_address: Address) {
        let caller = e.invoker();
        let config = get_config(&e);

        if caller != config.admin {
            panic!("Unauthorized");
        }

        if let Some(mut issuer) = get_issuer(&e, &issuer_address) {
            issuer.active = true;
            store_issuer(&e, &issuer_address, &issuer);
        }
    }

    pub fn update_issuer_metadata(e: Env, metadata_hash: Vec<u8>) {
        let caller = e.invoker();

        if metadata_hash.len() != 32 {
            panic!("Invalid metadata hash length");
        }

        if let Some(mut issuer) = get_issuer(&e, &caller) {
            issuer.metadata_hash = metadata_hash;
            store_issuer(&e, &caller, &issuer);
        }
    }

    pub fn issue_credential(
        e: Env,
        holder: Address,
        credential_type: String,
        data_hash: Vec<u8>,
        expires_at: u64,
    ) -> u64 {
        let caller = e.invoker();
        let config = get_config(&e);

        if data_hash.len() != 32 {
            panic!("Invalid data hash length");
        }

        let issuer = match get_issuer(&e, &caller) {
            Some(i) => i,
            None => panic!("Issuer not found"),
        };

        if !issuer.active {
            panic!("Issuer is inactive");
        }

        let current_ledger = e.ledger().sequence();
        if expires_at > 0 && expires_at <= current_ledger {
            panic!("Invalid expiry ledger");
        }

        let issuance_fee = config.issuance_fee;
        if issuance_fee > 0 {
            let mut cfg = get_config(&e);
            cfg.treasury_balance += issuance_fee;
            set_config(&e, &cfg);
        }

        let id = get_credential_count(&e) + 1;
        let credential = Credential {
            id,
            issuer: caller.clone(),
            holder,
            credential_type,
            data_hash,
            issued_at: current_ledger,
            expires_at,
            status: CredentialStatus::Active,
        };

        store_credential(&e, id, &credential);
        set_credential_count(&e, id);

        add_credential_to_holder(&e, &credential.holder, id);
        add_credential_to_issuer(&e, &caller, id);

        let mut issuer = get_issuer(&e, &caller).unwrap();
        issuer.credentials_issued += 1;
        store_issuer(&e, &caller, &issuer);

        id
    }

    pub fn revoke_credential(e: Env, credential_id: u64) {
        let caller = e.invoker();

        let mut credential = match get_credential(&e, credential_id) {
            Some(c) => c,
            None => panic!("Credential not found"),
        };

        if caller != credential.issuer {
            panic!("Unauthorized");
        }

        if !matches!(credential.status, CredentialStatus::Active) {
            panic!("Credential already revoked or expired");
        }

        credential.status = CredentialStatus::Revoked;
        store_credential(&e, credential_id, &credential);
    }

    pub fn verify(e: Env, credential_id: u64) -> VerificationResult {
        let credential = match get_credential(&e, credential_id) {
            Some(c) => c,
            None => panic!("Credential not found"),
        };

        verify_credential(&e, &credential)
    }

    pub fn get_issuer(e: Env, address: Address) -> Option<Issuer> {
        get_issuer(&e, &address)
    }

    pub fn get_issuer_count(e: Env) -> u64 {
        get_issuer_count(&e)
    }

    pub fn get_issuer_at_index(e: Env, index: u64) -> Option<Address> {
        get_issuer_at_index(&e, index)
    }

    pub fn get_credential(e: Env, credential_id: u64) -> Option<Credential> {
        get_credential(&e, credential_id)
    }

    pub fn get_credential_count(e: Env) -> u64 {
        get_credential_count(&e)
    }

    pub fn get_credentials_by_holder(e: Env, holder: Address) -> Vec<u64> {
        get_credentials_by_holder(&e, &holder)
    }

    pub fn get_credentials_by_issuer(e: Env, issuer: Address) -> Vec<u64> {
        get_credentials_by_issuer(&e, &issuer)
    }

    pub fn get_config(e: Env) -> ProtocolConfig {
        get_config(&e)
    }

    pub fn withdraw_treasury(e: Env) {
        let caller = e.invoker();
        let mut config = get_config(&e);

        if caller != config.admin {
            panic!("Unauthorized");
        }

        if config.treasury_balance <= 0 {
            panic!("Nothing to withdraw");
        }

        let amount = config.treasury_balance;
        config.treasury_balance = 0;
        set_config(&e, &config);
    }

    pub fn issue_batch(
        e: Env,
        _holders: Vec<Address>,
        _credential_type: String,
        _data_hash: Vec<u8>,
        _expires_at: u64,
    ) {
        panic!("not implemented");
    }

    pub fn verify_zk(e: Env, _proof: Vec<u8>, _public_inputs: Vec<u8>) {
        panic!("not implemented");
    }

    pub fn delegate_verification(
        e: Env,
        _credential_id: u64,
        _delegate: Address,
        _expiry_ledger: u64,
    ) {
        panic!("not implemented");
    }

    pub fn revoke_delegate(e: Env, _credential_id: u64, _delegate: Address) {
        panic!("not implemented");
    }

    pub fn list_credential(e: Env, _credential_id: u64, _verification_fee: i128) {
        panic!("not implemented");
    }

    pub fn purchase_verification(e: Env, _credential_id: u64) {
        panic!("not implemented");
    }

    pub fn set_registration_fee(e: Env, _new_fee: i128) {
        panic!("not implemented");
    }

    pub fn set_issuance_fee(e: Env, _new_fee: i128) {
        panic!("not implemented");
    }

    pub fn transfer_admin(e: Env, _new_admin: Address) {
        panic!("not implemented");
    }
}

pub trait VeridianContract {
    fn initialize(e: Env, admin: Address, registration_fee: i128, issuance_fee: i128);
    fn register_issuer(
        e: Env,
        name: String,
        category: IssuerCategory,
        metadata_hash: Vec<u8>,
    ) -> Address;
    fn deactivate_issuer(e: Env, issuer_address: Address);
    fn reactivate_issuer(e: Env, issuer_address: Address);
    fn update_issuer_metadata(e: Env, metadata_hash: Vec<u8>);
    fn issue_credential(
        e: Env,
        holder: Address,
        credential_type: String,
        data_hash: Vec<u8>,
        expires_at: u64,
    ) -> u64;
    fn revoke_credential(e: Env, credential_id: u64);
    fn verify(e: Env, credential_id: u64) -> VerificationResult;
    fn get_issuer(e: Env, address: Address) -> Option<Issuer>;
    fn get_issuer_count(e: Env) -> u64;
    fn get_issuer_at_index(e: Env, index: u64) -> Option<Address>;
    fn get_credential(e: Env, credential_id: u64) -> Option<Credential>;
    fn get_credential_count(e: Env) -> u64;
    fn get_credentials_by_holder(e: Env, holder: Address) -> Vec<u64>;
    fn get_credentials_by_issuer(e: Env, issuer: Address) -> Vec<u64>;
    fn get_config(e: Env) -> ProtocolConfig;
    fn withdraw_treasury(e: Env);
    fn issue_batch(
        e: Env,
        holders: Vec<Address>,
        credential_type: String,
        data_hash: Vec<u8>,
        expires_at: u64,
    );
    fn verify_zk(e: Env, proof: Vec<u8>, public_inputs: Vec<u8>);
    fn delegate_verification(e: Env, credential_id: u64, delegate: Address, expiry_ledger: u64);
    fn revoke_delegate(e: Env, credential_id: u64, delegate: Address);
    fn list_credential(e: Env, credential_id: u64, verification_fee: i128);
    fn purchase_verification(e: Env, credential_id: u64);
    fn set_registration_fee(e: Env, new_fee: i128);
    fn set_issuance_fee(e: Env, new_fee: i128);
    fn transfer_admin(e: Env, new_admin: Address);
}