from fastapi import Request
from datetime import datetime
import inspect
import os

SYSLOGS_FILE_PATH = "./data/sys.log"
ACCESSLOGS_FILE_PATH = "./data/access.log"

def get_time():
    """ Get current time and format it into: 31/12/2000 18:30:20 """
    return datetime.now().strftime("%d/%m/%Y %H:%M:%S")


class SysLogger:
    def _grab_caller_info():
        caller_frame = inspect.stack()[3]
        filename = os.path.basename(caller_frame.filename).removesuffix(".py")
        function = caller_frame.function
        lineno = caller_frame.lineno
        if function == "<module>":
            function = "@"

        return f"{filename}.{function}#{lineno}"

    def _log(level: str, message: str):
        caller_info = SysLogger._grab_caller_info()
        content = f"[{get_time()}] <{level}> {caller_info} -> {message}\n"
        with open(SYSLOGS_FILE_PATH, "a") as file:
            file.write(content)

    def error(message: str): SysLogger._log("error", message)
    def warn(message: str): SysLogger._log("warn", message)
    def info(message: str): SysLogger._log("info", message)
    def fail(message: str): SysLogger._log("fail", message)
    def success(message: str): SysLogger._log("success", message)

class AccessLogger:
    def _grab_caller_info():
        caller_frame = inspect.stack()[2]
        return caller_frame.function

    def log(request: Request, status_code: int, message: str):
        content = f"[{get_time()}] {request.client.host}:{request.client.port} {AccessLogger._grab_caller_info()} ({status_code})  {message}\n"
        with open(ACCESSLOGS_FILE_PATH, "a") as file:
            file.write(content)

