import { Asset } from "expo-asset";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { toByteArray } from "base64-js";
import jpeg from "jpeg-js";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import { Prediction } from "./types";

export const BACKGROUND_INDEX = 4;
export const DISPLAY_THRESHOLD = 0.25;

let model: TensorflowModel | null = null;

async function getModel() {
  if (!model) {
    const asset = Asset.fromModule(require("../assets/model.tflite"));
    await asset.downloadAsync();
    model = await loadTensorflowModel({ url: asset.localUri ?? asset.uri });
  }
  return model;
}

export function applyDisplayPolicy(values: number[]): Prediction[] | null {
  const logits = values.slice(0, 39);
  const maxLogit = Math.max(...logits);
  const exponentials = logits.map((value) => Math.exp(value - maxLogit));
  const sum = exponentials.reduce((total, value) => total + value, 0);
  const predictions = exponentials
    .map((value, index) => ({ index, probability: value / sum }))
    .sort((a, b) => b.probability - a.probability);
  if (predictions[0]?.index === BACKGROUND_INDEX) return null;
  return predictions.filter((prediction) => prediction.index !== BACKGROUND_INDEX && prediction.probability >= DISPLAY_THRESHOLD).slice(0, 3);
}

export async function classifyImage(uri: string): Promise<Prediction[]> {
  const prepared = await manipulateAsync(uri, [{ resize: { width: 224, height: 224 } }], {
    compress: 1,
    format: SaveFormat.JPEG,
    base64: true
  });
  if (!prepared.base64) throw new Error("Unable to prepare image for disease scanning.");
  const inferenceModel = await getModel();
  const pixels = decodeBase64Rgb(prepared.base64);
  const values = inferenceModel.runSync([pixels])[0] as Float32Array;
  const predictions = applyDisplayPolicy(Array.from(values));
  if (!predictions) throw new Error("The scan appears to be outside the supported leaf classes.");
  return predictions;
}

function decodeBase64Rgb(_base64: string): Float32Array {
  const decoded = jpeg.decode(toByteArray(_base64), { useTArray: true });
  const pixels = new Float32Array(3 * 224 * 224);
  const mean = [0.485, 0.456, 0.406];
  const standardDeviation = [0.229, 0.224, 0.225];
  for (let y = 0; y < 224; y += 1) {
    for (let x = 0; x < 224; x += 1) {
      const source = (y * 224 + x) * 4;
      const destination = y * 224 + x;
      pixels[destination] = (decoded.data[source] / 255 - mean[0]) / standardDeviation[0];
      pixels[224 * 224 + destination] = (decoded.data[source + 1] / 255 - mean[1]) / standardDeviation[1];
      pixels[2 * 224 * 224 + destination] = (decoded.data[source + 2] / 255 - mean[2]) / standardDeviation[2];
    }
  }
  return pixels;
}
