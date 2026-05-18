# Veridian — Decentralized Credential Protocol on Stellar

Veridian is a decentralized verifiable credential protocol built on Soroban. Institutions register as issuers on-chain and issue signed attestations directly to Stellar addresses. Anyone can verify a credential on-chain in real time.

## Quick Start

### Prerequisites
- Rust 1.75+
- Node.js 18+
- Soroban CLI
- Freighter Wallet (browser extension)

### Setup

```bash
# Clone the repository
git clone https://github.com/devpragya8081/Veridian.git
cd Veridian/veridian

# Install frontend dependencies
cd frontend && npm install

# Build the contract
cd ../contracts/credentials && cargo build --target wasm32-unknown-unknown
```

### Deploy to Testnet

```bash
# Initialize the contract
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/credentials.wasm --source <ACCOUNT> --network testnet

# Initialize with admin and fees
soroban contract invoke <CONTRACT_ID> --source <ACCOUNT> --network testnet -- initialize --admin <ADMIN_ADDRESS> --registration_fee 10000000 --issuance_fee 1000000
```

### Run Frontend

```bash
cd frontend
cp .env.example .env.local
# Fill in your contract ID
npm run dev
```

## Project Structure

```
veridian/
├── contracts/credentials/  # Soroban smart contract (Rust)
│   └── src/
│       ├── lib.rs         # Contract entry point
│       ├── issuers.rs     # Issuer management
│       ├── credentials.rs # Credential issuance
│       ├── verification.rs# On-chain verification
│       └── errors.rs      # Error definitions
├── frontend/              # Next.js 14 frontend (TypeScript)
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/               # Stellar & contract utilities
├── docs/                  # Documentation
│   ├── ISSUER_GUIDE.md   # How to use as issuer
│   └── CONTRIBUTING.md   # Contribution guide
└── README.md
```

## Features

- **Issuer Registration**: Register institutions on-chain with name, category, and metadata
- **Credential Issuance**: Issue verifiable credentials to any Stellar address
- **On-chain Verification**: Anyone can verify credentials in real-time without contacting the issuer
- **Credential Revocation**: Issuers can revoke credentials at any time
- **Expiry Support**: Credentials can have optional expiry dates

## Tech Stack

- **Smart Contract**: Rust / Soroban SDK
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Wallet**: Freighter Wallet
- **Blockchain**: Stellar Testnet

## Documentation

- [Issuer Guide](./docs/ISSUER_GUIDE.md)
- [Contributing](./docs/CONTRIBUTING.md)

## License

MIT