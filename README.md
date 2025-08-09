Run locally:

    cd directory to which files were downloaded
    python -m venv venv
    souce venv/bin/activate
    pip install flask requests beautifulsoup4
    pip install flask-cors (assuming you don't have both globally installed, which is a rare case. Then, commands #2, #3, #4, #5 are obsolete)
    python server.py
    Leave command #6 as a background process, then run index.html
