# Contributing to Veridian

Thank you for your interest in contributing to Veridian!

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**: `git clone https://github.com/YOUR_USERNAME/Veridian.git`
3. **Create a branch** for your feature or fix

## Branch Naming

Use the following conventions:
- `feature/` for new features (e.g., `feature/add-zk-verification`)
- `fix/` for bug fixes (e.g., `fix/credential-revocation-bug`)
- `docs/` for documentation changes
- `refactor/` for code refactoring

Example: `git checkout -b feature/batch-issuance`

## Development Workflow

### Smart Contract (Rust/Soroban)

```bash
cd contracts/credentials
cargo build --target wasm32-unknown-unknown
cargo test
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## Testing Requirements

- All new contract functions must include unit tests
- Tests should cover both success and failure cases
- Run `cargo test` before submitting PR

## Code Style

### Rust
- Use `cargo fmt` to format code
- Follow standard Rust conventions
- Add comments for complex logic

### TypeScript/React
- Use ESLint and Prettier (if configured)
- Follow existing component patterns
- Use functional components with hooks

## PR Checklist

Before submitting a PR:

- [ ] Tests pass (`cargo test` for contract)
- [ ] Code builds without errors
- [ ] New features include documentation
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up-to-date with main

## Submitting a PR

1. Push your branch: `git push origin your-branch-name`
2. Open a Pull Request on GitHub
3. Fill in the PR template with:
   - Description of changes
   - Related issues
   - Testing notes

## Future Work (Contributions Welcome)

The following features are in the roadmap but out of scope for MVP:

- ZK proof verification
- W3C DID compatibility
- Batch credential issuance
- Credential marketplace
- Credential delegation
- IPFS integration

## License

By contributing, you agree that your contributions will be licensed under the MIT License.