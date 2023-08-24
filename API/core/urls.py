import requests

def validate_url(url: str) -> bool:
    try:
        requests.get(url, timeout=3)
        return True
    except:
        return False

