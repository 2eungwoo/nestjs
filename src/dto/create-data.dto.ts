import {
  IsNotEmpty,
  registerDecorator,
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
class CustomValidator implements ValidatorConstraintInterface {
  validate(
    value: any,
    ValidationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    // length : 4~8
    return value.lenth >= 4 && value.lenth <= 8;
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return '비밀번호의 길이는 4이상 8이하, 지금 입력한 데이터 : $value';
  }
}

function IsDatastringyesValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: CustomValidator,
    });
  };
}

export class CreatedDataDto {
  @IsNotEmpty({
    message: 'id should not be empty',
  })
  id: number;

  @IsNotEmpty()
  @Validate(CustomValidator, { message: '다른 메세지 전달 가능 $value' })
  //@IsDatastringyesValid({ message: '다른메세지' })
  datastringyes: string;
}
