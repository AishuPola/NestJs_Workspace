// apps/department-service/src/app/department/department.controller.ts

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
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { DepartmentService } from './department.service';
import { LoggerService } from '@my-nest-workspace/iop-common-utilities';
import {
  EmployeeCreatedEvent,
  EmployeeUpdatedEvent,
  EmployeeDeletedEvent,
} from '@my-nest-workspace/iop-common-utilities';

@Controller('departments')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class DepartmentController {
  constructor(
    private readonly deptService: DepartmentService,
    private readonly logger: LoggerService,
  ) {}

  // ─── HTTP CRUD endpoints ───────────────────────────────────

  @Get()
  findAll(@Request() req: any) {
    return this.deptService.findAll(req.traceId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.deptService.findById(id, req.traceId);
  }

  @Post()
  create(
    @Body() body: { name: string; description?: string },
    @Request() req: any,
  ) {
    return this.deptService.create(
      body.name,
      body.description || '',
      req.traceId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; description?: string },
    @Request() req: any,
  ) {
    return this.deptService.update(
      id,
      body.name,
      body.description,
      req.traceId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.deptService.delete(id, req.traceId);
  }

  // ─── RabbitMQ event consumers ──────────────────────────────
  // These fire automatically when employee-service publishes

  @EventPattern('employee.created')
  async onEmployeeCreated(
    @Payload() event: EmployeeCreatedEvent,
    @Ctx() ctx: RmqContext,
  ) {
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    console.log(
      '[DeptController] employee.created — deptId:',
      event.deptId,
      'traceId:',
      event.traceId,
    );
    try {
      await this.deptService.onEmployeeCreated(event);
      channel.ack(msg);
    } catch (err) {
      this.logger.error(
        'Failed to handle employee.created',
        { error: (err as Error).message },
        event.traceId,
      );
      channel.nack(msg, false, false);
    }
  }

  @EventPattern('employee.updated')
  async onEmployeeUpdated(
    @Payload() event: EmployeeUpdatedEvent,
    @Ctx() ctx: RmqContext,
  ) {
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    try {
      await this.deptService.onEmployeeUpdated(event);
      channel.ack(msg);
    } catch (err) {
      this.logger.error(
        'Failed to handle employee.updated',
        { error: (err as Error).message },
        event.traceId,
      );
      channel.nack(msg, false, false);
    }
  }

  @EventPattern('employee.deleted')
  async onEmployeeDeleted(
    @Payload() event: EmployeeDeletedEvent,
    @Ctx() ctx: RmqContext,
  ) {
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    try {
      await this.deptService.onEmployeeDeleted(event);
      channel.ack(msg);
    } catch (err) {
      this.logger.error(
        'Failed to handle employee.deleted',
        { error: (err as Error).message },
        event.traceId,
      );
      channel.nack(msg, false, false);
    }
  }
}
