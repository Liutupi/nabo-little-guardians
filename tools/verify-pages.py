"""Verify a deployed Pages artifact over HTTPS without a browser session."""
import argparse
import concurrent.futures
import hashlib
from pathlib import Path
import time
import urllib.parse
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--url', required=True)
parser.add_argument('--source', default='dist')
args = parser.parse_args()
if not args.url.startswith('https://'):
    parser.error('A public HTTPS deployment URL is required')
source = Path(args.source)
files = sorted(p for p in source.rglob('*') if p.is_file() and not p.name.startswith('._'))

def verify(path):
    relative = path.relative_to(source).as_posix()
    expected = hashlib.sha256(path.read_bytes()).hexdigest()
    url = urllib.parse.urljoin(args.url.rstrip('/') + '/', urllib.parse.quote(relative))
    # A content-derived cache key avoids accepting a stale artifact during rollout.
    url += '?verify=' + expected[:16]
    last = None
    for attempt in range(6):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'NABO-Pages-Release-Check'})
            with urllib.request.urlopen(request, timeout=15) as response:
                actual = hashlib.sha256(response.read()).hexdigest()
            if actual == expected:
                return relative
            last = 'content hash differs'
        except Exception as error:
            last = str(error)
        if attempt < 5:
            time.sleep(min(2 ** attempt, 12))
    raise RuntimeError(f'{relative}: {last}')

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    verified = list(pool.map(verify, files))
print(f'HTTPS verification passed: {len(verified)} deployed files match this commit.')
