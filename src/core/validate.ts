import { registerDecorator, ValidationOptions } from 'class-validator';

export function rawTransactionInputs(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'rawTransactionInputs',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value) || value.length < 1) {
            return false;
          }
          for (let i = 0; i < value.length; i++) {
            const { txid, vout } = value[i];
            if (!txid || !vout || txid.length !== 64) {
              return false;
            }
          }
          return true;
        },
      },
    });
  };
}
