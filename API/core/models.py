from dataclasses import dataclass
from pydantic import BaseModel

@dataclass()
class EntryModel:
    code: str
    password: str
    target_url: str
    use_limit: int
    expiration_date: int
    times_used: int
    created_date: int


class PassGateModel(BaseModel):
    code: str
    password: str


class CreatePointModel(BaseModel):
    code: str
    target_url: str
    password: str
    use_limit: int
    expiration_date: int


class ReportPointModel(BaseModel):
    code: str
    message: str
    email: str = ""

