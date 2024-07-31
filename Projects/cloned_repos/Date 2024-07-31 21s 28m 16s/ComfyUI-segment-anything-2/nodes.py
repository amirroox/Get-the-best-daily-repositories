import torch
import os
import numpy as np
import json

from contextlib import nullcontext

from .load_model import load_model

import comfy.model_management as mm
from comfy.utils import ProgressBar, common_upscale
import folder_paths

script_directory = os.path.dirname(os.path.abspath(__file__))

class DownloadAndLoadSAM2Model:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {
            "model": ([ 
                    'sam2_hiera_base_plus.safetensors',
                    'sam2_hiera_large.safetensors',
                    'sam2_hiera_small.safetensors',
                    'sam2_hiera_tiny.safetensors',
                    ],),
            "segmentor": (
                    ['single_image','video', 'automaskgenerator'],
                    ),
            "device": (['cuda', 'cpu', 'mps'], ),
            "precision": ([ 'fp16','bf16','fp32'],
                    {
                    "default": 'bf16'
                    }),

            },
        }

    RETURN_TYPES = ("SAM2MODEL",)
    RETURN_NAMES = ("sam2_model",)
    FUNCTION = "loadmodel"
    CATEGORY = "SAM2"

    def loadmodel(self, model, segmentor, device, precision):
        if precision != 'fp32' and device == 'cpu':
            raise ValueError("fp16 and bf16 are not supported on cpu")

        if device == "cuda":
            if torch.cuda.get_device_properties(0).major >= 8:
                # turn on tfloat32 for Ampere GPUs (https://pytorch.org/docs/stable/notes/cuda.html#tensorfloat-32-tf32-on-ampere-devices)
                torch.backends.cuda.matmul.allow_tf32 = True
                torch.backends.cudnn.allow_tf32 = True
        dtype = {"bf16": torch.bfloat16, "fp16": torch.float16, "fp32": torch.float32}[precision]

        download_path = os.path.join(folder_paths.models_dir, "sam2")
        model_path = os.path.join(download_path, model)
        
        if not os.path.exists(model_path):
            print(f"Downloading SAM2 model to: {model_path}")
            from huggingface_hub import snapshot_download
            snapshot_download(repo_id="Kijai/sam2-safetensors",
                            allow_patterns=[f"*{model}*"],
                            local_dir=download_path,
                            local_dir_use_symlinks=False)

        model_mapping = {
            "base": "sam2_hiera_b+.yaml",
            "large": "sam2_hiera_l.yaml",
            "small": "sam2_hiera_s.yaml",
            "tiny": "sam2_hiera_t.yaml"
        }

        model_cfg_path = next(
            (os.path.join(script_directory, "sam2_configs", cfg) for key, cfg in model_mapping.items() if key in model),
            None
            )

        model =load_model(model_path, model_cfg_path, segmentor, dtype, device)
        
        sam2_model = {
            'model': model, 
            'dtype': dtype,
            'device': device,
            'segmentor' : segmentor
            }

        return (sam2_model,)


class Florence2toCoordinates:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "data": ("JSON", ),
                "index": ("STRING", {"default": "0"}),
            },
        }
    
    RETURN_TYPES = ("STRING", )
    RETURN_NAMES =("coordinates", )
    FUNCTION = "segment"
    CATEGORY = "SAM2"

    def segment(self, data, index):
        try:
            coordinates = coordinates.replace("'", '"')
            coordinates = json.loads(coordinates)
        except:
            coordinates = data
        print("Type of data:", type(data))
        print("Data:", data)
        if len(data)==0:
            return (json.dumps([{'x': 0, 'y': 0}]),)
        center_points = []
        indexes = [int(i) for i in index.split(",")]
        print("Indexes:", indexes)
        
        for idx in indexes:
            if 0 <= idx < len(data[0]):
                bbox = data[0][idx]
                #print(f"Processing bbox at index {idx}: {bbox}")
                min_x, min_y, max_x, max_y = bbox
                center_x = int((min_x + max_x) / 2)
                center_y = int((min_y + max_y) / 2)
                center_points.append({"x": center_x, "y": center_y})
            else:
                raise ValueError(f"There's nothing in index: {idx}")
                
        coordinates = json.dumps(center_points)
        print("Coordinates:", coordinates)
        return (coordinates,)
    
class Sam2Segmentation:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "sam2_model": ("SAM2MODEL", ),
                "image": ("IMAGE", ),
                "coordinates_positive": ("STRING", {"forceInput": True}),
               
                "keep_model_loaded": ("BOOLEAN", {"default": True}),
            },
            "optional": {
                "coordinates_negative": ("STRING", {"forceInput": True}),
            },
        }
    
    RETURN_TYPES = ("MASK", )
    RETURN_NAMES =("mask", )
    FUNCTION = "segment"
    CATEGORY = "SAM2"

    def segment(self, image, sam2_model, coordinates_positive, keep_model_loaded, coordinates_negative=None):
        offload_device = mm.unet_offload_device()
        model = sam2_model["model"]
        device = sam2_model["device"]
        dtype = sam2_model["dtype"]
        segmentor = sam2_model["segmentor"]
        B, H, W, C = image.shape
        image_np = (image[0].contiguous() * 255).byte().numpy()

        if segmentor == 'video': # video model needs images resized first thing
            model_input_image_size = model.image_size
            print("Resizing to model input image size: ", model_input_image_size)
            image = common_upscale(image.movedim(-1,1), model_input_image_size, model_input_image_size, "bilinear", "disabled").movedim(1,-1)

        
        try:
            coordinates_positive = json.loads(coordinates_positive.replace("'", '"'))
            coordinates_positive = [(coord['x'], coord['y']) for coord in coordinates_positive]
            if coordinates_negative is not None:
                coordinates_negative = json.loads(coordinates_negative.replace("'", '"'))
                coordinates_negative = [(coord['x'], coord['y']) for coord in coordinates_negative]
        except:
            coordinates_positive = coordinates_positive
            if coordinates_negative is not None:
                coordinates_negative = coordinates_negative
        
        positive_point_coords = np.array(coordinates_positive)
        positive_point_labels = [1] * len(positive_point_coords)  # 1 = positive
        positive_point_labels = np.array(positive_point_labels)
        print("positive coordinates: ", positive_point_coords)

        if coordinates_negative is not None:
            negative_point_coords = np.array(coordinates_negative)
            negative_point_labels = [0] * len(negative_point_coords)  # 0 = negative
            negative_point_labels = np.array(negative_point_labels)
            print("negative coordinates: ", negative_point_coords)

            # Combine coordinates and labels
        else:
            negative_point_coords = np.empty((0, 2))
            negative_point_labels = np.array([])
        # Ensure both positive and negative coordinates are 2D arrays
        positive_point_coords = np.atleast_2d(positive_point_coords)
        negative_point_coords = np.atleast_2d(negative_point_coords)

        # Ensure both positive and negative labels are 1D arrays
        positive_point_labels = np.atleast_1d(positive_point_labels)
        negative_point_labels = np.atleast_1d(negative_point_labels)

        combined_coords = np.concatenate((positive_point_coords, negative_point_coords), axis=0)
        combined_labels = np.concatenate((positive_point_labels, negative_point_labels), axis=0)
        
        autocast_condition = not mm.is_device_mps(device)
        mask_list = []
        try:
            model.to(device)
        except:
            model.model.to(device)
        with torch.autocast(mm.get_autocast_device(model.device), dtype=dtype) if autocast_condition else nullcontext():
            if image.shape[0] == 1:
                model.set_image(image_np) 
                masks, scores, logits = model.predict(
                    point_coords=combined_coords, 
                    point_labels=combined_labels,
                    multimask_output=True,
                    )

                sorted_ind = np.argsort(scores)[::-1]
                masks = masks[sorted_ind][0] #choose only the best result for now
                scores = scores[sorted_ind]
                logits = logits[sorted_ind]
                mask_list.append(np.expand_dims(masks, axis=0))

            else:
                mask_list = []
                if hasattr(self, 'inference_state'):
                    model.reset_state(self.inference_state)
                self.inference_state = model.init_state(image.permute(0, 3, 1, 2).contiguous(), H, W)

                _, out_obj_ids, out_mask_logits = model.add_new_points(
                    inference_state=self.inference_state,
                    frame_idx=0,
                    obj_id=1,
                    points=combined_coords,
                    labels=combined_labels,
                )
                pbar = ProgressBar(B)
                video_segments = {}
                for out_frame_idx, out_obj_ids, out_mask_logits in model.propagate_in_video(self.inference_state):
                    video_segments[out_frame_idx] = {
                        out_obj_id: (out_mask_logits[i] > 0.0).cpu().numpy()
                        for i, out_obj_id in enumerate(out_obj_ids)
                        }
                    pbar.update(1)
                for frame_idx, obj_masks in video_segments.items():
                    for out_obj_id, out_mask in obj_masks.items():
                        mask_list.append(out_mask)

        if not keep_model_loaded:
            try:
                model.to(offload_device)
            except:
                model.model.to(offload_device)
        
        out_list = []
        for mask in mask_list:
            mask_tensor = torch.from_numpy(mask)
            mask_tensor = mask_tensor.permute(1, 2, 0).cpu().float()
            mask_tensor = mask_tensor.mean(dim=-1, keepdim=True)
            mask_tensor = mask_tensor.repeat(1, 1, 3)
            mask_tensor = mask_tensor[:, :, 0]
            out_list.append(mask_tensor)
        mask_tensor = torch.stack(out_list, dim=0)
        return (mask_tensor,)
    
class Sam2AutoSegmentation:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "sam2_model": ("SAM2MODEL", ),
                "image": ("IMAGE", ),
                "points_per_side": ("INT", {"default": 32}),
                "points_per_batch": ("INT", {"default": 64}),
                "pred_iou_thresh": ("FLOAT", {"default": 0.8}),
                "stability_score_thresh": ("FLOAT", {"default": 0.95, "min": 0.0, "max": 1.0, "step": 0.01}),
                "stability_score_offset": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 1.0, "step": 0.01}),
                "mask_threshold": ("FLOAT", {"default": 0.0, "min": 0.0, "max": 1.0, "step": 0.01}),
                "crop_n_layers": ("INT", {"default": 0}),
                "box_nms_thresh": ("FLOAT", {"default": 0.7, "min": 0.0, "max": 1.0, "step": 0.01}),
                "crop_nms_thresh": ("FLOAT", {"default": 0.7, "min": 0.0, "max": 1.0, "step": 0.01}),
                "crop_overlap_ratio": ("FLOAT", {"default": 0.34, "min": 0.0, "max": 1.0, "step": 0.01}),
                "crop_n_points_downscale_factor": ("INT", {"default": 1}),
                "min_mask_region_area": ("FLOAT", {"default": 0.0, "min": 0.0, "max": 1.0, "step": 0.01}),
                "use_m2m": ("BOOLEAN", {"default": False}),
      
                "keep_model_loaded": ("BOOLEAN", {"default": True}),
            },
           
        }
    
    RETURN_TYPES = ("MASK", "BBOX",)
    RETURN_NAMES =("mask", "bbox" ,)
    FUNCTION = "segment"
    CATEGORY = "SAM2"

    def segment(self, image, sam2_model, points_per_side, points_per_batch, pred_iou_thresh, stability_score_thresh, 
                stability_score_offset, crop_n_layers, box_nms_thresh, crop_n_points_downscale_factor, min_mask_region_area, 
                use_m2m, mask_threshold, crop_nms_thresh, crop_overlap_ratio, keep_model_loaded):
        offload_device = mm.unet_offload_device()
        model = sam2_model["model"]
        device = sam2_model["device"]
        dtype = sam2_model["dtype"]
        segmentor = sam2_model["segmentor"]
        B, H, W, C = image.shape
        image_np = (image[0].contiguous() * 255).byte().numpy()

        if segmentor != 'automaskgenerator':
            raise ValueError("Loaded model is not SAM2AutomaticMaskGenerator")
        
        model.points_per_side=points_per_side
        model.points_per_batch=points_per_batch
        model.pred_iou_thresh=pred_iou_thresh
        model.stability_score_thresh=stability_score_thresh
        model.stability_score_offset=stability_score_offset
        model.crop_n_layers=crop_n_layers
        model.box_nms_thresh=box_nms_thresh
        model.crop_n_points_downscale_factor=crop_n_points_downscale_factor
        model.crop_nms_thresh=crop_nms_thresh
        model.crop_overlap_ratio=crop_overlap_ratio
        model.min_mask_region_area=min_mask_region_area
        model.use_m2m=use_m2m
        model.mask_threshold=mask_threshold
        
        autocast_condition = not mm.is_device_mps(device)

   
        model.predictor.model.to(device)
        mask_list=[]
        with torch.autocast(mm.get_autocast_device(device), dtype=dtype) if autocast_condition else nullcontext():
            result_dict = model.generate(image_np)
            print(result_dict[0].keys())
            mask_list = [item['segmentation'] for item in result_dict]
            bbox_list = [item['bbox'] for item in result_dict]

        if not keep_model_loaded:
           model.predictor.model.to(offload_device)
        
        out_list = []
        for mask in mask_list:
            mask_tensor = torch.from_numpy(mask)
            out_list.append(mask_tensor)
        mask_tensor = torch.stack(out_list, dim=0)
        return (mask_tensor.cpu().float(), bbox_list)
     
NODE_CLASS_MAPPINGS = {
    "DownloadAndLoadSAM2Model": DownloadAndLoadSAM2Model,
    "Sam2Segmentation": Sam2Segmentation,
    "Florence2toCoordinates": Florence2toCoordinates,
    "Sam2AutoSegmentation": Sam2AutoSegmentation
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "DownloadAndLoadSAM2Model": "(Down)Load SAM2Model",
    "Sam2Segmentation": "Sam2Segmentation",
    "Florence2toCoordinates": "Florence2 Coordinates",
    "Sam2AutoSegmentation": "Sam2AutoSegmentation"
}
