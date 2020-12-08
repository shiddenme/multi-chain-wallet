const web3 = require('web3');

export function whickBlockRepo(blockNumber: number): number {
  if (!blockNumber) return 1;
  return Math.ceil(blockNumber / 5000000);
}

export function fromWei(wei: string | null, unit: string) {
  if (!wei) return 0;

  return web3.utils.fromWei(wei, unit);
}
