#!/usr/bin/env python3

import http.server
import socketserver
import json
import os
from urllib.parse import parse_qs

class JSONUploadHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/upload':
            try:
                # Read the request body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Parse JSON data
                data = json.loads(post_data.decode('utf-8'))
                
                filename = data.get('filename', 'proposal.html')
                content = data.get('content', '')
                directory = data.get('directory', '.')
                
                # Ensure directory exists
                full_dir = os.path.join('.', directory)
                os.makedirs(full_dir, exist_ok=True)
                
                # Write the file
                filepath = os.path.join(full_dir, filename)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response_data = {
                    "success": True,
                    "message": "File uploaded successfully",
                    "filename": filename,
                    "path": filepath
                }
                
                self.wfile.write(json.dumps(response_data).encode())
                print(f"✅ Uploaded: {filepath}")
                
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps({"success": False, "error": str(e)})
                self.wfile.write(response.encode())
                print(f"❌ Upload failed: {e}")
        else:
            super().do_POST()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

PORT = 8087
print(f"🌐 JSON Upload Server starting on port {PORT}")
print(f"📝 POST JSON to http://localhost:{PORT}/upload")
print(f"📁 Proposals will be saved to ./proposals/")

# Kill the existing process and restart
os.system("pkill -f upload-background.py")

with socketserver.TCPServer(("", PORT), JSONUploadHandler) as httpd:
    print(f"✅ JSON upload server ready!")
    httpd.serve_forever() 