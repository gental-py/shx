from datetime import datetime as Datetime
from colorama import init, Fore
import webbrowser
import requests
import sys
import os


init(True)
API = "http://api-shx.ct8.pl:38896/"
WEBSITE_URL = "http://shx.ct8.pl"

def test_connection():
    try:
        requests.get("https://example.org", timeout=3)
        return
    except:
        print(f"  ⚠️ {Fore.RED}Request test failed. (Network problem)")
        sys.exit()
test_connection()


def generate_timestamp(string) -> int:
    try:
        dt = Datetime.strptime(string, "%d/%m/%Y %H:%M")
    except:
        print("  ⚠️ Invalid date format (dd/mm/YYYY HH:MM)")
        sys.exit()
    if dt is None:
        return int(Datetime.now().timestamp())
    return int(dt.timestamp())

def read_timestamp(timestamp: int) -> Datetime:
    return Datetime.fromtimestamp(timestamp)

def valid_url(url) -> bool:
    try:
        requests.get(url, timeout=3)
        return True
    except:
        return False 

def handle_base_status(status) -> str:
    if status == "blacklist":
        print("  🖤 You are on BLACKLIST.")
        print("  💥 Proceeding self destruction.")
        os.remove(__file__)
        sys.exit()
    elif status == "not_found":
        print(f"  ⚠️ {Fore.RED}Not found.")
        sys.exit()
    elif status == "code_expired":
        print(f"  ⚠️ {Fore.RED}Code expired.")
        sys.exit()
    elif status == "use_limit_reached":
        print(f"  ⚠️ {Fore.RED}Use limit reached.")
        sys.exit()
    elif status == "invalid_data":
        print(f"  ⚠️ {Fore.RED}Invalid data.")
        sys.exit()
    elif status == "already_taken":
        print(f"  ⚠️ {Fore.RED}Already taken.")
        sys.exit()
    elif status == "invalid_url":
        print(f"  ⚠️ {Fore.RED}Invalid URL.")
        sys.exit()
    else:
        return status

def get_code() -> str:
    code = input("\n  Code #: ")
    while len(code) < 3 or not code.isalnum():
        print(f"  ⚠️ {Fore.RED}Code must be at least 3 chars long and alphanumeric.")
        code = input("  Code #: ")
    return code


def redirect():
    def _gate():
        print(f"\n  🔐 {Fore.BLUE}This URL is secured by password")
        while True:
            password = input("  Password: ")

            payload = dict(code=code, password=password)
            result = requests.post(API+"gate/", json=payload).json()
            status = handle_base_status(result.get("status"))
            print(result)
            if status == "invalid_password":
                print("  ❗ Invalid password.")
                continue

            if status == "redirect":
                print(f"  ✅ {Fore.GREEN}Redirecting to: {result.get('redirect')}")
                webbrowser.open_new(result.get('redirect'))

    code = get_code()
    result = requests.get(API+f"redirect/{code}").json()
    status = handle_base_status(result.get("status"))

    if status == "redirect":
        print(f"  ✅ {Fore.GREEN}Redirecting to: {result.get('redirect')}")
        webbrowser.open_new(result.get('redirect'))

    if status == "gate_redirect":
        _gate()

def create():
    url = input("  URL: ")
    if not valid_url(url):
        print(f"  ⚠️ {Fore.RED}Invalid URL.")
        sys.exit()

    print(f"  {Fore.LIGHTBLACK_EX}(next prompts are optional. You can leave them blank)")

    code = input("  Custom code: ")
    if code and len(code) < 3 or code and not code.isalnum():
        print(f"  ⚠️ {Fore.RED}Code must be at least 3 chars long and alphanumeric.")
        sys.exit()

    password = input("  Password: ")
    use_limit = input("  Use limit: ")
    if use_limit and not use_limit.isnumeric():
        print(f"  ⚠️ {Fore.RED}Invalid use limit.")
        sys.exit()
    use_limit = int(use_limit) if use_limit else 0

    exp_date = input("  Expiration date (dd/mm/YYYY HH:MM): ")
    if exp_date:
        exp_date = generate_timestamp(exp_date)

    payload = dict(code=code, target_url=url, password=password, use_limit=use_limit, expiration_date=exp_date)
    result = requests.post(API+"create/", json=payload).json()
    status = handle_base_status(result.get("status"))
    if status == "created":
        print(f"\n  ✅ {Fore.GREEN}Created.")
        print(f"  Code: {Fore.BLUE}{result.get('value')}")
        print(f"  URL: {Fore.BLUE}{WEBSITE_URL}#{result.get('value')}")

def check():
    code = get_code()
    result = requests.get(API+f"checkCode/{code}").json()
    status = handle_base_status(result.get("status"))
    if status == "ok":
        entry_data = result.get("entry")
        print(f"  Password:  {Fore.BLUE}{entry_data['password']}")
        print(f"  URL:  {Fore.BLUE}{entry_data['target_url']}...")
        print(f"  Used:  {Fore.BLUE}{entry_data['times_used']}")
        print(f"  Use limit:  {Fore.BLUE}{entry_data['use_limit']}")
        print(f"  Expires:  {Fore.BLUE}{entry_data['expiration_date']}")
        print(f"  Created:  {Fore.BLUE}{entry_data['created_date']}")

def report():
    code = get_code()
    msg = input("\n  Message: ")
    email = input("\n  Contact email: ")

    payload = dict(code=code, message=msg, email=email)
    result = requests.post(API+"report/", json=payload).json()
    
    status = handle_base_status(result.get("status"))
    if status == "ok":
        print(f"  ✅ {Fore.GREEN}Report sent.")

def web():
    try:
        webbrowser.open_new(WEBSITE_URL)
        print(f"  🛜 {Fore.GREEN}shX website has been opened.")
    except webbrowser.Error:
        print(f"  ⚠️ {Fore.RED}Cannot open shX website.")


def main():
    args = sys.argv
    if len(args) == 1:
        print("  ⚠️ No command specified (go, create, check, report, web).")
        sys.exit()

    name_fn = {
        "go": redirect,
        "create": create,
        "check": check,
        "report": report,
        "web": web
    }

    command = args[1].lower()
    if command not in name_fn:
        print(f"  ⚠️ Invalid command: {command} (go, create, check, report, web).")
        sys.exit()
    name_fn.get(command)()

if __name__ == "__main__":
    main()
