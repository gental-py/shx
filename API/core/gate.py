import bcrypt

def hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check(given: str, correct: str) -> bool:
    if not correct:
        return True
    return bcrypt.checkpw(given.encode(), correct.encode())

