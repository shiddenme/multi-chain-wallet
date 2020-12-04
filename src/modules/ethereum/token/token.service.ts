import { Injectable, Inject } from '@nestjs/common';
import { Eth_Token} from './token.entity';
import { findTokenDto } from './dto/find_token.dto'
import { EthTransactionService } from '../transaction/transaction.service'
import * as R from 'ramda'


@Injectable()
export class EthTokenService {
    constructor(
        @Inject('eth_token_repo') private readonly tokenRepo: typeof Eth_Token,
        private readonly transactionService: EthTransactionService,
    ) { }

    async findAll(where: findTokenDto) { 
        const tokens = await this.tokenRepo.findAll({
            where: R.pick(['contract','symbol'])(where),
            limit: 10,
            order:[['sort', 'asc']],
            raw: true
        })
        return {
            tokens
        }
    }

    async findOne(where: findTokenDto) { 
        return await this.tokenRepo.findOne({
            where : R.pick(['contract','symbol'])(where),
            raw:true
        })
    }
  
}