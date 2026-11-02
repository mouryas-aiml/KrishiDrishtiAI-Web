export type Language = "en" | "kn";

export type Prediction = {
  index: number;
  probability: number;
};

export type ScanRecord = {
  id: number;
  imageUri: string;
  createdAt: string;
  predictions: Prediction[];
};
