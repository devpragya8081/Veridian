# Issuer Guide

This guide explains how institutions can register as issuers on Veridian and issue credentials to Stellar addresses.

## Prerequisites

1. **Freighter Wallet** - Install the Freighter browser extension
2. **Testnet XLM** - Get testnet XLM from the Stellar testnet faucet
3. **Contract Deployed** - Ensure the Veridian contract is deployed on testnet

## Registering as an Issuer

### Step 1: Connect Your Wallet

Navigate to `/issuers/register` and connect your Freighter wallet.

### Step 2: Fill in Issuer Details

- **Institution Name**: Your organization's name (max 64 characters)
- **Category**: Select from Education, Employment, DAO, Certification, or Other
- **Metadata**: JSON describing your institution (stored off-chain)

### Step 3: Submit Registration

Click "Register" to submit your issuer registration. The registration fee (set by the protocol admin) will be deducted.

Your issuer profile will be created at `/issuer/[your-address]`.

## Issuing Credentials

### Step 1: Navigate to Issue Page

Go to `/issue` on the Veridian frontend.

### Step 2: Enter Credential Details

- **Holder Address**: The recipient's Stellar address (G...)
- **Credential Type**: Type of credential (e.g., "Bachelor of Science", "Employment Verification")
- **Credential Data**: Description of the credential
- **Expiry**: Optional ledger number for expiration (leave empty for no expiry)

### Step 3: Issue Credential

Click "Issue Credential". The issuance fee will be deducted, and the credential will be created on-chain.

## Managing Credentials

### View Issued Credentials

Visit your issuer profile at `/issuer/[your-address]` to see all credentials you've issued.

### Revoke a Credential

In the credentials table on your profile, click "Revoke" next to any Active credential. This marks the credential as Revoked on-chain.

### Update Metadata

If you need to update your issuer metadata (e.g., change your description or website), use the "Update Metadata" button on your profile page.

## Understanding Data Hashes

Veridian uses a commitment-based system for off-chain data:

1. **Hash Generation**: When you register or issue a credential, the frontend generates a SHA-256 hash of your JSON metadata/credential data
2. **On-chain Storage**: Only the 32-byte hash is stored on Stellar
3. **Off-chain Storage**: The raw JSON data is stored in localStorage (in this MVP)

This pattern allows verifiers to request the full data from the holder, hash it themselves, and confirm it matches the on-chain commitment.

## What Data Should You Store?

For **Issuer Metadata**:
```json
{
  "description": "Brief description of your institution",
  "website": "https://your-website.com",
  "contact": "contact@your-institution.com"
}
```

For **Credential Data**:
```json
{
  "recipient": "John Doe",
  "program": "Computer Science",
  "graduationDate": "2024-05-15",
  "degree": "Bachelor of Science"
}
```

## Support

For issues or questions, please open an issue on the GitHub repository.