import { Module } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { EthBlockModule, EthTransactionModule, EthUncleModule, EthTokenModule } from '../../modules'


@Module({
    imports: [
        EthBlockModule,
        EthTransactionModule,
        EthUncleModule,
        EthTokenModule
    ],
    providers: [Web3Service],
    exports: [Web3Service],
})
export class Web3Module { 
    constructor(web3: Web3Service) {
        web3.setProvider();
    }
}