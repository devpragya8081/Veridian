use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    IssuerNotFound = 1,
    IssuerAlreadyRegistered = 2,
    IssuerInactive = 3,
    CredentialNotFound = 4,
    Unauthorized = 5,
    CredentialAlreadyRevoked = 6,
    AlreadyInitialized = 7,
    NotInitialized = 8,
    InvalidDataHash = 9,
    InvalidExpiryLedger = 10,
    InsufficientFee = 11,
    NothingToWithdraw = 12,
    CannotRevokeExpired = 13,
}