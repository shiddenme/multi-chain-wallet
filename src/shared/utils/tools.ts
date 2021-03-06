const web3 = require('web3');

export function whickBlockRepo(blockNumber: number): number {
  if (!blockNumber) return 1;
  return Math.ceil(blockNumber / 5000000);
}

export function fromWei(wei: string | null, unit: string) {
  if (!wei) return 0;

  return web3.utils.fromWei(wei, unit);
}

export function distributeTable(from: string, to: string) {}
export function asAddress(values: string): string {
  return values.replace(/[^a-z0-9]/gi, '');
}
