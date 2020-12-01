import { registerAs } from '@nestjs/config';
import { getEnv, getEnvNumber } from './utils';

export default registerAs('web3', () => {
    const gethServer = getEnv('GETHSERVER');
    const reconnect = getEnvNumber('RECONNECT', 1000);

    return {
        gethServer,
        reconnect
    };
});

