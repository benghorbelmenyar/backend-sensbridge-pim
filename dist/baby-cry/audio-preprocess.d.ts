export declare const PREPROCESSING_CONFIG: {
    readonly sampleRate: 22050;
    readonly windowSeconds: 2;
    readonly hopLength: 512;
    readonly nFft: 2048;
    readonly nMels: 128;
    readonly fMin: 50;
    readonly fMax: 8000;
    readonly mean: -9.684776306152344;
    readonly std: 7.630349159240723;
};
export declare function decodeWav(buffer: Buffer): Promise<{
    samples: Float32Array;
    sampleRate: number;
}>;
export declare function wavToLogMelSpectrogram(buffer: Buffer): Promise<Float32Array>;
export declare function getMelSpectrogramShape(): [number, number, number, number];
