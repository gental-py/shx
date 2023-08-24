from dataclasses import dataclass
import json
import os

SETTINGS_FILE_PATH = "./data/settings.json"


@dataclass
class Settings:
    code_length: int
    blacklist_ips: list
    whitelist_ips: list


def get_settings() -> Settings:
    with open(SETTINGS_FILE_PATH) as file:
        return Settings(*json.load(file).values())



