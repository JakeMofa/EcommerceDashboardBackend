import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsEitherOne(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEitherOne',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return (
            (value !== undefined && relatedValue === undefined) || (value === undefined && relatedValue !== undefined)
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `Either ${args.property} or ${relatedPropertyName} must be provided, but not both.`;
        },
      },
    });
  };
}
