import urllib.request
import json
import ssl

# Avoid SSL verification issues if any
ssl_context = ssl._create_unverified_context()

def check_url(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ssl_context) as response:
            print(f"Success: {url} -> status {response.status}")
            # Try to read a bit
            data = json.loads(response.read().decode('utf-8'))
            print(f"Data type: {type(data)}")
            if isinstance(data, list):
                print(f"List length: {len(data)}")
                print(f"First element key/preview: {str(data[0])[:200]}")
            elif isinstance(data, dict):
                print(f"Dict keys: {list(data.keys())[:10]}")
                # Print some detail
                for k in list(data.keys())[:2]:
                    print(f"Key {k}: {str(data[k])[:100]}")
            return data
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return None

print("Checking Korean Bible...")
kor_data = check_url("https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_ko.json")

print("\nChecking NIV Genesis Bible...")
# Let's try master first, then main if it fails
niv_data = check_url("https://raw.githubusercontent.com/aruljohn/Bible-niv/master/json/genesis.json")
if not niv_data:
    niv_data = check_url("https://raw.githubusercontent.com/aruljohn/Bible-niv/main/json/genesis.json")
