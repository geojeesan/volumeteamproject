import librosa
import numpy as np

def analyze_audio_energy(audio_path):
    # Load the audio file
    y, sr = librosa.load(audio_path)
    
    # Calculate the short-term energy of the audio signal
    hop_length = 512
    frame_length = 2048
    energy = np.array([
        sum(abs(y[i:i+frame_length]**2))
        for i in range(0, len(y), hop_length)
    ])
    
    # Normalize energy
    energy = (energy - np.min(energy)) / (np.max(energy) - np.min(energy))
    
    # Identify high and low energy segments
    high_energy_threshold = 0.75  # This threshold can be adjusted
    low_energy_threshold = 0.25   # This threshold can be adjusted
    
    high_energy_segments = np.where(energy > high_energy_threshold)[0]
    low_energy_segments = np.where(energy < low_energy_threshold)[0]
    
    # Convert segment indices to timestamps (seconds)
    high_energy_times = (high_energy_segments * hop_length) / sr
    low_energy_times = (low_energy_segments * hop_length) / sr
    
    return high_energy_times, low_energy_times
