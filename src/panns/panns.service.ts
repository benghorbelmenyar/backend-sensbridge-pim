import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class PannsService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('panns.baseUrl') ||
      process.env.PANNS_API_URL ||
      'http://localhost:8002';
  }

  async health(): Promise<{ ok: boolean; raw?: any }> {
    try {
      const res = await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
      return { ok: res.status === 200, raw: res.data };
    } catch (error) {
      return { ok: false, raw: (error as any).message ?? String(error) };
    }
  }

  async predictFromFile(file: Express.Multer.File, deviceId?: string): Promise<any> {
    if (!file || !file.buffer) {
      throw new InternalServerErrorException('No file buffer provided to PANNs service');
    }

    const form = new FormData();
    // The FastAPI endpoint expects field name "file"
    form.append('file', file.buffer, {
      filename: file.originalname || 'audio.wav',
      contentType: file.mimetype || 'audio/wav',
    });

    if (deviceId) {
      form.append('device_id', deviceId);
    }

    try {
      const res = await axios.post(`${this.baseUrl}/v1/sound/predict`, form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000,
      });
      return res.data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error calling PANNs backend: ${(error as any).message ?? String(error)}`,
      );
    }
  }
}

