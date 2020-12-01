import { Module } from '@nestjs/common';
import { Web3Module } from './services';
@Module({
    imports: [Web3Module],
    exports: [Web3Module],
})
export class SharedModule { }