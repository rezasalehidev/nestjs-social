import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsExactlyOneOf(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isExactlyOneOf',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const providedCount = properties.filter(
            (prop) => obj[prop] != null,
          ).length;
          return providedCount === 1;
        },
        defaultMessage(args: ValidationArguments) {
          const properties = args.constraints[0] as string[];
          return `Exactly one of ${properties.join(', ')} must be provided`;
        },
      },
    });
  };
}
