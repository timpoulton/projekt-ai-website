import os
from track_watcher import AudioProcessor

def main():
    # Test specific file
    test_file = r"C:\ARCHIVE API FILES\DPM-07-09-24_23-00\DPM 07.09.24.mp3"
    
    # Process file
    if os.path.exists(test_file):
        try:
            processor = AudioProcessor()
            print(f"\n=== Processing test file ===")
            print(f"File: {os.path.basename(test_file)}")
            processor.process_audio_file(test_file)
        except Exception as e:
            print(f"❌ Error processing file: {str(e)}")
            import traceback
            print(traceback.format_exc())
    else:
        print(f"❌ Test file not found: {test_file}")

if __name__ == "__main__":
    main()