import core.moment as Moment
from fastapi import Request

SEPARATOR = "\n\n" + "=" * 15 + "\n\n"
FILE_PATH = "./data/reports.txt"

def add_report(code: str, message: str, email: str, request: Request):
    content = SEPARATOR + f"code: {code}\nemail: {email}\nhost: {request.client.host}:{request.client.port}\nat: {Moment.Datetime.now()}\nmessage: {message}"
    with open(FILE_PATH, "a+") as file:
        file.write(content)
