from fastapi.responses import JSONResponse


class Responses:
    OK = JSONResponse({"status": "ok"}, 200)
    BLACKLIST = JSONResponse({"status": "blacklist"}, 403)
    CODE_EXPIRED = JSONResponse({"status": "code_expired"}, 410) 
    USE_LIMIT_REACHED = JSONResponse({"status": "use_limit_reached"}, 410)
    NOT_FOUND = JSONResponse({"status": "not_found"}, 404)
    INVALID_PASSWORD = JSONResponse({"status": "invalid_password"}, 401)
    INVALID_DATA = JSONResponse({"status": "invalid_data"}, 422)
    ALREADY_TAKEN = JSONResponse({"status": "already_taken"}, 306)
    INVALID_URL = JSONResponse({"status": "invalid_url"}, 422)
    GATE_REDIRECT = JSONResponse({"status": "gate_redirect"}, 307)
    def CREATED(value: str): return JSONResponse({"status": "created", "value": value}, 201)
    def REDIRECT(target: str): return JSONResponse({"status": "redirect", "redirect": target}, 200)
    def ENTRY(entry: dict): return JSONResponse({"status": "ok", "entry": entry}, 200)
