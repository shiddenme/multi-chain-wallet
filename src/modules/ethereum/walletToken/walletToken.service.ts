import { Injectable, Inject } from '@nestjs/common';
import { Eth_Wallet_Token } from './walletToken.entity';
import { walletTokenDto, findWalletTokenDto } from './dto'
import { EthTokenService } from '../token/token.service'
@Injectable()
export class EthWalletTokenService {
    constructor(
        @Inject('eth_wallet_token_repo') private readonly wallerTokenRepo: typeof Eth_Wallet_Token,
        private readonly tokenService: EthTokenService
    ) { }

    // todo: 为插入选项options 创建 DTO
    async findAll(where: findWalletTokenDto) { 
        const wallet = where.wallet;
        const tokens =  await this.wallerTokenRepo.findAll({
            where: {
                wallet
            },
            raw:true
        })
        const data = await Promise.all(tokens.map(async (ele) => { 
            return await this.tokenService.findOne({
                contract: ele.contract
            })
        }))
        return {
            wallet,
            tokens:data
        }
    }

    async post(options: walletTokenDto) {
        const res = await this.wallerTokenRepo.create(options);
        return res
    }
}