#!/usr/bin/env python3
"""
Embed training_data.json into dashboard.html to avoid CORS issues
when opening the file directly in a browser (file:// protocol).
"""

import json
import sys

def main():
    # Read the JSON data
    try:
        with open('training_data.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: training_data.json not found.")
        print("Please run extract_data.py first.")
        sys.exit(1)

    # Read the dashboard HTML
    try:
        with open('dashboard.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print("Error: dashboard.html not found.")
        sys.exit(1)

    # Create the embedded data script tag
    data_json = json.dumps(data)
    data_script = f'<script type="application/json" id="trainingDataScript">\n{data_json}\n</script>\n'

    # Insert the data script before the closing </body> tag
    # Find the position of the main script tag
    script_pos = html_content.find('<script>')
    if script_pos == -1:
        print("Error: Could not find <script> tag in dashboard.html")
        sys.exit(1)

    # Insert the data script before the main script
    modified_html = html_content[:script_pos] + data_script + html_content[script_pos:]

    # Write the embedded version
    output_file = 'dashboard_embedded.html'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(modified_html)

    print(f"Successfully created {output_file}")
    print(f"This version has the data embedded and can be opened directly in your browser.")
    print(f"\nTo view: double-click {output_file} or run 'start {output_file}'")

if __name__ == '__main__':
    main()
