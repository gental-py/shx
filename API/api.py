from core.models import CreatePointModel, ReportPointModel, EntryModel, PassGateModel
from core.settings import get_settings
from core.responses import Responses
from core.codes import generate_code
from core.reports import add_report
from core.urls import validate_url
from core.logs import AccessLogger
import core.moment as Moment
import core.database as DB 
import core.gate as Gate

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request
from urllib.parse import urlparse
from dataclasses import asdict

api = FastAPI()
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def is_blacklisted(request: Request):
    return request.client.host in get_settings().blacklist_ips

def is_code_usable(code: str, model: DB.EntryModel, request: Request) -> JSONResponse:
    if is_blacklisted(request):
        AccessLogger.log(request, 403, "blacklisted client blocked")
        return Responses.BLACKLIST
    
    if model is None:
        AccessLogger.log(request, 404, f"code <{code}> not found")
        return Responses.NOT_FOUND
    
    if model.use_limit != 0 and model.times_used >= model.use_limit:
        AccessLogger.log(request, 410, f"code <{model.code}> usage limit reached")
        return Responses.USE_LIMIT_REACHED

    if model.expiration_date != 0 and Moment.Datetime.now() > Moment.read_timestamp(model.expiration_date):
        AccessLogger.log(request, 410, f"code <{model.code}> has expired")
        return Responses.CODE_EXPIRED

    return True

@api.get("/redirect/{code}")
def get_redirect_url(code: str, request: Request):
    model = DB.get_entry(code)
    pre_check_result = is_code_usable(code, model, request)
    if pre_check_result != True:
        return pre_check_result 
    
    if model.password:
        AccessLogger.log(request, 307, f"redirecting user to gate: /gate/<{code}>")
        return Responses.GATE_REDIRECT

    model.times_used += 1
    DB.update_entry(model.code, model)

    AccessLogger.log(request, 200, f"passing redirect url with code: <{code}>")
    return Responses.REDIRECT(model.target_url)

@api.get("/checkCode/{code}")
def get_entry_data(code: str, request: Request):
    if is_blacklisted(request):
        AccessLogger.log(request, 403, "blacklisted client blocked")
        return Responses.BLACKLIST
    
    model = DB.get_entry(code)
    if model is None:
        AccessLogger.log(request, 404, f"code <{code}> not found")
        return Responses.NOT_FOUND

    uri = urlparse(model.target_url)
    result = f'{uri.scheme}://{uri.netloc}/'
    model.target_url = result
    model.password = True if model.password else False
    model.expiration_date = str(Moment.read_timestamp(model.expiration_date)) if model.expiration_date else "-"
    model.created_date = str(Moment.read_timestamp(model.created_date))

    AccessLogger.log(request, 200, f"passing entry with code: <{code}>")
    return Responses.ENTRY(asdict(model))

@api.post("/gate")
def pass_gate(data: PassGateModel, request: Request):
    model = DB.get_entry(data.code)
    pre_check_result = is_code_usable(data.code, model, request)
    if pre_check_result != True:
        return pre_check_result
    
    if Gate.check(data.password, model.password):
        model.times_used += 1
        DB.update_entry(model.code, model)
        return Responses.REDIRECT(model.target_url)
    
    return Responses.INVALID_PASSWORD

@api.post("/create")
def create_shrinked_url(data: CreatePointModel, request: Request):
    if is_blacklisted(request):
        AccessLogger.log(request, 403, "blacklisted client blocked")
        return Responses.BLACKLIST
    
    if not data.code:
        data.code = generate_code()

    if len(data.code) > 16:
        AccessLogger.log(request, 400, f"code {data.code} is too long")
        return Responses.INVALID_DATA

    if DB.get_entry(data.code) is not None:
        AccessLogger.log(request, 306, f"code {data.code} already taken")
        return Responses.ALREADY_TAKEN
    
    if not data.code.isalnum():
        AccessLogger.log(request, 400, f"code {data.code} is not alnum")
        return Responses.INVALID_DATA
    
    if data.expiration_date != 0:
        if Moment.read_timestamp(data.expiration_date) < Moment.Datetime.now():
            AccessLogger.log(request, 400, "expiration date already passed")
            return Responses.INVALID_DATA
        
    if data.use_limit < 0:
        data.use_limit = 0

    if not validate_url(data.target_url):
        AccessLogger.log(request, 400, f"invalid target_url: {data.target_url}")
        return Responses.INVALID_URL

    if data.password:
        data.password = Gate.hash(data.password)

    entry = EntryModel(
        code = data.code,
        password = data.password,
        target_url = data.target_url,
        use_limit = data.use_limit,
        expiration_date = data.expiration_date,
        times_used = 0,
        created_date = Moment.generate_timestamp(),
    )
    DB.add_entry(entry)

    AccessLogger.log(request, 201, f"created shorted url: {data.code}")
    return Responses.CREATED(data.code)

@api.post("/report")
def report_code(data: ReportPointModel, request: Request):
    if is_blacklisted(request):
        AccessLogger.log(request, 403, "blacklisted client blocked")
        return Responses.BLACKLIST
    
    if DB.get_entry(data.code) is None:
        AccessLogger.log(request, 404, f"code {data.code} not found")
        return Responses.NOT_FOUND
    
    add_report(data.code, data.message, data.email, request)
    AccessLogger.log(request, 201, f"added report for {data.code}")
    return Responses.OK
