import os
import random

import torch
from torch.utils.data import DataLoader
from torchvision import transforms, datasets
from torch.utils.data.sampler import WeightedRandomSampler
from sklearn.model_selection import StratifiedShuffleSplit


class GaussianNoise(object):
    def __init__(self, stddev):
        self.stddev = stddev

    def __call__(self, img):
        noise = torch.randn(*img.size()) * self.stddev
        noisy_img = img + noise
        return noisy_img


def make_dataloader(cfg):
    data_transforms = transforms.Compose([
        transforms.Resize(cfg.DATALOADER.IMAGE_SIZE),
        transforms.RandomCrop(size=cfg.DATALOADER.IMAGE_SIZE[0], padding=16),
        transforms.RandomRotation(degrees=30),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(cfg.DATASET.MEAN, cfg.DATASET.STD)
    ])

    dataset_root = f"{cfg.DATASET.PATH}/{cfg.DATASET.NAME}"
    # Keep evaluation deterministic. A shared ImageFolder would otherwise
    # receive the training augmentations when its transform is reassigned.
    base_dataset = datasets.ImageFolder(root=dataset_root)
    train_source = datasets.ImageFolder(root=dataset_root, transform=data_transforms)
    test_source = datasets.ImageFolder(
        root=dataset_root,
        transform=transforms.Compose([
            transforms.Resize(cfg.DATALOADER.IMAGE_SIZE),
            transforms.CenterCrop(size=cfg.DATALOADER.IMAGE_SIZE[0]),
            transforms.ToTensor(),
            transforms.Normalize(cfg.DATASET.MEAN, cfg.DATASET.STD),
        ]),
    )
    num_classes = len(base_dataset.classes)

    # Keep CPU training bounded while retaining a balanced sample from every
    # class. Set MAX_IMAGES_PER_CLASS to 0 for the complete dataset.
    selected_indices = []
    max_per_class = int(cfg.DATALOADER.MAX_IMAGES_PER_CLASS)
    for class_index in range(num_classes):
        class_indices = [index for index, (_, label) in enumerate(base_dataset.imgs) if label == class_index]
        if max_per_class > 0:
            class_indices = class_indices[:max_per_class]
        selected_indices.extend(class_indices)

    data = [base_dataset.imgs[index][0] for index in selected_indices]
    labels = [base_dataset.imgs[index][1] for index in selected_indices]
    # Split the data and labels using stratified sampling
    sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_relative_idx, test_relative_idx = next(sss.split(data, labels))
    train_idx = [selected_indices[index] for index in train_relative_idx]
    test_idx = [selected_indices[index] for index in test_relative_idx]
    # Create the training and testing datasets
    train_dataset = torch.utils.data.Subset(train_source, train_idx)
    test_dataset = torch.utils.data.Subset(test_source, test_idx)

    # calculate classes weights for imbalance correction
    class_folders = [f.path for f in os.scandir(f"{cfg.DATASET.PATH}/{cfg.DATASET.NAME}") if f.is_dir()]
    num_images_per_class = [len(os.listdir(folder)) for folder in class_folders]
    class_weights = [1.0 / count for count in num_images_per_class]
    sample_weights = [class_weights[base_dataset.imgs[index][1]] for index in train_idx]
    # Use weighted sampler for the train_loader
    weighted_sampler = WeightedRandomSampler(sample_weights, len(train_dataset))

    # Define the data loaders
    train_loader = DataLoader(train_dataset, batch_size=cfg.DATALOADER.BATCH_SIZE, shuffle=False,
                              sampler=weighted_sampler, num_workers=2, pin_memory=True)
    test_loader = DataLoader(test_dataset, batch_size=cfg.DATALOADER.BATCH_SIZE, shuffle=False,
                             num_workers=2, pin_memory=True)

    print(f"NUMBER IMG PER CLASS: {num_images_per_class}")
    return train_loader, test_loader, train_dataset, test_dataset, num_classes, torch.tensor(class_weights)
