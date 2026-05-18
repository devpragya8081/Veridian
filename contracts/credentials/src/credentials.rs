use crate::{Credential, CredentialStatus};
use soroban_sdk::{Address, Env};

const CREDENTIAL_COUNT_KEY: &str = "CREDENTIAL_COUNT";
const CREDENTIAL_PREFIX: &str = "CREDENTIAL_";
const HOLDER_CREDENTIAL_COUNT_PREFIX: &str = "HOLDER_CRED_COUNT_";
const HOLDER_CREDENTIAL_PREFIX: &str = "HOLDER_CRED_";
const ISSUER_CREDENTIAL_COUNT_PREFIX: &str = "ISSUER_CRED_COUNT_";
const ISSUER_CREDENTIAL_PREFIX: &str = "ISSUER_CRED_";

pub fn get_credential_count(e: &Env) -> u64 {
    e.storage()
        .instance()
        .get(&CREDENTIAL_COUNT_KEY)
        .unwrap_or(0)
}

pub fn set_credential_count(e: &Env, count: u64) {
    e.storage().instance().set(&CREDENTIAL_COUNT_KEY, &count);
}

pub fn store_credential(e: &Env, id: u64, credential: &Credential) {
    let key = format!("{}{}", CREDENTIAL_PREFIX, id);
    e.storage().instance().set(&key, credential);
}

pub fn get_credential(e: &Env, id: u64) -> Option<Credential> {
    let key = format!("{}{}", CREDENTIAL_PREFIX, id);
    e.storage().instance().get(&key)
}

pub fn get_holder_credential_count(e: &Env, holder: &Address) -> u64 {
    let key = format!("{}{}", HOLDER_CREDENTIAL_COUNT_PREFIX, holder);
    e.storage().instance().get(&key).unwrap_or(0)
}

pub fn set_holder_credential_count(e: &Env, holder: &Address, count: u64) {
    let key = format!("{}{}", HOLDER_CREDENTIAL_COUNT_PREFIX, holder);
    e.storage().instance().set(&key, &count);
}

pub fn add_credential_to_holder(e: &Env, holder: &Address, credential_id: u64) {
    let count = get_holder_credential_count(e, holder);
    let key = format!("{}{}_{}", HOLDER_CREDENTIAL_PREFIX, holder, count);
    e.storage().instance().set(&key, &credential_id);
    set_holder_credential_count(e, holder, count + 1);
}

pub fn get_credentials_by_holder(e: &Env, holder: &Address) -> Vec<u64> {
    let count = get_holder_credential_count(e, holder);
    let mut result = Vec::new();
    for i in 0..count {
        let key = format!("{}{}_{}", HOLDER_CREDENTIAL_PREFIX, holder, i);
        if let Some(id) = e.storage().instance().get::<_, u64>(&key) {
            result.push(id);
        }
    }
    result
}

pub fn get_issuer_credential_count(e: &Env, issuer: &Address) -> u64 {
    let key = format!("{}{}", ISSUER_CREDENTIAL_COUNT_PREFIX, issuer);
    e.storage().instance().get(&key).unwrap_or(0)
}

pub fn set_issuer_credential_count(e: &Env, issuer: &Address, count: u64) {
    let key = format!("{}{}", ISSUER_CREDENTIAL_COUNT_PREFIX, issuer);
    e.storage().instance().set(&key, &count);
}

pub fn add_credential_to_issuer(e: &Env, issuer: &Address, credential_id: u64) {
    let count = get_issuer_credential_count(e, issuer);
    let key = format!("{}{}_{}", ISSUER_CREDENTIAL_PREFIX, issuer, count);
    e.storage().instance().set(&key, &credential_id);
    set_issuer_credential_count(e, issuer, count + 1);
}

pub fn get_credentials_by_issuer(e: &Env, issuer: &Address) -> Vec<u64> {
    let count = get_issuer_credential_count(e, issuer);
    let mut result = Vec::new();
    for i in 0..count {
        let key = format!("{}{}_{}", ISSUER_CREDENTIAL_PREFIX, issuer, i);
        if let Some(id) = e.storage().instance().get::<_, u64>(&key) {
            result.push(id);
        }
    }
    result
}