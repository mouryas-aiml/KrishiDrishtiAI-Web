declare module "jpeg-js" {
  type DecodedImage = { data: Uint8Array; width: number; height: number };
  export function decode(data: Uint8Array, options?: { useTArray?: boolean }): DecodedImage;
}
