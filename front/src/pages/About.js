
import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import logo from '../assets/detection.png';
import Deepfakes from '../assets/Deepfakes.jpeg'
import risks from '../assets/risks.jpeg'
import process from '../assets/process.jpg'

function About() {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>Understanding Deepfakes</h1>
        <p>The technology behind synthetic media and why detection matters</p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <div className="section-text">
            <h2>What Are Deepfakes?</h2>
            <p>
              Deepfakes are synthetic media in which a person's likeness is replaced with someone else's using artificial intelligence. 
              The term "deepfake" is a portmanteau of "deep learning" and "fake," highlighting the technology's foundation in deep learning algorithms.
            </p>
            <p>
              These AI systems can create convincing but fabricated videos or images by analyzing existing footage and generating new content that mimics the original subject's 
              facial expressions, voice, and gestures. As the technology advances, deepfakes become increasingly difficult to distinguish from authentic media with the naked eye.
            </p>
          </div>
          <div className="section-image">
            <img src={Deepfakes} alt="Deepfake Example" />
          </div>
        </div>

        <div className="about-section reverse">
          <div className="section-image">
            <img src={process} alt="Deepfake Creation Process" />
          </div>
          <div className="section-text">
            <h2>How Deepfakes Are Created</h2>
            <p>
              Deepfakes are typically created using deep neural networks called autoencoders and generative adversarial networks (GANs). 
              These AI models are trained on large datasets of images or videos of the target person.
            </p>
            <p>
              The process involves:
            </p>
            <ul>
              <li>Collecting video footage of both the source and target individuals</li>
              <li>Training algorithms to identify and map facial features</li>
              <li>Generating synthetic facial expressions that match the source video</li>
              <li>Reconstructing the video with the swapped face</li>
              <li>Refining the result to remove artifacts and improve realism</li>
            </ul>
          </div>
        </div>

        <div className="about-section">
          <div className="section-text">
            <h2>The Risks of Deepfakes</h2>
            <p>
              While deepfake technology has legitimate applications in film production, art, and accessibility tools, it also presents significant risks:
            </p>
            <ul>
              <li><strong>Misinformation and Political Manipulation:</strong> Creating fake videos of political figures saying or doing controversial things</li>
              <li><strong>Non-consensual Content:</strong> Generating synthetic inappropriate content using someone's likeness without permission</li>
              <li><strong>Financial Fraud:</strong> Impersonating executives or employees to authorize fraudulent transactions</li>
              <li><strong>Erosion of Trust:</strong> Contributing to a "post-truth" environment where authentic media can be dismissed as fake</li>
            </ul>
          </div>
          <div className="section-image">
            <img src={risks} alt="Deepfake Risks" />
          </div>
        </div>

        <div className="about-section reverse">
          <div className="section-image">
            <img src={logo} alt="Deepfake Detection" />
          </div>
          <div className="section-text">
            <h2>Deepfake Detection</h2>
            <p>
              Detecting deepfakes is an ongoing technological challenge, as generation techniques continually evolve. Common detection methods include:
            </p>
            <ul>
              <li><strong>Biological Signals:</strong> Analyzing inconsistencies in blinking patterns</li>
              <li><strong>Facial Artifacts:</strong> Detecting unnatural facial movements or inconsistent lighting</li>
              <li><strong>Deep Learning Methods:</strong> Using AI to identify patterns that humans might miss</li>
            </ul>
            <p>
              Our deepfake detector uses a combination of these approaches, powered by deep learning models trained on thousands of real and synthesized videos.
            </p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Try Our Deepfake Detection Tool</h2>
        <p>Experience the power of AI-powered detection technology to verify video authenticity</p>
        <Link to="/detector" className="cta-button">Use Detector</Link>
      </section>
    </div>
  );
}

export default About;