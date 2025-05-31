import torch
import cv2
from torchvision import transforms
from PIL import Image
import os
import torch.nn.functional as F

# Define the model
class DeepFakeDetectionModel(torch.nn.Module):
    def __init__(self):
        super(DeepFakeDetectionModel, self).__init__()
        self.model = torch.hub.load('pytorch/vision', 'resnet18', pretrained=True)
        self.model.fc = torch.nn.Linear(self.model.fc.in_features, 2)

    def forward(self, x):
        return self.model(x)

# Load the model
model = DeepFakeDetectionModel()
model.load_state_dict(torch.load('models/model.pt', map_location=torch.device('cpu')), strict=False)



def deep_predict(video_path):
    if not os.path.exists(video_path):
        return {"final_result": "Error: File not found.", "processed_frames": 0, "total_frames": 0}

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    FRAME_LIMIT = 60
    frame_interval = max(1, total_frames // FRAME_LIMIT)

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Resize((224, 224)),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    real_count = 0
    fake_count = 0
    real_score = 0.0
    fake_score = 0.0
    processed_frames = 0

    frame_idx = 0

    while cap.isOpened() and processed_frames < FRAME_LIMIT:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            break

        processed_frames += 1
        frame_idx += frame_interval

        pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        input_tensor = transform(pil_image).unsqueeze(0)

        with torch.no_grad():
            output = model(input_tensor)
            probs = F.softmax(output, dim=1)
            _, predicted = torch.max(output, 1)

        real_score += probs[0][0].item()
        fake_score += probs[0][1].item()

        if predicted.item() == 0:
            real_count += 1
        else:
            fake_count += 1

    cap.release()
    cv2.destroyAllWindows()

    # Final decision by majority
    final_result = "FAKE" if fake_count > real_count else "REAL"

    return {
        "final_result": final_result,
        "processed_frames": processed_frames,
        "total_frames": total_frames,
        "real_count": real_count,
        "fake_count": fake_count
    }
