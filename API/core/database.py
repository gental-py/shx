from core.logs import SysLogger
from core.models import EntryModel

from dataclasses import asdict
import json
import os

DB_PATH = "./data/db/"


def _load_json(path: str) -> dict:
    with open(path) as file:
        return json.load(file)
    
def _dump_json(path: str, content: dict) -> None:
    if not os.path.exists(path):
        SysLogger.info(f"created entry file: {path}")
        open(path, "a+").close()

    with open(path, "w") as file:
        json.dump(content, file, indent=2, separators=(',',': '), ensure_ascii=True)


def get_all_entries() -> list[EntryModel]:
    return [
        EntryModel(file.removesuffix(".json"), *_load_json(DB_PATH+file).values()) 
        for file in os.listdir(DB_PATH) 
        if file.endswith(".json")
    ]

def add_entry(entry: EntryModel):
    _dump_json(DB_PATH+f"{entry.code}.json", asdict(entry))
    SysLogger.success(f"added entry: {entry.code} ({asdict(entry)})")

def get_entry(code: str) -> EntryModel:
    path = DB_PATH+f"{code}.json"
    if not os.path.exists(path):
        return None
    return EntryModel(*_load_json(path).values())

def remove_entry(code: str):
    if get_entry(code) is None:
        SysLogger.fail(f"failed to remove entry: {code} (not exists)")
        return
    os.remove(DB_PATH+f"{code}.json")

def update_entry(code: str, entry: EntryModel):
    if get_entry(code) is None:
        SysLogger.fail(f"failed to update entry: {code} (not exists)")
        return
    _dump_json(DB_PATH+f"{code}.json", asdict(entry))