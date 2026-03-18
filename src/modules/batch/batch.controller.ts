import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { BatchService } from './batch.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';

@ApiTags('Batches')
@Controller('batches')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchService.create(createBatchDto);
  }

  @Get()
  findAll() {
    return this.batchService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.batchService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchService.update(id, updateBatchDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.batchService.remove(id);
  }
}
