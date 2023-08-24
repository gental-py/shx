from datetime import datetime as Datetime

def generate_timestamp(dt: Datetime = None) -> int:
    if dt is None:
        return int(Datetime.now().timestamp())
    return int(dt.timestamp())

def read_timestamp(timestamp: int) -> Datetime:
    return Datetime.fromtimestamp(timestamp)
