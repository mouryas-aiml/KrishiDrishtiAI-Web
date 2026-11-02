package com.krishidrishti.inference;

public record ClassMapping(String crop, String disease) {
    public static final ClassMapping[] CLASSES = {
        new ClassMapping("Apple", "Apple scab"), new ClassMapping("Apple", "Black rot"),
        new ClassMapping("Apple", "Cedar apple rust"), new ClassMapping("Apple", "Healthy"),
        new ClassMapping("Background", "Background"), new ClassMapping("Blueberry", "Healthy"),
        new ClassMapping("Cherry", "Powdery mildew"), new ClassMapping("Cherry", "Healthy"),
        new ClassMapping("Corn", "Cercospora leaf spot"), new ClassMapping("Corn", "Common rust"),
        new ClassMapping("Corn", "Northern leaf blight"), new ClassMapping("Corn", "Healthy"),
        new ClassMapping("Grape", "Black rot"), new ClassMapping("Grape", "Esca (Black Measles)"),
        new ClassMapping("Grape", "Leaf blight"), new ClassMapping("Grape", "Healthy"),
        new ClassMapping("Orange", "Citrus greening"), new ClassMapping("Peach", "Bacterial spot"),
        new ClassMapping("Peach", "Healthy"), new ClassMapping("Pepper", "Bacterial spot"),
        new ClassMapping("Pepper", "Healthy"), new ClassMapping("Potato", "Early blight"),
        new ClassMapping("Potato", "Late blight"), new ClassMapping("Potato", "Healthy"),
        new ClassMapping("Raspberry", "Healthy"), new ClassMapping("Soybean", "Healthy"),
        new ClassMapping("Squash", "Powdery mildew"), new ClassMapping("Strawberry", "Leaf scorch"),
        new ClassMapping("Strawberry", "Healthy"), new ClassMapping("Tomato", "Bacterial spot"),
        new ClassMapping("Tomato", "Early blight"), new ClassMapping("Tomato", "Late blight"),
        new ClassMapping("Tomato", "Leaf mold"), new ClassMapping("Tomato", "Septoria leaf spot"),
        new ClassMapping("Tomato", "Spider mites"), new ClassMapping("Tomato", "Target spot"),
        new ClassMapping("Tomato", "Yellow leaf curl virus"), new ClassMapping("Tomato", "Mosaic virus"),
        new ClassMapping("Tomato", "Healthy")
    };
}
