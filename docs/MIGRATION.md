# Website-only migration

The previous mobile application was replaced by `frontend/` and `backend/`.

## Preserved model hashes

| File | SHA-256 |
| --- | --- |
| `assets/model.tflite` | `FCEC1F25F20D26C376E9516247443800439E14B8D1591320657D51311DE12FFC` |
| `model/model.tflite` | `B474111E96743F83427660313C1EFD05520A0B6B647FCDE5B4B4638D2A37B420` |
| `model/model.onnx` | `85EDB8E57E31560F278592B791C21B0AF8D054A6762DDF5493A5978FB5C57639` |

The backend uses `model/model.onnx` through ONNX Runtime and preserves the
224x224 ImageNet normalization, 39-class mapping, background index 4, and 0.25
display threshold from the original implementation.

## Removed files

The old mobile router, native source, bundler configuration, generated native
project, and mobile-only lockfile were removed because the project is now
website-only. The model directory, dataset metadata, license, and evaluation
assets were preserved.
