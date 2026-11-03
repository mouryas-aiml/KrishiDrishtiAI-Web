import path from "path";
import * as ort from "onnxruntime-node";
import sharp from "sharp";
import { CLASSES, BACKGROUND_INDEX, CONFIDENCE_THRESHOLD, DiseaseInfo } from "./classes.js";

export interface PredictionResult {
  index: number;
  crop: string;
  disease: string;
  confidence: number;
  isHealthy: boolean;
  severity: "low" | "moderate" | "high";
  symptoms: string;
  organicTreatment: string;
  chemicalTreatment: string;
  prevention: string;
}

export class InferenceEngine {
  private session: ort.InferenceSession | null = null;
  private inputName: string = "serving_default_input.1";
  // The checked-in ONNX graph has a fixed [1, 3, 224, 224] input.
  private inputSize: number = 224;
  private modelPath: string;

  constructor(customPath?: string) {
    this.modelPath = customPath || process.env.MODEL_PATH || path.resolve(process.cwd(), "../model/model.onnx");
  }

  public async initialize(): Promise<void> {
    try {
      console.log(`[InferenceEngine] Loading ONNX model from: ${this.modelPath}`);
      this.session = await ort.InferenceSession.create(this.modelPath);
      this.inputName = this.session.inputNames[0] || "input";
      console.log(`[InferenceEngine] Model ready. Input name: ${this.inputName}, Outputs: ${this.session.outputNames.join(", ")}`);
    } catch (err) {
      console.error(`[InferenceEngine] Failed to initialize ONNX model:`, err);
      throw err;
    }
  }

  public isReady(): boolean {
    return this.session !== null;
  }

  public async predict(buffer: Buffer): Promise<PredictionResult[]> {
    if (!this.session) {
      await this.initialize();
    }
    if (!this.session) {
      throw new Error("Model is not initialized.");
    }

    const size = this.inputSize;
    const { data: bitmapData, info } = await sharp(buffer)
      .resize(size, size, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Build NCHW float tensor matching model/predict.py: [1, 3, 224, 224].
    const pixelCount = size * size;
    const floatData = new Float32Array(3 * pixelCount);

    const MEAN = [0.485, 0.456, 0.406];
    const STD = [0.229, 0.224, 0.225];

    for (let i = 0; i < pixelCount; i++) {
      const offset = i * info.channels;
      const r = bitmapData[offset] / 255.0;
      const g = bitmapData[offset + 1] / 255.0;
      const b = bitmapData[offset + 2] / 255.0;

      floatData[i] = (r - MEAN[0]) / STD[0];                  // Channel R
      floatData[pixelCount + i] = (g - MEAN[1]) / STD[1];      // Channel G
      floatData[2 * pixelCount + i] = (b - MEAN[2]) / STD[2];  // Channel B
    }

    const inputTensor = new ort.Tensor("float32", floatData, [1, 3, size, size]);
    const outputMap = await this.session.run({ [this.inputName]: inputTensor });

    // Output logits: look for 'PartitionedCall' or match output names
    let logits: Float32Array | null = null;
    if (outputMap["PartitionedCall"] && outputMap["PartitionedCall"].data instanceof Float32Array) {
      logits = outputMap["PartitionedCall"].data;
    } else {
      for (const name of this.session.outputNames) {
        const out = outputMap[name];
        if (out && out.data instanceof Float32Array && out.data.length >= CLASSES.length) {
          logits = out.data;
          break;
        }
      }
    }

    if (!logits || logits.length === 0) {
      throw new Error("Model returned no predictions.");
    }

    if (logits.length < CLASSES.length) {
      throw new Error(`Model output has ${logits.length} classes, but ${CLASSES.length} class labels are configured.`);
    }

    // Restrict to the known 39 classes
    const classCount = CLASSES.length;
    let maxLogit = -Infinity;
    for (let i = 0; i < classCount; i++) {
      if (logits[i] > maxLogit) {
        maxLogit = logits[i];
      }
    }

    const probabilities: number[] = [];
    const outputSum = Array.from(logits.slice(0, classCount)).reduce((sum, value) => sum + value, 0);
    const outputIsProbabilities = outputSum > 0.99 && outputSum < 1.01 &&
      Array.from(logits.slice(0, classCount)).every((value) => value >= 0 && value <= 1);
    if (outputIsProbabilities) {
      probabilities.push(...Array.from(logits.slice(0, classCount)));
    } else {
      let sumExp = 0;
      const expVals = new Float64Array(classCount);
      for (let i = 0; i < classCount; i++) {
        expVals[i] = Math.exp(logits[i] - maxLogit);
        sumExp += expVals[i];
      }
      for (let i = 0; i < classCount; i++) probabilities.push(expVals[i] / sumExp);
    }

    // Check if the top prediction is Background class (index 4)
    const maxIndex = probabilities.reduce((best, value, index) =>
      value > probabilities[best] ? index : best, 0);
    const maxProb = probabilities[maxIndex];
    if (maxIndex === BACKGROUND_INDEX && maxProb >= CONFIDENCE_THRESHOLD) {
      throw new Error("The scan appears to be outside the supported leaf classes. Please photograph a well-lit crop leaf.");
    }

    if (maxProb < CONFIDENCE_THRESHOLD) {
      throw new Error("Low confidence: Unable to identify a supported crop disease with certainty.");
    }

    const topInfo = CLASSES[maxIndex];
    if (topInfo.isHealthy && maxProb < 0.80) {
      throw new Error("The image is inconclusive. The model cannot safely confirm healthy foliage; please upload a closer, well-lit leaf photo.");
    }

    const candidates = probabilities
      .map((prob, index) => ({ prob, index }))
      .filter(({ index }) => index !== BACKGROUND_INDEX)
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 3)
      .map(({ prob, index }) => {
        const info: DiseaseInfo = CLASSES[index];
        return {
          index,
          crop: info.crop,
          disease: info.disease,
          confidence: Math.round(prob * 1000) / 1000,
          isHealthy: info.isHealthy,
          severity: info.severity,
          symptoms: info.symptoms,
          organicTreatment: info.organicTreatment,
          chemicalTreatment: info.chemicalTreatment,
          prevention: info.prevention,
        };
      });

    return candidates;
  }
}
