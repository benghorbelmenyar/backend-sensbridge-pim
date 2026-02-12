/// <reference path="../types/onnxruntime-node.d.ts" />
import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import {
  wavToLogMelSpectrogram,
  getMelSpectrogramShape,
} from './audio-preprocess';

const CRY_TYPES = ['hungry', 'pain', 'tired', 'discomfort', 'other'] as const;

export interface BabyCryInferenceResult {
  isCry: boolean;
  confidence: number;
  type: (typeof CRY_TYPES)[number];
  typeConfidence: number;
  intensity: number;
}

@Injectable()
export class BabyCryMlService {
  private readonly logger = new Logger(BabyCryMlService.name);
  private session: any = null;
  private modelLoaded = false;
  private modelPath: string;

  constructor() {
    const root = join(__dirname, '..', '..');
    this.modelPath = join(root, 'models', 'baby_cry_efficientnet_b0.onnx');
  }

  async loadModel(): Promise<boolean> {
    if (this.modelLoaded) return true;
    try {
      const ort = await import('onnxruntime-node');
      this.session = await ort.InferenceSession.create(this.modelPath, {
        executionProviders: ['cpu'],
      });
      this.modelLoaded = true;
      this.logger.log('Modèle Baby Cry ONNX chargé: ' + this.modelPath);
      return true;
    } catch (e) {
      this.logger.warn(
        'Modèle ONNX non chargé (fichier absent ou erreur). Utilisation du mode stub. ' +
          this.modelPath,
      );
      return false;
    }
  }

  isLoaded(): boolean {
    return this.modelLoaded;
  }

  async analyze(buffer: Buffer): Promise<BabyCryInferenceResult | null> {
    if (!this.modelLoaded) return null;
    try {
      const mel = await wavToLogMelSpectrogram(buffer);
      const [n, c, h, w] = getMelSpectrogramShape();
      const tensor = new Float32Array(n * c * h * w);
      tensor.set(mel);

      const feeds: Record<string, any> = {};
      const inputName = this.session.inputNames?.[0] ?? 'input';
      feeds[inputName] = new (await import('onnxruntime-node')).Tensor(
        'float32',
        tensor,
        [n, c, h, w],
      );

      const results = await this.session.run(feeds);
      const outputNames = this.session.outputNames ?? Object.keys(results);
      const detectionScore =
        results[outputNames[0]]?.data?.[0] ?? results[outputNames[0]]?.[0] ?? 0;
      const intensityNorm =
        results[outputNames[1]]?.data?.[0] ?? results[outputNames[1]]?.[0] ?? 0;
      const typeLogits =
        results[outputNames[2]]?.data ?? results[outputNames[2]] ?? [];

      const isCry = detectionScore >= 0.5;
      const intensity = isCry ? Math.min(10, Math.max(0, intensityNorm * 10)) : 0;
      const softmax = (x: number[]) => {
        const exp = x.map((v) => Math.exp(v - Math.max(...x)));
        const sum = exp.reduce((a, b) => a + b, 0);
        return exp.map((e) => e / sum);
      };
      const probs = Array.isArray(typeLogits)
        ? softmax(Array.from(typeLogits))
        : [];
      const typeIdx =
        probs.length > 0
          ? probs.indexOf(Math.max(...probs))
          : 0;
      const type = CRY_TYPES[typeIdx] ?? 'other';
      const typeConfidence = probs[typeIdx] ?? 0;

      return {
        isCry,
        confidence: detectionScore,
        type,
        typeConfidence,
        intensity,
      };
    } catch (e) {
      this.logger.error('Erreur inférence Baby Cry', e);
      return null;
    }
  }
}
