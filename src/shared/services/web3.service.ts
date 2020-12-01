import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockService } from '../../modules/block/block.service'
import {
    sleep, getConstReward, getFoundationPercent, getUncleReward, getRewardForUncle
} from '../utils'
import * as R from 'ramda'


const Web3 = require('web3')
const BN = require('bn.js');


@Injectable()
export class Web3Service {
    private readonly web3 = new Web3(new Web3.providers.HttpProvider(this.config.get('web3')['gethServer']));;
    constructor(
        private readonly blockService: BlockService,
        private readonly config: ConfigService
    ) { }

    async setProvider() { 
        try { 
            await this.web3.eth.net.isListening();
        } catch (e) {
            console.log(e)
            console.log('[ - ] Lost connection to the node, reconnecting', this.config.get('web3')['gethServer']);
            await this.web3.setProvider(new Web3.providers.HttpProvider(this.config.get('web3')['gethServer']));
            await sleep(2000);
            await this.setProvider();
        }
    }

    async listenBlock(blockNumber) { 
        if (blockNumber % 10 === 0) {
            console.log("Get block ", blockNumber);
        }
        const currentHeight = await this.web3.eth.getBlockNumber();
        if (blockNumber > currentHeight){
            //confirm 20 blocks;
            await sleep(1000);
            await this.listenBlock(blockNumber - 12);
            return false
        }
        const result = await this.web3.eth.getBlock(blockNumber, true);
        if (R.isNil(result)){
            return false;
        }
        try {
            result.extraData = '0x' && (result.extraData = '0x0');
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

                await this.blockService.findOrCreate(R.mergeRight(options, {
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
      
            // try {
            //   if (result.uncles.length > 0){
            //     const count =  await this.web3.eth.getBlockUncleCount(blockNumber)
            //     for (var i = 0 ; i < count; i++){
            //       const uncle =  await this.web3.eth.getUncle(blockNumber,i)
            //       if (uncle.extraData === '0x') {
            //         uncle.extraData = '0x0'
            //       }
      
            //       let uncleReward = getUncleReward(uncle.number, blockNumber, reward);
      
            //       await this.blockService.rawQuery(`replace into t_uncles set blockNumber=${blockNumber},
            //number = ${ uncle.number }, difficulty = ${ uncle.difficulty },
            //           extraData=${uncle.extraData},gasLimit=${uncle.gasLimit},gasUsed=${uncle.gasUsed},
            //           hash=${uncle.hash},logsBloom=${uncle.logsBloom},miner=${uncle.miner},mixHash=${uncle.mixHash},
            //           nonce=${uncle.nonce},parentHash=${uncle.parentHash},receiptsRoot=${uncle.receiptsRoot},
            //           sha3Uncles=${uncle.sha3Uncles},size=${uncle.size},stateRoot=${uncle.stateRoot},
            //           timestamp=${uncle.timestamp},transactionsRoot=${uncle.transactionsRoot},
            //           uncleIndex=${i},reward=${uncleReward}`)
            //     }
            //   }
            // }catch (e) {
            //   console.log('getBlockUncleCount error:', blockNumber, e)
            // }
          } catch (e) {
            console.log('getBlock error:',blockNumber,e)
          }
          await this.listenBlock(blockNumber + 1);
    }

    async syncBlocks() { 
        const block = await this.blockService.findOne({
            order: [['number', 'desc']],
            raw:true
        })
        const blockNumber = block ? block.number : 0;
        console.log('start block:', blockNumber);
        this.listenBlock(blockNumber);
        // await this.listenBlockTransactions(blockNumber + 1);
    }

    async listenBlockTransactions(blockNumber) { 

    }

    getGasInBlock(transactions) {
        let length = transactions.length
        if (length === 0) {
            return 0
        }
        let txsFee = 0;
        for (let i = 0; i < length; i++) {
            const bigFee = (new BN(transactions[i].gas)).mul(new BN(transactions[i].gasPrice))
            const fee = this.web3.utils.fromWei(bigFee)
            txsFee += parseFloat(fee)
        }
        return txsFee
    }
}