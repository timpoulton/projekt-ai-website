import http.client
import mimetypes
import os
from datetime import datetime
import json
from base64 import b64encode

# Credentials
OAUTH_TOKEN = "2-274121-85658-y9KQYyZ6qG9oT2uvPq"

# File details
FILE_PATH = r"C:\ARCHIVE API FILES\TESTRER-05-12-24_14-49\TESTRER-05-12-24_14-49.mp4"
TITLE = "TESTRER-05-12-24_14-49"

def upload_chunk(conn, chunk, chunk_number, total_chunks):
    print(f"\nStarting chunk {chunk_number + 1}/{total_chunks}")
    
    boundary = 'soundcloud_upload_boundary'
    
    # Create the multipart form data exactly like the curl command
    body = bytearray()
    
    # Add title
    body.extend(f'--{boundary}\r\n'.encode())
    body.extend(b'Content-Disposition: form-data; name="track[title]"\r\n\r\n')
    body.extend(TITLE.encode())
    body.extend(b'\r\n')
    
    # Add file data
    body.extend(f'--{boundary}\r\n'.encode())
    body.extend(f'Content-Disposition: form-data; name="track[asset_data]"; filename="{TITLE}.mp4"\r\n'.encode())
    body.extend(b'Content-Type: video/mp4\r\n\r\n')
    body.extend(chunk)
    body.extend(f'\r\n--{boundary}--\r\n'.encode())

    # Headers exactly matching the curl command
    headers = {
        'Accept': 'application/json; charset=utf-8',
        'Authorization': f'OAuth {OAUTH_TOKEN}',
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Content-Length': str(len(body))
    }

    try:
        # Using the exact endpoint from curl command
        url = '/tracks'
        print(f"Making request for chunk {chunk_number + 1}")
        conn.request('POST', url, body, headers)
        print(f"Getting response for chunk {chunk_number + 1}")
        response = conn.getresponse()
        print(f"Response status: {response.status}")
        response_data = response.read().decode()
        print(f"Response data: {response_data[:200]}...")
        return response_data
    except Exception as e:
        print(f"Error in chunk upload: {str(e)}")
        raise

def upload_to_soundcloud():
    if not os.path.exists(FILE_PATH):
        print(f"Error: File not found at {FILE_PATH}")
        return

    file_size = os.path.getsize(FILE_PATH)
    print(f"File size: {file_size / (1024*1024):.2f} MB")

    # Using 5MB chunks
    CHUNK_SIZE = 5 * 1024 * 1024
    total_chunks = (file_size + CHUNK_SIZE - 1) // CHUNK_SIZE

    print(f"Starting upload at {datetime.now()}")
    print(f"Total chunks: {total_chunks}")

    try:
        print("Establishing connection...")
        conn = http.client.HTTPSConnection('api.soundcloud.com', timeout=300)
        
        with open(FILE_PATH, 'rb') as file:
            for chunk_number in range(total_chunks):
                chunk = file.read(CHUNK_SIZE)
                
                try:
                    response_text = upload_chunk(conn, chunk, chunk_number, total_chunks)
                    if response_text:
                        try:
                            response_data = json.loads(response_text)
                            print(f"Successfully processed chunk {chunk_number + 1}")
                        except json.JSONDecodeError:
                            print(f"Warning: Could not parse response as JSON for chunk {chunk_number + 1}")
                            print(f"Response text: {response_text[:200]}")
                            
                except Exception as e:
                    print(f"Error uploading chunk {chunk_number + 1}: {str(e)}")
                    print(f"Error type: {type(e)}")
                    return None

    except Exception as e:
        print(f"Error during upload process: {str(e)}")
        print(f"Error type: {type(e)}")
        return None
    finally:
        print("Closing connection...")
        conn.close()

if __name__ == "__main__":
    print("Starting Soundcloud upload script...")
    result = upload_to_soundcloud()
    
    if result:
        print("Upload completed successfully!")
    else:
        print("Upload failed. Check the error messages above.")