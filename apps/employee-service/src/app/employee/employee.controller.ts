// apps/employee-service/src/app/employee/employee.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';

@Controller('employees')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // GET /employees
  @Get()
  findAll(@Request() req: any) {
    return this.employeeService.findAll(req.traceId);
  }

  // GET /employees/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.employeeService.findById(id, req.traceId);
  }

  // POST /employees
  @Post()
  create(@Body() dto: CreateEmployeeDto, @Request() req: any) {
    return this.employeeService.create(dto, req.traceId);
  }

  // PATCH /employees/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @Request() req: any,
  ) {
    return this.employeeService.update(id, dto, req.traceId);
  }

  // DELETE /employees/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.employeeService.delete(id, req.traceId);
  }
}
