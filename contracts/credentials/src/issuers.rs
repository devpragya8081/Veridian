use crate::{Error, Issuer, IssuerCategory, ProtocolConfig};
use soroban_sdk::{Address, Env, Map};

const CONFIG_KEY: &str = "CONFIG";
const ISSUER_COUNT_KEY: &str = "ISSUER_COUNT";
const ISSUER_INDEX_PREFIX: &str = "ISSUER_INDEX_";
const ISSUER_PREFIX: &str = "ISSUER_";

pub fn get_config(e: &Env) -> ProtocolConfig {
    e.storage()
        .instance()
        .get(&CONFIG_KEY)
        .unwrap_or(ProtocolConfig {
            admin: Address::from_account_id(&[0u8; 32]),
            registration_fee: 0,
            issuance_fee: 0,
            treasury_balance: 0,
        })
}

pub fn set_config(e: &Env, config: &ProtocolConfig) {
    e.storage().instance().set(&CONFIG_KEY, config);
}

pub fn get_issuer_count(e: &Env) -> u64 {
    e.storage()
        .instance()
        .get(&ISSUER_COUNT_KEY)
        .unwrap_or(0)
}

pub fn set_issuer_count(e: &Env, count: u64) {
    e.storage().instance().set(&ISSUER_COUNT_KEY, &count);
}

pub fn store_issuer(e: &Env, address: &Address, issuer: &Issuer) {
    let key = format!("{}{}", ISSUER_PREFIX, address);
    e.storage().instance().set(&key, issuer);
}

pub fn get_issuer(e: &Env, address: &Address) -> Option<Issuer> {
    let key = format!("{}{}", ISSUER_PREFIX, address);
    e.storage().instance().get(&key)
}

pub fn store_issuer_at_index(e: &Env, index: u64, address: &Address) {
    let key = format!("{}{}", ISSUER_INDEX_PREFIX, index);
    e.storage().instance().set(&key, address);
}

pub fn get_issuer_at_index(e: &Env, index: u64) -> Option<Address> {
    let key = format!("{}{}", ISSUER_INDEX_PREFIX, index);
    e.storage().instance().get(&key)
}

pub fn is_initialized(e: &Env) -> bool {
    e.storage().instance().get::<_, bool>(&CONFIG_KEY).is_some()
}