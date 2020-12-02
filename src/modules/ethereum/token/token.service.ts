import { Injectable, Inject } from '@nestjs/common';
import { Eth_Token} from './token.entity';

@Injectable()
export class EthTokenService {
    constructor(
        @Inject('eth_token_repo') private readonly tokenRepo: typeof Eth_Token,
    ) { }

    // todo: 为插入选项options 创建 DTO
    async findOne(options) { 
        return await this.tokenRepo.findOne(options)
    }

    async findAll(where) { 
        const result = await this.tokenRepo.findAll({
            where,
            raw:true
        })
        return result
    }
}