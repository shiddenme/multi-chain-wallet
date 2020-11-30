import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3'


@Injectable()
export class Web3Service {
    private readonly web3 = new Web3(new Web3.providers.HttpProvider(this.config.get('web3')['gethServer']));;
    constructor(
        private readonly config: ConfigService
    ) { }

    async setProvider() { 
        const flag: boolean = await this.web3.eth.net.isListening();
        if (!flag) { 
            
        }
    }
}