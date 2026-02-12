/**
 * Declarations for 'onnxruntime-node' (optional native dependency).
 * Install with: npm install onnxruntime-node
 */
declare module 'onnxruntime-node' {
  export interface InferenceSession {
    run(feeds: Record<string, Tensor>): Promise<Record<string, Tensor>>;
    inputNames?: string[];
    outputNames?: string[];
  }

  export class Tensor {
    constructor(
      type: string,
      data: Float32Array | Int32Array | Uint8Array,
      dims: number[],
    );
    readonly data: Float32Array | number[];
    readonly dims: number[];
  }

  export const InferenceSession: {
    create(
      path: string,
      options?: { executionProviders?: string[] },
    ): Promise<InferenceSession>;
  };
}
