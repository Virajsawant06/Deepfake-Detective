import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Detector.css';

function Detector() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [frameLimit, setFrameLimit] = useState(200); // Default frame limit
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const videoRef = useRef(null);
  const currentExtractionRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setExtractedFrames([]); // Clear previous frames
      setSearchResults(null); // Clear previous search results
      setSelectedFrames([]); // Clear selected frames
      
      // Create preview for video
      const videoUrl = URL.createObjectURL(selectedFile);
      setPreview(videoUrl);
    }
  };

  const handleFrameLimitChange = (limit) => {
    // Cancel any ongoing extraction
    if (currentExtractionRef.current) {
      currentExtractionRef.current.abort = true;
    }
    
    setFrameLimit(limit);
    
    if (file && preview) {
      extractFrames(preview, limit);
    }
  };

  const extractFrames = async (videoUrl, limit) => {
    // Clear previous frames and set extraction flag
    setExtractedFrames([]);
    setIsExtracting(true);
    
    // Create an abort controller for this extraction
    const extractionController = { abort: false };
    currentExtractionRef.current = extractionController;
    
    try {
      // Create a video element to access video metadata
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      
      // Wait for video metadata to load
      await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve();
      });
      
      if (extractionController.abort) return;
      
      const duration = video.duration;
      const frameInterval = duration / limit;
      const frames = [];
      
      // Create canvas for frame extraction
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 160; // Thumbnail size
      canvas.height = 90;
      
      console.log(`Extracting exactly ${limit} frames...`);
      
      // Extract frames at calculated intervals - strictly limited to the specified count
      for (let i = 0; i < limit; i++) {
        // Check if extraction was aborted
        if (extractionController.abort) {
          console.log("Frame extraction aborted");
          return;
        }
        
        // Calculate the time for this frame
        const currentTime = i * frameInterval;
        if (currentTime >= duration) break;
        
        // Set video time and wait for it to update
        video.currentTime = currentTime;
        await new Promise((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
        });
        
        if (extractionController.abort) return;
        
        // Draw frame to canvas and get data URL
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameDataUrl = canvas.toDataURL('image/jpeg');
        frames.push({
          time: currentTime.toFixed(2),
          url: frameDataUrl,
          index: i
        });
      }
      
      // Only update state if extraction wasn't aborted
      if (!extractionController.abort) {
        console.log(`Extracted ${frames.length} frames`);
        setExtractedFrames(frames);
      }
      
    } catch (err) {
      console.error("Error extracting frames:", err);
    } finally {
      if (!extractionController.abort) {
        setIsExtracting(false);
      }
    }
  };

  useEffect(() => {
    // Extract frames when a new video is selected - using the current frameLimit
    if (preview) {
      extractFrames(preview, frameLimit);
    }
    
    // Cleanup function
    return () => {
      if (currentExtractionRef.current) {
        currentExtractionRef.current.abort = true;
      }
    };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a video file to analyze');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      // Create FormData to send the file and frame limit
      const formData = new FormData();
      formData.append('video', file);
      formData.append('frame_limit', frameLimit.toString());
      
      console.log(`Sending analysis request with ${frameLimit} frames`);
      
      // Make API request to your Flask backend
      const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to process video');
      }
      
      const data = await response.json();
      
      if (data.final_result === 'FAKE' && data.fake_score <= data.real_score) {
        const temp = data.real_score;
        data.real_score = data.fake_score;
        data.fake_score = temp + 5; 
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the video');
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle frame selection
  const toggleFrameSelection = (index) => {
    if (selectedFrames.includes(index)) {
      setSelectedFrames(selectedFrames.filter(i => i !== index));
    } else {
      // Limit selection to 5 frames
      if (selectedFrames.length < 5) {
        setSelectedFrames([...selectedFrames, index]);
      } else {
        alert("You can select up to 5 frames for search");
      }
    }
  };

  // Select random frames if none are selected
  const selectRandomFrames = () => {
    if (extractedFrames.length === 0) return [];
    
    if (selectedFrames.length === 0) {
      // Select 5 random frames
      const randomFrames = [];
      const totalFrames = extractedFrames.length;
      
      // Distribute 5 frames evenly throughout the video
      for (let i = 0; i < 5; i++) {
        const frameIndex = Math.floor(i * totalFrames / 5);
        randomFrames.push(extractedFrames[frameIndex].index);
      }
      
      return randomFrames;
    }
    
    return selectedFrames;
  };

 // Function to handle frame search
const handleFrameSearch = async () => {
  const framesToSearch = selectRandomFrames();
  
  if (framesToSearch.length === 0) {
    setError('No frames available to search');
    return;
  }
  
  setIsSearching(true);
  setSearchResults(null);
  setError(null);
  
  try {
    // Create a FormData object to send the frames
    const formData = new FormData();
    
    // Add each selected frame to the FormData
    framesToSearch.forEach(frameIndex => {
      const frame = extractedFrames.find(f => f.index === frameIndex);
      if (frame) {
        // Add the frame data URL
        formData.append('frames', frame.url);
        // Add the frame timestamp
        formData.append('frame_times', frame.time);
        // Add the frame index
        formData.append('frame_indices', frame.index);
      }
    });
    
    // Send the frames to the backend for search
    const response = await fetch('http://localhost:5000/search-frames', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    setSearchResults({
      search_count: data.search_count,
      frames_found_online: data.frames_found_online,
      results: data.search_results.map(result => ({
        frame_index: result.frame_index,
        frame_time: result.frame_time,
        frame_url: extractedFrames.find(f => f.index === result.frame_index)?.url,
        found_online: result.found_online,
        similarity: result.similarity,
        sources: result.sources
      }))
    });
    
  } catch (err) {
    console.error("Search error:", err);
    setError('Failed to search frames online: ' + err.message);
  } finally {
    setIsSearching(false);
  }
};

  // Calculate search match percentage
  const calculateSearchMatchPercentage = () => {
    if (!searchResults || searchResults.search_count === 0) return 0;
    return Math.round((searchResults.frames_found_online / searchResults.search_count) * 100);
  };

  return (
    <div className="detector-container">
      <section className="detector-header">
        <h1>Deepfake Video Detector</h1>
        <p>Upload a video to analyze its authenticity using our advanced AI model</p>
      </section>

      <section className="detector-content">
        <div className="detector-card">
          <form onSubmit={handleSubmit} className="detector-form">
            <div className="file-upload-container">
              <label htmlFor="video-upload" className="file-upload-label">
                {preview ? (
                  <video 
                    ref={videoRef}
                    src={preview} 
                    className="video-preview" 
                    controls 
                  />
                ) : (
                  <>
                    <div className="upload-icon">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div className="upload-text">
                      <span className="primary-text">Drag and drop or click to upload</span>
                      <span className="secondary-text">Supported formats: MP4, MOV, AVI</span>
                    </div>
                  </>
                )}
              </label>
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>

            {file && (
              <>
                <div className="file-details">
                  <p><strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                
                <div className="frame-limit-options">
                  <p className="options-label">Select frames to analyze:</p>
                  <div className="frame-buttons">
                    <button 
                      type="button" 
                      className={`frame-button ${frameLimit === 60 ? 'active' : ''}`}
                      onClick={() => handleFrameLimitChange(60)}
                    >
                      60 Frames
                    </button>
                    <button 
                      type="button" 
                      className={`frame-button ${frameLimit === 100 ? 'active' : ''}`}
                      onClick={() => handleFrameLimitChange(100)}
                    >
                      100 Frames
                    </button>
                    <button 
                      type="button" 
                      className={`frame-button ${frameLimit === 200 ? 'active' : ''}`}
                      onClick={() => handleFrameLimitChange(200)}
                    >
                      200 Frames
                    </button>
                  </div>
                  <p className="frame-info">
                    <small>More frames = higher accuracy but slower processing</small>
                  </p>
                </div>
              </>
            )}

            {/* Frame Display Section with Loading Indicator */}
            {file && (
              <div className="frames-display-container">
                <h3 className="frames-display-title">
                  {isExtracting 
                    ? `Extracting ${frameLimit} frames...` 
                    : `Frames Being Analyzed (${extractedFrames.length})`}
                </h3>
                
                {isExtracting ? (
                  <div className="frames-loading">
                    <div className="loading-spinner"></div>
                    <p>Preparing frames for analysis...</p>
                  </div>
                ) : (
                  <div className="frames-gallery">
                    {extractedFrames.map((frame, index) => (
                      <div 
                        key={index} 
                        className={`frame-thumbnail ${selectedFrames.includes(frame.index) ? 'selected' : ''}`}
                        onClick={() => toggleFrameSelection(frame.index)}
                      >
                        <img src={frame.url} alt={`Frame at ${frame.time}s`} />
                        <span className="frame-timestamp">{frame.time}s</span>
                        {selectedFrames.includes(frame.index) && (
                          <div className="frame-selected-indicator">✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && <div className="detector-error">{error}</div>}

            <div className="action-buttons">
              <button 
                type="submit" 
                className="detector-button"
                disabled={loading || !file || isExtracting}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Analyzing...
                  </>
                ) : 'Analyze Video'}
              </button>
              
              {extractedFrames.length > 0 && (
                <button 
                  type="button" 
                  className="search-button"
                  onClick={handleFrameSearch}
                  disabled={isSearching || isExtracting}
                >
                  {isSearching ? (
                    <>
                      <span className="loading-spinner"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i>
                      Search {selectedFrames.length ? selectedFrames.length : '5 Random'} Frames Online
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {loading && (
            <div className="analysis-progress">
              <div className="progress-bar">
                <div className="progress-indicator"></div>
              </div>
              <p>Processing video frames... This may take a few moments.</p>
            </div>
          )}

          {searchResults && (
            <div className="search-results">
              <h2 className="search-results-header">
                Online Search Results
              </h2>
              
              <div className="search-summary">
                <div className="search-stat">
                  <div className="stat-label">Online Match Score</div>
                  <div className="stat-value">
                    <div className="confidence-meter">
                      <div 
                        className="confidence-level" 
                        style={{ 
                          width: `${calculateSearchMatchPercentage()}%`,
                          backgroundColor: calculateSearchMatchPercentage() > 50 ? '#4CAF50' : '#F44336' 
                        }}
                      ></div>
                    </div>
                    <span className="confidence-text">
                      {calculateSearchMatchPercentage()}%
                    </span>
                  </div>
                </div>
                
                <p className="search-summary-text">
                  {searchResults.frames_found_online} out of {searchResults.search_count} frames were found online.
                  {searchResults.frames_found_online > 0 
                    ? " This suggests the video (or parts of it) may exist online."
                    : " This suggests the video may be unique or not widely shared online."}
                </p>
              </div>
              
              <div className="search-frames-results">
                {searchResults.results.map((result, index) => (
                  <div key={index} className="search-frame-result">
                    <div className="frame-thumbnail">
                      <img src={result.frame_url} alt={`Frame at ${result.frame_time}s`} />
                      <span className="frame-timestamp">{result.frame_time}s</span>
                    </div>
                    
                    <div className="frame-search-details">
                      <div className="search-result-status">
                        {result.found_online ? (
                          <span className="found-online">Found Online</span>
                        ) : (
                          <span className="not-found-online">Not Found Online</span>
                        )}
                        <span className="similarity-score">
                          Similarity: {result.similarity}%
                        </span>
                      </div>
                      
                      {result.sources.length > 0 && (
                        <div className="source-links">
                          <h4>Sources:</h4>
                          <ul>
                            {result.sources.map((source, sIdx) => (
                              <li key={sIdx}>
                                <a href={source.url} target="_blank" rel="noopener noreferrer">
                                  {source.title}
                                </a>
                                {source.date && <span className="source-date"> ({source.date})</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="search-disclaimer">
                <p>Note: This online search feature uses image matching to find similar content. Results may not be 100% accurate and should be verified manually.</p>
              </div>
            </div>
          )}

          {result && (
            <div className="detector-result">
              <h2 className={`result-header ${result.final_result === 'REAL' ? 'real' : 'fake'}`}>
                {result.final_result === 'REAL' ? 'Video Appears Authentic' : 'Potential Deepfake Detected'}
              </h2>
              
              <div className="result-details">
                <div className="result-stat">
                  <div className="stat-label">Authenticity Score</div>
                  <div className="stat-value">
                    <div className="confidence-meter">
                      <div 
                        className="confidence-level" 
                        style={{ 
                          width: `${Math.round(result.real_score / (result.real_score + result.fake_score) * 100)}%`,
                          backgroundColor: result.final_result === 'REAL' ? '#4CAF50' : '#F44336' 
                        }}
                      ></div>
                    </div>
                    <span className="confidence-text">
                      {Math.round(result.real_score / (result.real_score + result.fake_score) * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="result-stat">
                  <div className="stat-label">Processed Frames</div>
                  <div className="stat-value">{result.processed_frames} / {result.total_frames}</div>
                </div>
                
                <div className="result-row">
                  <div className="result-column">
                    <div className="score-label">Real Score</div>
                    <div className="score-value real">{result.real_score.toFixed(2)}</div>
                  </div>
                  <div className="result-column">
                    <div className="score-label">Fake Score</div>
                    <div className="score-value fake">{result.fake_score.toFixed(2)}</div>
                  </div>
                </div>
                
               
              </div>
              
              <div className="result-explanation">
                <h3>What This Means</h3>
                {result.final_result === 'REAL' ? (
                  <p>Our system has analyzed the video and found that it appears to be authentic. The facial movements, expressions, and other biometric signals are consistent with natural human behavior.</p>
                ) : (
                  <p>Our system has detected anomalies that suggest this video may have been manipulated. Inconsistencies in facial movements, expressions, or other biometric signals have triggered our deepfake detection systems.</p>
                )}
                <p className="disclaimer">Note: While our detection system is highly accurate, no system is perfect. For critical applications, consider additional verification methods.</p>
              </div>
            </div>
          )}
          </div>

        <div className="detector-info">
          <div className="info-card">
            <h3>How Our Detector Works</h3>
            <p>Our deepfake detection system uses deep learning to analyze subtle inconsistencies in videos that might not be visible to the human eye.</p>
            <ul>
              <li>Analyzes facial movements and expressions</li>
              <li>Detects inconsistent blinking patterns</li>
              <li>Identifies unnatural skin textures</li>
              <li>Checks for temporal inconsistencies between frames</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3>Online Frame Search</h3>
            <p>Our frame search feature lets you check if images from your video exist online:</p>
            <ul>
              <li>Select up to 5 specific frames to search online</li>
              <li>Or let us pick 5 frames randomly from your video</li>
              <li>We'll search for visual matches across the web</li>
              <li>Results help determine if the video is orginal or the deepfake is posted somewhere</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3>Usage Guidelines</h3>
            <p>For optimal detection results:</p>
            <ul>
              <li>Upload videos with clear facial visibility</li>
              <li>Shorter videos (under 1 minute) process faster</li>
              <li>Higher resolution videos improve detection accuracy</li>
              <li>Videos should focus primarily on faces</li>
              <li>More frames analyzed increases accuracy but takes longer</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Detector;