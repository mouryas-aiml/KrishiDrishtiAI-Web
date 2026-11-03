# PlantVillage dataset preparation

Raw images are intentionally not duplicated in this repository. Download the
open PlantVillage GitHub source and optionally merge the Kaggle mirror with:

```powershell
cd M:\KrishiDrishtiAI-Web
python dataset\prepare_plantvillage.py --destination model\data\plantvillage
python dataset\prepare_plantvillage.py --destination model\data\plantvillage --kaggle
```

The second command requires the Kaggle CLI and configured Kaggle credentials.
The script clones
[PlantVillage-Dataset](https://github.com/spMohanty/PlantVillage-Dataset),
copies only image files into an ImageFolder-compatible class tree, and
deduplicates identical files by SHA-256. It does not commit downloaded images.

Use the generated tree as `DATASET.PATH` plus `DATASET.NAME` in the model
configuration. Before exporting a replacement ONNX model, preserve the
alphabetical class ordering and regenerate the backend class metadata together
with the model; the API rejects model outputs whose class count does not match
its configured labels.

Sources:

- https://github.com/spMohanty/PlantVillage-Dataset
- https://www.kaggle.com/datasets/nishantvalvi1504/plantvillagecomplete/data
