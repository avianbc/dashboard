#!/usr/bin/env python3
"""
Simple HTTP server for viewing the strength training dashboard.
Starts a local web server and opens the dashboard in your browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 8000

def main():
    # Change to the script's directory
    os.chdir(Path(__file__).parent)

    # Check if training_data.json exists
    if not os.path.exists('training_data.json'):
        print("Error: training_data.json not found.")
        print("Please run: python extract_data.py")
        sys.exit(1)

    # Create a simple HTTP server
    Handler = http.server.SimpleHTTPRequestHandler

    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            url = f"http://localhost:{PORT}/dashboard.html"
            print(f"Starting server at {url}")
            print("Press Ctrl+C to stop the server")

            # Open browser
            webbrowser.open(url)

            # Serve forever
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"Error: Port {PORT} is already in use.")
            print(f"Try opening http://localhost:{PORT}/dashboard.html in your browser,")
            print(f"or kill the process using port {PORT}.")
        else:
            print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
