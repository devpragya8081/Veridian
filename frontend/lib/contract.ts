export interface Issuer {
  address: string;
  name: string;
  category: IssuerCategory;
  metadata_hash: string;
  active: boolean;
  credentials_issued: number;
  registered_at: number;
}

export enum IssuerCategory {
  Education = 0,
  Employment = 1,
  DAO = 2,
  Certification = 3,
  Other = 4,
}

export enum CredentialStatus {
  Active = 0,
  Revoked = 1,
  Expired = 2,
}

export interface Credential {
  id: number;
  issuer: string;
  holder: string;
  credential_type: string;
  data_hash: string;
  issued_at: number;
  expires_at: number;
  status: CredentialStatus;
}

export interface VerificationResult {
  credential_id: number;
  valid: boolean;
  issuer: string;
  holder: string;
  credential_type: string;
  issued_at: number;
  expires_at: number;
  status: CredentialStatus;
}

export interface ProtocolConfig {
  admin: string;
  registration_fee: number;
  issuance_fee: number;
  treasury_balance: number;
}

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || '';

export async function registerIssuer(name: string, category: IssuerCategory, metadataHash: string): Promise<string> {
  console.log('Register issuer:', { name, category, metadataHash });
  return 'issuer_address';
}

export async function deactivateIssuer(issuerAddress: string): Promise<void> {
  console.log('Deactivate issuer:', issuerAddress);
}

export async function reactivateIssuer(issuerAddress: string): Promise<void> {
  console.log('Reactivate issuer:', issuerAddress);
}

export async function updateIssuerMetadata(metadataHash: string): Promise<void> {
  console.log('Update metadata:', metadataHash);
}

export async function getIssuer(address: string): Promise<Issuer | null> {
  console.log('Get issuer:', address);
  return null;
}

export async function getIssuerCount(): Promise<number> {
  console.log('Get issuer count');
  return 0;
}

export async function getIssuerAtIndex(index: number): Promise<string | null> {
  console.log('Get issuer at index:', index);
  return null;
}

export async function issueCredential(
  holder: string,
  credentialType: string,
  dataHash: string,
  expiresAt: number
): Promise<number> {
  console.log('Issue credential:', { holder, credentialType, dataHash, expiresAt });
  return 1;
}

export async function revokeCredential(credentialId: number): Promise<void> {
  console.log('Revoke credential:', credentialId);
}

export async function getCredential(credentialId: number): Promise<Credential | null> {
  console.log('Get credential:', credentialId);
  return null;
}

export async function getCredentialCount(): Promise<number> {
  console.log('Get credential count');
  return 0;
}

export async function getCredentialsByHolder(holder: string): Promise<number[]> {
  console.log('Get credentials by holder:', holder);
  return [];
}

export async function getCredentialsByIssuer(issuer: string): Promise<number[]> {
  console.log('Get credentials by issuer:', issuer);
  return [];
}

export async function verify(credentialId: number): Promise<VerificationResult> {
  console.log('Verify credential:', credentialId);
  return {
    credential_id: credentialId,
    valid: false,
    issuer: '',
    holder: '',
    credential_type: '',
    issued_at: 0,
    expires_at: 0,
    status: CredentialStatus.Active,
  };
}

export async function withdrawTreasury(): Promise<void> {
  console.log('Withdraw treasury');
}

export async function getConfig(): Promise<ProtocolConfig> {
  console.log('Get config');
  return {
    admin: '',
    registration_fee: 0,
    issuance_fee: 0,
    treasury_balance: 0,
  };
}

export async function hashData(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function ledgerToApproxDate(ledger: number, currentLedger: number): Date {
  const ledgersPerDay = 17280;
  const daysDiff = currentLedger - ledger;
  const date = new Date();
  date.setDate(date.getDate() - daysDiff / ledgersPerDay);
  return date;
}

export function dateToApproxLedger(date: Date, currentLedger: number): number {
  const now = new Date();
  const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  const ledgersPerDay = 17280;
  return Math.floor(currentLedger - daysDiff * ledgersPerDay);
}

export function stroopsToXLM(stroops: string): string {
  return (parseInt(stroops) / 10000000).toString();
}

export function xlmToStroops(xlm: string): string {
  return (parseFloat(xlm) * 10000000).toString();
}

export function categoryToLabel(category: IssuerCategory): string {
  const labels = ['Education', 'Employment', 'DAO', 'Certification', 'Other'];
  return labels[category] || 'Other';
}