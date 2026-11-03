import argparse
import os
import sys
from pathlib import Path
import torch.onnx
import onnxruntime
import numpy as np
import torch.nn as nn

MODEL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(MODEL_ROOT))

from model.make_model import make_model
from config import cfg

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PyTorch to ONNX export script")
    parser.add_argument("--config_file", default="config/plantai_resnet_18.yaml", help="Path to config file", type=str)
    parser.add_argument("opts", help="Modify config options via command-line", default=None, nargs=argparse.REMAINDER)
    parser.add_argument("--local_rank", default=0, type=int)
    args = parser.parse_args()

    if args.config_file != "":
        cfg.merge_from_file(args.config_file)
    cfg.merge_from_list(args.opts)
    cfg.freeze()

    # Load model
    model_path = cfg.MODEL.WEIGHTS
    num_classes = cfg.MODEL.NUM_CLASSES if hasattr(cfg.MODEL, "NUM_CLASSES") else 39
    model = make_model(cfg, num_classes)
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()

    class LogitsOnly(nn.Module):
        def __init__(self, wrapped_model):
            super().__init__()
            self.wrapped_model = wrapped_model

        def forward(self, inputs):
            logits, _ = self.wrapped_model(inputs)
            return logits

    export_model = LogitsOnly(model).eval()

    # Export to ONNX
    dummy_input = torch.zeros((1, 3, 224, 224))
    torch.onnx.export(
        export_model,
        dummy_input,
        "model.onnx",
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
        opset_version=11
    )
    print("Exported model to ONNX")

    # Optional ONNX inference test
    session = onnxruntime.InferenceSession("model.onnx")
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    x = np.zeros((1, 3, 224, 224), dtype=np.float32)
    output_data = session.run([output_name], {input_name: x})[0]
    print("✅ ONNX inference successful. Output shape:", output_data.shape)