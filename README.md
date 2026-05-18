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
├── contracts/credentials/  # Soroban smart contract
├── frontend/              # Next.js frontend
├── docs/                  # Documentation
└── README.md
```

## Documentation

- [Issuer Guide](./docs/ISSUER_GUIDE.md)
- [Contributing](./docs/CONTRIBUTING.md)

## License

MIT