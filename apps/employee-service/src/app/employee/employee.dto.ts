// apps/employee-service/src/app/employee/employee.dto.ts

import {
  IsString,
  IsEmail,
  IsNumber,
  IsPositive,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @IsPositive()
  deptId: number;

  @IsString()
  position: string;

  @IsNumber()
  @IsPositive()
  salary: number;
}

export class UpdateEmployeeDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsNumber() @IsPositive() deptId?: number;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsNumber() @IsPositive() salary?: number;
}
