/**
 * Preprocessing audio pour le modèle Baby Cry (aligné sur l'entraînement Python).
 * WAV -> Log-Mel Spectrogram normalisé, shape [1, 1, n_mels, time_frames].
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const WavDecoder = require('wav-decoder');

export const PREPROCESSING_CONFIG = {
  sampleRate: 22050,
  windowSeconds: 2.0,
  hopLength: 512,
  nFft: 2048,
  nMels: 128,
  fMin: 50,
  fMax: 8000,
  /** À mettre à jour après entraînement (checkpoint dataset_mean / dataset_std). */
  mean: -4.2675,
  std: 3.8914,
} as const;

/**
 * Decode WAV buffer -> { samples: Float32Array, sampleRate: number }.
 */
export async function decodeWav(buffer: Buffer): Promise<{
  samples: Float32Array;
  sampleRate: number;
}> {
  const decode = WavDecoder.decode ?? WavDecoder.default?.decode;
  const decoded = await decode(buffer);
  const ch0 = decoded.channelData[0];
  const samples =
    decoded.channelData.length > 1
      ? mixDownToMono(decoded.channelData)
      : ch0;
  return {
    samples: samples instanceof Float32Array ? samples : new Float32Array(samples),
    sampleRate: decoded.sampleRate,
  };
}

function mixDownToMono(channels: Float32Array[]): Float32Array {
  const len = channels[0].length;
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let s = 0;
    for (const ch of channels) s += ch[i];
    out[i] = s / channels.length;
  }
  return out;
}

/**
 * Resample naïf (linear) pour ramener à targetSr.
 */
function resample(
  samples: Float32Array,
  fromSr: number,
  toSr: number,
): Float32Array {
  if (fromSr === toSr) return samples;
  const ratio = fromSr / toSr;
  const outLen = Math.floor(samples.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const srcIdx = i * ratio;
    const j = Math.floor(srcIdx);
    const t = srcIdx - j;
    out[i] =
      j + 1 < samples.length
        ? samples[j] * (1 - t) + samples[j + 1] * t
        : samples[j];
  }
  return out;
}

/**
 * Construit un banc de filtres mel (128 filtres, fmin-fmax Hz, n_fft/2+1 bins).
 */
function getMelFilterBank(
  sr: number,
  nFft: number,
  nMel: number,
  fMin: number,
  fMax: number,
): Float32Array[] {
  const nFreq = Math.floor(nFft / 2) + 1;
  const freqToMel = (f: number) =>
    2595 * Math.log10(1 + f / 700);
  const melToFreq = (m: number) =>
    700 * (Math.pow(10, m / 2595) - 1);

  const fMinMel = freqToMel(fMin);
  const fMaxMel = freqToMel(fMax);
  const melPoints = new Float32Array(nMel + 2);
  for (let i = 0; i < nMel + 2; i++) {
    melPoints[i] = fMinMel + (i * (fMaxMel - fMinMel)) / (nMel + 1);
  }
  const binFreqs = new Float32Array(nFreq);
  for (let i = 0; i < nFreq; i++) {
    binFreqs[i] = (i * sr) / nFft;
  }

  const filters: Float32Array[] = [];
  for (let i = 0; i < nMel; i++) {
    const fLeft = melToFreq(melPoints[i]);
    const fCenter = melToFreq(melPoints[i + 1]);
    const fRight = melToFreq(melPoints[i + 2]);
    const filter = new Float32Array(nFreq);
    for (let k = 0; k < nFreq; k++) {
      const f = binFreqs[k];
      if (f <= fLeft || f >= fRight) continue;
      if (f < fCenter) {
        filter[k] = (f - fLeft) / (fCenter - fLeft);
      } else {
        filter[k] = (fRight - f) / (fRight - fCenter);
      }
    }
    filters.push(filter);
  }
  return filters;
}

/**
 * STFT power (magnitude squared) avec fenêtre Hanning.
 */
function stftPower(
  samples: Float32Array,
  nFft: number,
  hopLength: number,
): Float32Array[] {
  const window = new Float32Array(nFft);
  for (let i = 0; i < nFft; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (nFft - 1)));
  }
  const frames: Float32Array[] = [];
  let pos = 0;
  while (pos + nFft <= samples.length) {
    const frame = new Float32Array(nFft);
    for (let i = 0; i < nFft; i++) {
      frame[i] = samples[pos + i] * window[i];
    }
    const power = fftPower(frame, nFft);
    frames.push(power);
    pos += hopLength;
  }
  return frames;
}

/**
 * FFT réelle 2n -> magnitude au carré (n+1 bins). Implémentation DFT simple pour n_fft=2048.
 */
function fftPower(signal: Float32Array, nFft: number): Float32Array {
  const n = nFft;
  const out = new Float32Array(Math.floor(n / 2) + 1);
  for (let k = 0; k < out.length; k++) {
    let re = 0;
    let im = 0;
    for (let t = 0; t < n; t++) {
      const angle = (-2 * Math.PI * k * t) / n;
      re += signal[t] * Math.cos(angle);
      im += signal[t] * Math.sin(angle);
    }
    const norm = 1 / n;
    out[k] = (re * re + im * im) * norm * norm;
  }
  return out;
}

/**
 * WAV buffer -> log-mel spectrogram normalisé, shape [1, 1, nMels, timeFrames] en float32.
 */
export async function wavToLogMelSpectrogram(buffer: Buffer): Promise<Float32Array> {
  const { samples, sampleRate } = await decodeWav(buffer);
  const sr = PREPROCESSING_CONFIG.sampleRate;
  let y = sampleRate !== sr ? resample(samples, sampleRate, sr) : samples;

  const targetLen = Math.floor(
    PREPROCESSING_CONFIG.sampleRate * PREPROCESSING_CONFIG.windowSeconds,
  );
  if (y.length < targetLen) {
    const padded = new Float32Array(targetLen);
    padded.set(y);
    y = padded;
  } else {
    y = y.slice(0, targetLen);
  }

  const frames = stftPower(
    y,
    PREPROCESSING_CONFIG.nFft,
    PREPROCESSING_CONFIG.hopLength,
  );
  const nFreq = Math.floor(PREPROCESSING_CONFIG.nFft / 2) + 1;
  const melBank = getMelFilterBank(
    sr,
    PREPROCESSING_CONFIG.nFft,
    PREPROCESSING_CONFIG.nMels,
    PREPROCESSING_CONFIG.fMin,
    PREPROCESSING_CONFIG.fMax,
  );

  const nFrames = frames.length;
  const melSpec = new Float32Array(PREPROCESSING_CONFIG.nMels * nFrames);
  for (let t = 0; t < nFrames; t++) {
    const frame = frames[t];
    for (let m = 0; m < PREPROCESSING_CONFIG.nMels; m++) {
      let v = 0;
      for (let k = 0; k < nFreq; k++) {
        v += frame[k] * melBank[m][k];
      }
      v = Math.log(Math.max(v, 1e-9));
      melSpec[m * nFrames + t] = v;
    }
  }

  const { mean, std } = PREPROCESSING_CONFIG;
  for (let i = 0; i < melSpec.length; i++) {
    melSpec[i] = (melSpec[i] - mean) / std;
  }

  return melSpec;
}

/**
 * Retourne la shape attendue par le modèle: [1, 1, nMels, timeFrames].
 */
export function getMelSpectrogramShape(): [number, number, number, number] {
  const targetLen = Math.floor(
    PREPROCESSING_CONFIG.sampleRate * PREPROCESSING_CONFIG.windowSeconds,
  );
  const nFrames =
    Math.floor(
      (targetLen - PREPROCESSING_CONFIG.nFft) / PREPROCESSING_CONFIG.hopLength,
    ) + 1;
  return [1, 1, PREPROCESSING_CONFIG.nMels, nFrames];
}
