import cv2
import os
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
from collections import deque

# Load DeepFake Detection Model using ResNet18
class DeepFakeDetectionModel(torch.nn.Module):
    def __init__(self):
        super(DeepFakeDetectionModel, self).__init__()
        # Load pretrained ResNet18 model from torchvision
        self.model = torch.hub.load('pytorch/vision', 'resnet18', pretrained=True)
        # Replace final layer to output 2 classes: REAL or FAKE
        self.model.fc = torch.nn.Linear(self.model.fc.in_features, 2)

    def forward(self, x):
        return self.model(x)

# Instantiate the model and load saved weights
model = DeepFakeDetectionModel()
model.load_state_dict(torch.load('models/model.pt', map_location=torch.device('cpu')), strict=False)
model.eval()  # Set model to evaluation mode


def deep_predict(video_path, frame_limit=200):
    # Open the video file
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"final_result": "Error: Cannot open video.", "processed_frames": 0, "total_frames": 0}

    # Get total number of frames in the video
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Decide how many frames to process (at intervals)
    FRAME_LIMIT = frame_limit
    frame_interval = max(1, total_frames // FRAME_LIMIT)

    # Define image transformations for the model input
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Resize((224, 224)),  # Resize to model's input size
        transforms.Normalize(mean=[0.485, 0.456, 0.406],  # Standard normalization
                             std=[0.229, 0.224, 0.225]),
    ])

    # Variables to keep track of scores and counts
    processed_frames = 0
    real_score = 0.0
    fake_score = 0.0
    real_count = 0
    fake_count = 0
    window = deque(maxlen=10)  # Not used in final output, but may be for smoothing predictions

    frame_idx = 0
    # Loop through video frames
    while cap.isOpened() and processed_frames < FRAME_LIMIT:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            break

        frame_idx += frame_interval
        processed_frames += 1

        
        pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        # Apply transformations and add batch dimension
        input_tensor = transform(pil_img).unsqueeze(0)

        with torch.no_grad():
            output = model(input_tensor)
            probs = F.softmax(output, dim=1)
            pred = torch.argmax(probs).item()

        
        real_score += probs[0][0].item()  # Probability of REAL
        fake_score += probs[0][1].item()  # Probability of FAKE

        
        if pred == 0:
            real_count += 1
        else:
            fake_count += 1

        

    cap.release() 

    
    final_result = "REAL" if real_score > fake_score else "FAKE"

    return {
        "final_result": final_result,
        "real_score": real_score,
        "fake_score": fake_score,
        "processed_frames": processed_frames,
        "total_frames": total_frames,
        "real_count": real_count,
        "fake_count": fake_count,
    }
