Vercel deployment: 
  1. Open <a href="https://wikilorean.vercel.app">wikilorean.vercel.app</a>
  2. cd preferred_directory
  3. python -m venv venv
  4. souce venv/bin/activate
  5. pip install flask requests beautifulsoup4
  6. pip install flask-cors
  (assuming you don't have both globally installed, which is a rare case. Then commands #2, #3, #4, #5, #6 are obsolete)
  7. python server.py; leave it as a background process
 
Run locally:
Download the files to preferred_directory, open it, repeat #3-7
