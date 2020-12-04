import { Module } from '@nestjs/common';
import { Web3Module,SipcModule } from './services';
@Module({
    imports: [Web3Module, SipcModule],
    exports: [Web3Module, SipcModule]
})
export class SharedModule { }