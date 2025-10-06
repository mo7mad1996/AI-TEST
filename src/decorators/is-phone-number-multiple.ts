import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { isPhoneNumber } from 'class-validator';

export enum CountryCode {
  US = 'US',
  CA = 'CA',
}
export function IsPhoneNumberMultiple(
  countries: CountryCode[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumberMultiple',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return countries.some((country) => isPhoneNumber(value, country));
        },
        defaultMessage(args: ValidationArguments) {
          return `Phone number must be valid for one of: ${countries.join(', ')}`;
        },
      },
    });
  };
}
