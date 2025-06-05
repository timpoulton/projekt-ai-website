import time
import os
import sys
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from acrcloud.recognizer import ACRCloudRecognizer
import json
from datetime import datetime
from fuzzywuzzy import fuzz
from pydub import AudioSegment

# ACRCloud Configuration
ACR_CONFIG = {
    "host": "identify-ap-southeast-1.acrcloud.com",
    "access_key": "437235d0dc6a34625007d7994da80099",
    "access_secret": "VsUoO94Ey7FCODyxa2naG2TpxIFfFSi7uiTsvvp9",
    "timeout": 10,
}

# Archive path
ARCHIVE_PATH = "C:/ARCHIVE API FILES"


class AudioProcessor:
    def __init__(self):
        self.recognizer = ACRCloudRecognizer(ACR_CONFIG)
        self.confidence_threshold = 80
        self.processed_files = set()

    def recognize_tracks(self, file_path, segment_duration=60, overlap_duration=30):
        """Recognize tracks in the DJ mix."""
        track_list = []
        seen_tracks = set()
        start_seconds = 0

        # Get file duration
        audio = AudioSegment.from_file(file_path)
        file_duration = len(audio) / 1000  # Convert to seconds

        print(
            f"Total duration: {int(file_duration/60)} minutes {int(file_duration%60)} seconds"
        )

        while start_seconds < file_duration:
            current_minute = int(start_seconds / 60)
            current_second = int(start_seconds % 60)
            print(f"\nScanning at {current_minute}:{current_second:02d}")

            try:
                # Get ACRCloud result
                result = self.recognizer.recognize_by_file(
                    file_path, start_seconds, rec_length=20
                )
                parsed_result = json.loads(result)

                # Debug print the raw result
                print(f"ACRCloud Response: {json.dumps(parsed_result, indent=2)}")

                if "metadata" in parsed_result and "music" in parsed_result["metadata"]:
                    for track in parsed_result["metadata"]["music"]:
                        print(
                            f"Found potential track with score: {track.get('score', 0)}"
                        )
                        if track.get("score", 0) >= self.confidence_threshold:
                            title = track.get("title", "Unknown Title")
                            artist = ", ".join(
                                [artist["name"] for artist in track.get("artists", [])]
                            )
                            track_info = f"{artist} - {title}"

                            print(f"Track passed confidence threshold: {track_info}")

                            # Advanced duplicate checking with fuzzy matching
                            if track_info not in seen_tracks:
                                if not any(
                                    fuzz.ratio(track_info, existing_track) > 85
                                    for existing_track in track_list
                                ):
                                    track_list.append(track_info)
                                    seen_tracks.add(track_info)
                                    print(f"Added new track: {track_info}")
                                else:
                                    print(f"Duplicate track detected: {track_info}")
                            else:
                                print(f"Track already seen: {track_info}")

            except Exception as e:
                print(f"Error at {current_minute}:{current_second:02d}: {str(e)}")

            start_seconds += segment_duration - overlap_duration

        print("\nTrack recognition complete")
        return track_list

    def process_audio_file(self, file_path):
        """Process a single audio file."""
        if file_path in self.processed_files:
            return

        print(f"\n=== Processing recording ===")
        print(f"File: {os.path.basename(file_path)}")

        try:
            track_list = self.recognize_tracks(file_path)
            output_path = os.path.splitext(file_path)[0] + ".txt"
            self.save_tracklist(track_list, output_path)
            self.processed_files.add(file_path)

            # Remove Unicode characters that cause problems in Windows CMD
            print(f"[SUCCESS] Processing complete")
            print(f"[SUCCESS] Found {len(track_list)} tracks")
            print(f"[SUCCESS] Tracklist saved to: {os.path.basename(output_path)}\n")

        except Exception as e:
            # Remove Unicode characters that cause problems in Windows CMD
            print(f"[ERROR] Error processing {os.path.basename(file_path)}: {str(e)}\n")

    def save_tracklist(self, track_list, output_path):
        """Save tracklist with simple track information only."""
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                for track in track_list:
                    f.write(f"{track}\n")
        except Exception as e:
            raise ValueError(f"Error saving tracklist: {str(e)}")


def main():
    """Main function to run the script."""
    # Check if a file path was provided as a command line argument
    if len(sys.argv) > 1:
        # Process a specific file
        file_path = sys.argv[1]
        if os.path.exists(file_path) and file_path.lower().endswith(".wav"):
            processor = AudioProcessor()
            processor.process_audio_file(file_path)
        else:
            print(f"Error: File not found or not a WAV file: {file_path}")
    else:
        # Original directory scanning behavior
        scan_directory()


def scan_directory():
    """Scan directory for WAV files without text files."""
    processor = AudioProcessor()

    print("\n=== Scanning for WAV files without track listings ===")
    for root, dirs, files in os.walk(ARCHIVE_PATH):
        for file in files:
            if file.lower().endswith(".wav"):
                audio_path = os.path.join(root, file)
                txt_path = os.path.splitext(audio_path)[0] + ".txt"

                if not os.path.exists(txt_path):
                    print(f"\nFound file to process: {os.path.basename(audio_path)}")
                    processor.process_audio_file(audio_path)

    print("\n=== Scan complete ===")


if __name__ == "__main__":
    main()
