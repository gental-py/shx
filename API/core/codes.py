from core.settings import get_settings
from core.database import get_entry
import string
import random

LEGAL_CHARS = string.ascii_lowercase+string.digits


def generate_code(length=get_settings().code_length) -> str:
    code = "".join([random.choice(LEGAL_CHARS) for _ in range(length)])
    while get_entry(code) is not None:
        code = "".join([random.choice(LEGAL_CHARS) for _ in range(length)])
    return code
        

        
