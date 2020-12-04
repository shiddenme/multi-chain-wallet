import { Module } from '@nestjs/common';
import { SipcService } from './sipc.service';
import {
    SipcBlockModule, SipcTransactionModule, SipcUncleModule, SipcTokenModule
} from '../../modules'


@Module({
    imports: [
        SipcBlockModule,
        SipcTransactionModule,
        SipcUncleModule,
        SipcTokenModule
    ],
    providers: [SipcService],
    exports: [SipcService],
})
export class SipcModule { 
    constructor(sipc: SipcService) {
        sipc.setProvider();
    }
}