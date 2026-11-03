"""Download and merge PlantVillage sources for reproducible model training.

Raw images are intentionally kept outside Git. The resulting directory is an
ImageFolder-compatible tree that can be passed to model/config/*.yaml.
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw


PLANTVILLAGE_REPO = "https://github.com/spMohanty/PlantVillage-Dataset.git"
KAGGLE_DATASET = "nishantvalvi1504/plantvillagecomplete"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
CLASS_NAMES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Background", "Blueberry___healthy", "Cherry___Powdery_mildew", "Cherry___healthy",
    "Corn___Cercospora_leaf_spot Gray_leaf_spot", "Corn___Common_rust", "Corn___Northern_Leaf_Blight",
    "Corn___healthy", "Grape___Black_rot", "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper___Bacterial_spot", "Pepper___healthy", "Potato___Early_blight", "Potato___Late_blight",
    "Potato___healthy", "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy", "Tomato___Bacterial_spot", "Tomato___Early_blight",
    "Tomato___Late_blight", "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy",
]


def iter_class_directories(root: Path) -> list[Path]:
    """Find ImageFolder class directories without treating archive folders as classes."""
    return [
        path
        for path in root.rglob("*")
        if path.is_dir()
        and "___" in path.name
        and any(image.is_file() and image.suffix.lower() in IMAGE_SUFFIXES for image in path.iterdir())
    ]


def copy_unique_images(source_root: Path, destination: Path) -> int:
    copied = 0
    for class_dir in iter_class_directories(source_root):
        images = [path for path in class_dir.iterdir() if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES]
        target_dir = destination / class_dir.name
        target_dir.mkdir(parents=True, exist_ok=True)
        for image in images:
            digest = hashlib.sha256(image.read_bytes()).hexdigest()[:16]
            target = target_dir / f"{digest}_{image.name}"
            if not target.exists():
                shutil.copy2(image, target)
                copied += 1
    return copied


def canonical_name(name: str) -> str:
    return (
        name.replace("Cherry_(including_sour)", "Cherry")
        .replace("Corn_(maize)", "Corn")
        .replace("Pepper,_bell", "Pepper")
        .replace("Pepper___", "Pepper,_bell___")
        .replace("Common_rust_", "Common_rust")
    )


def normalize_classes(destination: Path) -> None:
    temporary = destination.with_name(f"{destination.name}_normalized")
    if temporary.exists():
        shutil.rmtree(temporary)
    temporary.mkdir(parents=True)

    source_by_class = {canonical_name(path.name): path for path in destination.iterdir() if path.is_dir()}
    for index, class_name in enumerate(CLASS_NAMES):
        target = temporary / f"{index:02d}_{class_name}"
        target.mkdir()
        if class_name == "Background":
            for image_index in range(64):
                image = Image.new("RGB", (224, 224), (image_index * 37 % 255, image_index * 71 % 255, image_index * 113 % 255))
                draw = ImageDraw.Draw(image)
                draw.rectangle((0, 0, 223, 223), outline=(255, 255, 255), width=4)
                image.save(target / f"synthetic_background_{image_index:03d}.jpg", quality=90)
            continue

        source = source_by_class.get(canonical_name(class_name))
        if source is None:
            raise RuntimeError(f"Missing PlantVillage class after normalization: {class_name}")
        for image in source.iterdir():
            if image.is_file():
                shutil.copy2(image, target / image.name)

    shutil.rmtree(destination)
    temporary.rename(destination)


def run() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--destination", type=Path, default=Path("data/plantvillage"))
    parser.add_argument("--kaggle", action="store_true", help="Also download the Kaggle mirror using the Kaggle CLI.")
    args = parser.parse_args()

    args.destination.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="plantvillage-") as temporary:
        temporary_root = Path(temporary)
        github_root = temporary_root / "github"
        subprocess.run(
            ["git", "clone", "--depth", "1", PLANTVILLAGE_REPO, str(github_root)],
            check=True,
        )
        total = copy_unique_images(github_root, args.destination)

        if args.kaggle:
            subprocess.run(
                ["kaggle", "datasets", "download", "-d", KAGGLE_DATASET, "-p", str(temporary_root)],
                check=True,
            )
            archives = list(temporary_root.glob("*.zip"))
            if not archives:
                raise RuntimeError("The Kaggle CLI completed without producing a dataset archive.")
            import zipfile

            kaggle_root = temporary_root / "kaggle"
            kaggle_root.mkdir()
            with zipfile.ZipFile(archives[0]) as archive:
                archive.extractall(kaggle_root)
            total += copy_unique_images(kaggle_root, args.destination)

    if total == 0:
        raise RuntimeError(f"No supported images were found in {args.destination}.")
    normalize_classes(args.destination)
    print(f"Prepared {total} unique PlantVillage images in {args.destination}")


if __name__ == "__main__":
    run()
