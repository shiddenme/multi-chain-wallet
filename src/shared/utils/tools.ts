export function whickBlockRepo(blockNumber: number): number {
    if(!blockNumber) return 1
    return Math.ceil(blockNumber/5000000) 
}

export function whickTransacionRepo(blockNumber: number): number {
    if(!blockNumber) return 1
    return Math.ceil(blockNumber/2500000) 
}