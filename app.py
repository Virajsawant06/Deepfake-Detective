import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import io
from PIL import Image
import base64
import re
from werkzeug.utils import secure_filename
from real_or_fakee import deep_predict
from google.cloud import vision
import google.auth
import json
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"acquired-medley-443004-p2-238d5cdcdc60.json"
from google.cloud import vision

app = Flask(__name__)
CORS(app) 
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

vision_client = vision.ImageAnnotatorClient()

@app.route("/", methods=["POST"])
def process_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
        
    file = request.files['video']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    
    frame_limit = int(request.form.get('frame_limit', 200))
    
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Process the video and get results, passing the frame limit
            result = deep_predict(file_path, frame_limit)
            
            # Ensure the result format matches what the frontend expects
            if 'real_score' not in result:
                result['real_score'] = float(result.get('real_count', 0))
            if 'fake_score' not in result:
                result['fake_score'] = float(result.get('fake_count', 0))
           
                
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": f"Processing error: {str(e)}"}), 500
        finally:
            
            pass
    
    return jsonify({"error": "Invalid request"}), 400


@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "Deepfake detection API is running"})


def search_image_online(image_bytes):
    """
    Search for an image online using Google Vision API
    Returns information about web matches
    """
    try:
        # Create an image instance from the bytes
        image = vision.Image(content=image_bytes)
        
        # Perform web detection
        web_detection = vision_client.web_detection(image=image).web_detection
        
        sources = []
        found_online = False
        best_similarity = 0
        
        # Check for matching images
        if web_detection.web_entities:
            found_online = True
            # Get the highest score
            best_score = max((entity.score for entity in web_detection.web_entities), default=0)
            best_similarity = int(best_score * 100)  # Convert to percentage
        
        # Get potential source URLs
        if web_detection.pages_with_matching_images:
            for page in web_detection.pages_with_matching_images:
                if page.url and page.page_title:
                    sources.append({
                        "url": page.url,
                        "title": page.page_title,
                        "snippet": "This image appears on this web page",
                        # No date available from the API
                    })
        
        # Limit to top 3 sources
        sources = sources[:3]
        
        return {
            "found_online": found_online and len(sources) > 0,
            "similarity": best_similarity if found_online else 0,
            "sources": sources
        }
    except Exception as e:
        print(f"Error in image search: {str(e)}")
        return {
            "found_online": False,
            "similarity": 0,
            "sources": []
        }


@app.route("/search-frames", methods=["POST"])
def search_frames():
    # Check if frame data is in the request
    if 'frames' not in request.form:
        return jsonify({"error": "No frame data provided"}), 400
    
    try:
        # Parse the frame data
        frames_data = request.form.getlist('frames')
        frame_times = request.form.getlist('frame_times')
        frame_indices = request.form.getlist('frame_indices')
        
        if not frames_data:
            return jsonify({"error": "Empty frames data"}), 400
        
        # Process each frame 
        results = []
        for i, frame_data in enumerate(frames_data):
            # Process data URL
            if frame_data.startswith('data:image'):
                # Extract the base64 part
                image_data = re.sub('^data:image/.+;base64,', '', frame_data)
                image_bytes = base64.b64decode(image_data)
                
                # Get frame metadata
                frame_index = frame_indices[i] if i < len(frame_indices) else i
                frame_time = frame_times[i] if i < len(frame_times) else "0.00"
                
               
                search_result = search_image_online(image_bytes)
                
                # Add to results
                results.append({
                    "frame_index": int(frame_index),
                    "frame_time": frame_time,
                    "similarity": search_result["similarity"],
                    "found_online": search_result["found_online"],
                    "sources": search_result["sources"]
                })
        
       
        frames_found = sum(1 for r in results if r["found_online"])
        
        return jsonify({
            "search_results": results,
            "search_count": len(results),
            "frames_found_online": frames_found,
            "match_percentage": round((frames_found / len(results)) * 100) if results else 0,
            "message": f"Searched {len(results)} frames online"
        })
    
    except Exception as e:
        return jsonify({"error": f"Error processing frames: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)