import { registerAs } from '@nestjs/config';
import { getEnv, getEnvNumber } from './utils';

export default registerAs('sequelize', () => {
    const host = getEnv('MYSQL_HOST');
    const username = getEnv('MYSQL_USER');
    const password = getEnv('MYSQL_PASS');
    const database = getEnv('MYSQL_DBS');
    const port = getEnvNumber('MYSQL_PORT', 1000);

    return {
        host,
        username,
        password,
        database,
        port,
        dialect: 'mysql'
    };
});

