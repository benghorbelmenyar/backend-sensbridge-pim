import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PannsService } from './panns.service';

@ApiTags('panns')
@Controller('panns')
export class PannsController {
  constructor(private readonly pannsService: PannsService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check connectivity to PANNs backend' })
  async health() {
    const result = await this.pannsService.health();
    return {
      ok: result.ok,
      backend: this.pannsService['baseUrl'],
      details: result.raw,
    };
  }

  @Post('predict')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Audio file to classify',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        device_id: {
          type: 'string',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Proxy file prediction to PANNs backend' })
  @ApiResponse({ status: 200, description: 'Prediction result from PANNs backend' })
  async predict(@UploadedFile() file: Express.Multer.File) {
    return this.pannsService.predictFromFile(file);
  }
}

