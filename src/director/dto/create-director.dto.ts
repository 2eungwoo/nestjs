import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateDirectorDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  dob: Date;

  @IsNotEmpty()
  nationality: string;
}
