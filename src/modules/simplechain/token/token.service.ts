import { Injectable, Inject } from '@nestjs/common';
import { Sipc_Token} from './token.entity';
import { findTokenDto } from './dto/find_token.dto'
import { SipcTransactionService } from '../transaction/transaction.service'
import * as R from 'ramda'


@Injectable()
export class SipcTokenService {
    constructor(
        @Inject('sipc_token_repo') private readonly tokenRepo: typeof Sipc_Token,
        private readonly transactionService: SipcTransactionService,
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