#!/usr/bin/env python3

import http.server
import socketserver
import cgi
import os
import shutil
from urllib.parse import urlparse
import mimetypes
import json

class UniversalUploadHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/upload-file':
            try:
                # Parse the form data
                form = cgi.FieldStorage(
                    fp=self.rfile,
                    headers=self.headers,
                    environ={'REQUEST_METHOD': 'POST'}
                )
                
                # Get the uploaded file
                fileitem = form['file']
                
                if fileitem.filename:
                    original_filename = fileitem.filename
                    file_extension = os.path.splitext(original_filename)[1].lower()
                    
                    # Determine file category and target directory
                    file_category = self.get_file_category(file_extension)
                    target_dir = self.get_target_directory(file_category)
                    
                    # Ensure directory exists
                    os.makedirs(target_dir, exist_ok=True)
                    
                    # Generate safe filename
                    safe_filename = self.generate_safe_filename(original_filename, target_dir)
                    filepath = os.path.join(target_dir, safe_filename)
                    
                    # Write the file
                    with open(filepath, 'wb') as f:
                        f.write(fileitem.file.read())
                    
                    # Get file size
                    file_size = os.path.getsize(filepath)
                    
                    # Send success response
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    response_data = {
                        "success": True, 
                        "message": f"File uploaded successfully",
                        "filename": safe_filename,
                        "category": file_category,
                        "size": file_size,
                        "path": filepath
                    }
                    
                    self.wfile.write(json.dumps(response_data).encode())
                    
                    print(f"✅ {file_category.title()} uploaded: {filepath} ({self.format_file_size(file_size)})")
                else:
                    raise Exception("No file uploaded")
                    
            except Exception as e:
                # Send error response
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = f'{{"success": false, "error": "{str(e)}"}}'.encode()
                self.wfile.write(response)
                print(f"❌ Upload failed: {e}")
        else:
            super().do_POST()

    def get_file_category(self, extension):
        """Categorize file by extension"""
        categories = {
            'images': ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico', '.tiff'],
            'videos': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'],
            'audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
            'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.pages'],
            'presentations': ['.ppt', '.pptx', '.key', '.odp'],
            'spreadsheets': ['.xls', '.xlsx', '.csv', '.numbers', '.ods'],
            'code': ['.html', '.css', '.js', '.php', '.py', '.java', '.cpp', '.c', '.rb', '.go', '.rs'],
            'data': ['.json', '.xml', '.yaml', '.yml', '.sql', '.db'],
            'archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
            'fonts': ['.ttf', '.otf', '.woff', '.woff2', '.eot'],
            'design': ['.psd', '.ai', '.sketch', '.fig', '.xd', '.indd']
        }
        
        for category, extensions in categories.items():
            if extension in extensions:
                return category
        return 'other'

    def get_target_directory(self, category):
        """Get target directory based on file category"""
        base_dirs = {
            'images': 'assets/img/uploads',
            'videos': 'assets/videos',
            'audio': 'assets/audio',
            'documents': 'assets/documents',
            'presentations': 'assets/documents/presentations',
            'spreadsheets': 'assets/documents/spreadsheets',
            'code': 'assets/code',
            'data': 'assets/data',
            'archives': 'assets/archives',
            'fonts': 'assets/fonts',
            'design': 'assets/design',
            'other': 'assets/uploads/other'
        }
        return base_dirs.get(category, 'assets/uploads')

    def generate_safe_filename(self, original_filename, target_dir):
        """Generate a safe, unique filename"""
        # Remove unsafe characters
        safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_"
        base_name = os.path.splitext(original_filename)[0]
        extension = os.path.splitext(original_filename)[1]
        
        # Clean the base name
        safe_base = ''.join(c if c in safe_chars else '_' for c in base_name)
        safe_filename = safe_base + extension
        
        # Handle duplicates
        counter = 1
        final_filename = safe_filename
        while os.path.exists(os.path.join(target_dir, final_filename)):
            name_part = safe_base + f"_{counter}"
            final_filename = name_part + extension
            counter += 1
            
        return final_filename

    def format_file_size(self, bytes):
        """Format file size in human readable format"""
        if bytes == 0:
            return "0 B"
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while bytes >= 1024 and i < len(size_names) - 1:
            bytes /= 1024.0
            i += 1
        return f"{bytes:.1f} {size_names[i]}"

PORT = 8087
print(f"🌐 Projekt AI Upload System starting on port {PORT}")
print(f"📁 Upload interface: http://192.168.1.107:{PORT}/upload.html")
print(f"🎨 Main website: http://192.168.1.107:8086/index-extramedium-exact-v2.html")
print(f"📂 Files will be organized into:")
print(f"   • Images → assets/img/uploads/")
print(f"   • Videos → assets/videos/")
print(f"   • Documents → assets/documents/")
print(f"   • Code → assets/code/")
print(f"   • Archives → assets/archives/")
print(f"   • Other → assets/uploads/other/")

with socketserver.TCPServer(("", PORT), UniversalUploadHandler) as httpd:
    print(f"✅ Upload system ready - accepts all file types!")
    httpd.serve_forever() 