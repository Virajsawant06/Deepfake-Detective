
---


# 🕵️‍♂️ Deepfake Detective

Deepfake Detective is a Python-based tool that detects deepfake videos using machine learning techniques. This project aims to contribute to media integrity by identifying altered or AI-generated videos and classifying them as **real** or **fake**.

---

## 📌 Features

- 🎥 Upload video files for analysis  
- 🧠 Deep learning model for deepfake detection  
- 📊 Real-time inference and probability scores  
- 📁 Simple interface to test your own videos  
- 🔐 Secure and efficient processing (no external API calls)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Virajsawant06/Deepfake-Detective.git
cd Deepfake-Detective
````

### 2. Create a Virtual Environment (optional but recommended)

```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

> Make sure your video input is placed in the appropriate directory as per the code logic.

---

## 🧠 Model Overview

* The model is trained on a dataset of real and fake videos.
* Frame-level features are extracted using a CNN (e.g., Xception or EfficientNet).
* A classifier (e.g., LSTM or Dense layers) predicts whether a video is fake or real.

* https://drive.google.com/file/d/1j_NHFeGizfkWjfQBZZRkCIamx4LBcp3p/view?usp=sharing LINK FOR DATASET

---

## 📁 Folder Structure

```
Deepfake-Detective/
│
├── models/                  # Saved ML models
├── static/                  # Static files (if using web UI)
├── templates/               # HTML templates (if using Flask)
├── test_videos/             # Sample input videos
├── utils/                   # Helper functions
├── app.py                   # Main application logic
├── requirements.txt         # Python dependencies
└── README.md                # Project overview
```

---

## 🔐 Security Notice

⚠️ **Important:** Do **not** include your GCP or any other credentials in the repo. Always use `.env` files or secret managers. Credentials that were exposed earlier have been revoked and cleaned.

---

## ✅ To-Do / Future Work

* [ ] Add GUI or web interface
* [ ] Improve model accuracy
* [ ] Add real-time camera input
* [ ] Host demo on a secure server

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.



---

###  Open Source Contributions

We welcome contributions from developers around the world who are passionate about media integrity, AI, and security.

#### 🚀 Suggested Features to Work On

Here are some ideas you can contribute to:

* 🌐 **Internet Traceback**
  Implement a module that attempts to **track where the deepfake video has been posted online** using reverse video search or web crawling techniques.

* 📡 **Real-time Webcam Deepfake Detection**
  Add functionality to analyze live webcam input and detect deepfakes on the fly.

* 🌈 **Visual Deepfake Explanation (XAI)**
  Highlight parts of the face or frame that the model used to determine it as fake (e.g., heatmaps or saliency maps).

* 🧪 **Benchmark Against Other Models**
  Add a script to compare different architectures (Xception, EfficientNet, etc.) on the same dataset and log performance.

* 🛡️ **API Protection**
  Add authentication and request limits to a deployed version to prevent abuse and ensure security.

* 📱 **Mobile Compatibility**
  Build a simple Android app that allows users to upload a video for verification through the model.

---

#### 🛠 How to Contribute

1. Fork the repository 🍴
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Feel free to suggest new features via GitHub Issues or Discussions!

---


## 📜 License

This project is licensed under the MIT License.

---

## 🙋‍♂️ Author

**Viraj Sawant**
[GitHub Profile](https://github.com/Virajsawant06)

```

---


```
