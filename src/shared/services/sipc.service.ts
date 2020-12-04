import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    SipcBlockService, SipcUncleService, SipcTransactionService
} from '../../modules'

import {
    sleep, getConstReward, getFoundationPercent, getUncleReward, getRewardForUncle
} from '../utils'
import * as R from 'ramda'


const Web3 = require('web3')
const BN = require('bn.js');

@Injectable()
export class SipcService {
    private readonly sipc = new Web3(new Web3.providers.HttpProvider('https://explorer.simplechain.com/rpc'))
    constructor(
        private readonly sipcBlcokService: SipcBlockService,
        private readonly sipcUncleService: SipcUncleService,
        private readonly sipcTransactionService: SipcTransactionService
    ) { }

    async setProvider() { 
        try { 
            await this.sipc.eth.net.isListening();
        } catch (e) {
            console.log(e)
            console.log('[ - ] Lost connection to the node, reconnecting', 'https://explorer.simplechain.com/rpc');
            await this.sipc.setProvider(new Web3.providers.HttpProvider('https://explorer.simplechain.com/rpc'));
            await sleep(2000);
            await this.setProvider();
        }
    }

    async listenBlock(blockNumber) { 
        if (blockNumber % 10 === 0) {
            console.log("Get block ", blockNumber);
        }
        const currentHeight = await this.sipc.eth.getBlockNumber();
        if (blockNumber > currentHeight){
            //confirm 20 blocks;
            setTimeout(async () => {
                await this.listenBlock(blockNumber);
            },1000);
            return false;
        }
        const result = await this.sipc.eth.getBlock(blockNumber, true);
        if (R.isNil(result)){
            return false;
        }
        try {
            result.extraData === '0x' && (result.extraData = '0x0');
            const reward = getConstReward(result.number)
            try {
                const minerReward = reward * (1 - getFoundationPercent(result.number));
                const foundation = reward * getFoundationPercent(result.number);
                const txnFees = this.getGasInBlock(result.transactions);
                const unclesCount = result.uncles.length;
                const uncleInclusionRewards = getRewardForUncle(result.number, unclesCount);
                const options = R.pick([
                    'number', 'difficulty', 'extraData', 'gasLimit', 'gasUsed', 'hash', 'logsBloom', 'miner',
                    'mixHash', 'nonce', 'parentHash', 'receiptsRoot', 'sha3Uncles', 'size', 'stateRoot',
                    'totalDifficulty', 'timestamp','transactionsRoot'
                ])(result)

                await this.sipcBlcokService.findOrCreate(R.mergeRight(options, {
                    unclesCount,
                    minerReward,
                    foundation,
                    txnFees,
                    uncleInclusionRewards
                }))
                // await setHashRate(result.number, result.timestamp)
            } catch (e) {
                console.log("save block error:",blockNumber, e)
            }
      
            try {
              if (result.uncles.length > 0){
                const count =  await this.sipc.eth.getBlockUncleCount(blockNumber)
                for (let i = 0 ; i < count; i++){
                    const uncle =  await this.sipc.eth.getUncle(blockNumber,i)
                    uncle.extraData === '0x' && (uncle.extraData = '0x0');
        
                    const uncleReward = getUncleReward(uncle.number, blockNumber, reward);
        
                    const uncleObj = R.pick([
                        'number', 'extraData', 'gasLimit', 'gasUsed', 'hash',
                        'logsBloom', 'miner', 'mixHash', 'nonce', 'parentHash', 'receiptsRoot',
                        'sha3Uncles', 'size', 'stateRoot', 'timestamp', 'transactionsRoot'
                    ])(uncle)
                    await this.sipcUncleService.findOrCreate(R.mergeRight(uncleObj, {
                        blockNumber,
                        uncleIndex: i,
                        reward: uncleReward
                    }))
                }
              }
            } catch (e) {
              console.log('getBlockUncleCount error:', blockNumber, e)
            }
          } catch (e) {
            console.log('getBlock error:',blockNumber,e)
        }
        await this.listenBlock(blockNumber + 1);
    }

    async syncBlocks() { 
        const number = await this.sipcBlcokService.findLargestBlockNumber();
        console.log('start block:', number);
        this.listenBlock(number);
        this.listenBlockTransactions(number + 1);
    }

    async listenBlockTransactions(blockNumber) { 
        try {
            const currentHeight = await this.sipc.eth.getBlockNumber();
            if (blockNumber > currentHeight) {
                setTimeout(async () => {
                    await this.listenBlockTransactions(blockNumber);
                }, 1000);
                return false;
            }
            const result = await this.sipc.eth.getBlock(blockNumber, true);
            if (R.isNil(result)) {
                return false;
            }
            const queue = [];
            for (let i = 0; i < result.transactions.length; i++) {
                const transaction = result.transactions[i];
              
                (transaction.input === '0x' || transaction.input.length > 50000) && (transaction.input = '0x0');
                const transactionObj = R.pick([
                    'blockHash', 'blockNumber', 'from', 'gas', 'gasPrice', 'hash', 'input',
                    'nonce', 'to', 'transactionIndex', 'value'
                ])(transaction)
                queue.push(this.sipcTransactionService.findOrCreate(transactionObj))
            }
            await Promise.all(queue);
        } catch (e) { 
            console.log('getTransactions error:', blockNumber, e)
        }
        await this.listenBlockTransactions(blockNumber + 1);
    }

    getGasInBlock(transactions) {
        let length = transactions.length
        if (length === 0) {
            return 0
        }
        let txsFee = 0;
        for (let i = 0; i < length; i++) {
            const bigFee = (new BN(transactions[i].gas)).mul(new BN(transactions[i].gasPrice))
            const fee = this.sipc.utils.fromWei(bigFee)
            txsFee += parseFloat(fee)
        }
        return txsFee
    }
    
}

