/// <reference path="../types/onnxruntime-node.d.ts" />
import { Injectable, Logger } from '@nestjs/common';
import { join, resolve } from 'path';
import { existsSync, readFileSync, copyFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { platform } from 'os';
import { execSync } from 'child_process';
import {
  wavToLogMelSpectrogram,
  getMelSpectrogramShape,
} from './audio-preprocess';

const CRY_TYPES = ['hungry', 'pain', 'tired', 'discomfort', 'other'] as const;
const ONNX_NAME = 'baby_cry_efficientnet_b0.onnx';
const ONNX_DATA_NAME = ONNX_NAME + '.data';

export interface BabyCryInferenceResult {
  isCry: boolean;
  confidence: number;
  type: (typeof CRY_TYPES)[number];
  typeConfidence: number;
  intensity: number;
}

function getShortPath(longPath: string): string {
  if (platform() !== 'win32') return longPath;
  try {
    const quoted = longPath.replace(/"/g, '""');
    const out = execSync(`cmd /c for %I in ("${quoted}") do @echo %~sI`, {
      encoding: 'utf8',
      windowsHide: true,
      shell: 'cmd.exe',
    });
    const short = out.trim();
    return short && short !== longPath ? short : longPath;
  } catch {
    return longPath;
  }
}

@Injectable()
export class BabyCryMlService {
  private readonly logger = new Logger(BabyCryMlService.name);
  private session: any = null;
  private modelLoaded = false;
  private modelPath: string;
  private modelDataPath: string;
  private modelsDir: string;

  constructor() {
    const root = join(__dirname, '..', '..');
    this.modelsDir = resolve(root, 'models');
    this.modelPath = resolve(this.modelsDir, ONNX_NAME);
    this.modelDataPath = resolve(this.modelsDir, ONNX_DATA_NAME);
  }

  async loadModel(): Promise<boolean> {
    if (this.modelLoaded) return true;
    if (!existsSync(this.modelPath)) {
      this.logger.warn('Fichier modele absent: ' + this.modelPath);
      return false;
    }
    try {
      const ort = await import('onnxruntime-node');
      const hasExternalData = existsSync(this.modelDataPath);

      if (hasExternalData) {
        const tempDir = join(tmpdir(), `baby_cry_onnx_${Date.now()}`);
        mkdirSync(tempDir, { recursive: true });
        copyFileSync(this.modelPath, join(tempDir, ONNX_NAME));
        copyFileSync(this.modelDataPath, join(tempDir, ONNX_DATA_NAME));
        const shortDir = getShortPath(tempDir);
        const pathToLoad = join(shortDir, ONNX_NAME);
        this.session = await ort.InferenceSession.create(pathToLoad, {
          executionProviders: ['cpu'],
        });
        this.logger.log('Modèle Baby Cry ONNX chargé (.onnx + .data, chemin court)');
      } else {
        const modelBuffer = readFileSync(this.modelPath);
        const modelBytes = new Uint8Array(modelBuffer.length);
        modelBytes.set(modelBuffer);
        this.session = await ort.InferenceSession.create(modelBytes, {
          executionProviders: ['cpu'],
        });
        this.logger.log('Modèle Baby Cry ONNX chargé (buffer)');
      }
      this.modelLoaded = true;
      return true;
    } catch (e) {
      this.logger.warn(
        'Modèle ONNX non chargé (fichier absent ou erreur). Utilisation du mode stub. ' +
          this.modelPath,
      );
      this.logger.warn('Détail: ' + String(e));
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
      // Lecture par nom de sortie (detection, intensity, type_logits) pour éviter ordre arbitraire
      const read1 = (name: string): number => {
        const out = results[name];
        const data = out?.data ?? out;
        const arr = data && typeof (data as any).length === 'number' ? Array.from(data as ArrayLike<number>) : [];
        return Number(arr[0]) || 0;
      };
      const readLogits = (name: string): number[] => {
        const out = results[name];
        const data = out?.data ?? out;
        if (!data || typeof (data as any).length === 'undefined') return [];
        return Array.from(data as ArrayLike<number>);
      };
      const detectionScore = read1('detection') || read1(this.session.outputNames?.[0] ?? '');
      const intensityNorm = read1('intensity') || read1(this.session.outputNames?.[1] ?? '');
      const typeLogits = readLogits('type_logits').length ? readLogits('type_logits') : readLogits(this.session.outputNames?.[2] ?? '');

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
