import * as Joi from 'joi';

const string = Joi.string();
const number = Joi.string();

export default Joi.object({
    // mongodb配置验证
    MYSQL_HOST: string.hostname().default('localhost'),
    MYSQL_PORT: number.default(3306),
    MYSQL_USER: string.empty('').default(''),
    MYSQL_PASS: string.empty('').default(''),
    MYSQL_DBS: string.empty('').default(''),
});
