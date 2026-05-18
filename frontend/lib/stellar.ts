import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';
import { Keypair, Networks, Transaction } from 'stellar-sdk';

const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';

export async function connectWallet(): Promise<string> {
  const connected = await isConnected();
  if (!connected) {
    throw new Error('Freighter wallet not connected');
  }
  const publicKey = await getPublicKey();
  if (!publicKey) {
    throw new Error('No public key found');
  }
  return publicKey;
}

export async function getPublicKey(): Promise<string | null> {
  try {
    const connected = await isConnected();
    if (!connected) return null;
    return await getPublicKey();
  } catch {
    return null;
  }
}

export async function signTransaction(xdr: string): Promise<string> {
  const connected = await isConnected();
  if (!connected) {
    throw new Error('Freighter wallet not connected');
  }
  return await signTransaction(xdr, { network: NETWORK });
}

export async function callContract(contractId: string, fn: string, args: any[]): Promise<any> {
  return { result: fn + ' called' };
}

export async function simulateContract(contractId: string, fn: string, args: any[]): Promise<any> {
  return { result: fn + ' simulated' };
}

export async function getCurrentLedger(): Promise<number> {
  try {
    const response = await fetch(`${HORIZON_URL}/ledgers?limit=1`);
    const data = await response.json();
    return data.ledgers[0].sequence;
  } catch {
    return 0;
  }
}

export function getNetworkPassphrase(): string {
  return NETWORK === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;
}