import path from "path";
import * as ort from "onnxruntime-node";
import { Jimp } from "jimp";
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

    // Decode and resize image with Jimp
    const image = await Jimp.read(buffer);
    const size = this.inputSize;
    image.cover({ w: size, h: size });

    // Build NCHW float tensor: [1, 3, 256, 256]
    const pixelCount = size * size;
    const floatData = new Float32Array(3 * pixelCount);

    const MEAN = [0.485, 0.456, 0.406];
    const STD = [0.229, 0.224, 0.225];

    const { data: bitmapData } = image.bitmap;

    for (let i = 0; i < pixelCount; i++) {
      const offset = i * 4;
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

    // Restrict to the known 39 classes
    const classCount = CLASSES.length;
    let maxLogit = -Infinity;
    for (let i = 0; i < classCount; i++) {
      if (logits[i] > maxLogit) {
        maxLogit = logits[i];
      }
    }

    // Stable softmax calculation
    let sumExp = 0;
    const expVals = new Float64Array(classCount);
    for (let i = 0; i < classCount; i++) {
      expVals[i] = Math.exp(logits[i] - maxLogit);
      sumExp += expVals[i];
    }

    const probabilities: number[] = [];
    let maxProb = 0;
    let maxIndex = 0;
    for (let i = 0; i < classCount; i++) {
      const p = expVals[i] / sumExp;
      probabilities.push(p);
      if (p > maxProb) {
        maxProb = p;
        maxIndex = i;
      }
    }

    // Check if the top prediction is Background class (index 4)
    if (maxIndex === BACKGROUND_INDEX && maxProb > 0.70) {
      throw new Error("The scan appears to be outside the supported leaf classes. Please photograph a well-lit crop leaf.");
    }

    const candidates: PredictionResult[] = [];
    for (let i = 0; i < classCount; i++) {
      const prob = probabilities[i];
      if (i !== BACKGROUND_INDEX && prob >= CONFIDENCE_THRESHOLD) {
        const info = CLASSES[i];
        candidates.push({
          index: i,
          crop: info.crop,
          disease: info.disease,
          confidence: Math.round(prob * 1000) / 1000,
          isHealthy: info.isHealthy,
          severity: info.severity,
          symptoms: info.symptoms,
          organicTreatment: info.organicTreatment,
          chemicalTreatment: info.chemicalTreatment,
          prevention: info.prevention,
        });
      }
    }

    // Sort descending by confidence
    candidates.sort((a, b) => b.confidence - a.confidence);

    if (candidates.length === 0) {
      // If none exceeded threshold, return the highest non-background class if reasonable
      let bestNonBgIdx = 0;
      let bestNonBgProb = 0;
      for (let i = 0; i < classCount; i++) {
        if (i !== BACKGROUND_INDEX && probabilities[i] > bestNonBgProb) {
          bestNonBgProb = probabilities[i];
          bestNonBgIdx = i;
        }
      }
      if (bestNonBgProb > 0.1) {
        const info = CLASSES[bestNonBgIdx];
        candidates.push({
          index: bestNonBgIdx,
          crop: info.crop,
          disease: info.disease,
          confidence: Math.round(bestNonBgProb * 1000) / 1000,
          isHealthy: info.isHealthy,
          severity: info.severity,
          symptoms: info.symptoms,
          organicTreatment: info.organicTreatment,
          chemicalTreatment: info.chemicalTreatment,
          prevention: info.prevention,
        });
      } else {
        throw new Error("Low confidence: Unable to identify a supported crop disease with certainty.");
      }
    }

    return candidates.slice(0, 3);
  }
}

