import { Module } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { BlockModule } from '../../modules/block/block.module'

@Module({
    imports: [BlockModule],
    providers: [Web3Service],
    exports: [Web3Service],
})
export class Web3Module { 
    constructor(web3: Web3Service) {
        web3.setProvider();
    }
}