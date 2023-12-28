# shX - API

<img title="" src="https://raw.githubusercontent.com/gental-py/shx/master/WEB/assets/logo.png" alt="https://github.com/gental-py/shx/blob/fe3e321b6d38efc93856f64f50becf04a2da2668/WEB/assets/logo.png" width="396" data-align="center">

Current API host: `http://api-shx.ct8.pl:38896/`



## 🖥️ Host locally.

Requirements: `python3`, `pip`, `downloaded shx`

1. Download required python packages:
   
   ```bash
   cd API
   pip install -r requirements.txt
   ```

2. Run UVICORN server:
   
   ```bash
   python3 -m uvicorn api:api --host 127.0.0.1 --port 8000
   (--host, --port are optional)
   ```



## 🔙 Response models.

Base JSON response model: 

```json
{
    "status": "string"
}
```

**Responses** matching base model (status_code, status):

- `200`/`ok` - Everything is OK.

- `403`/`blacklist` - User is blacklisted

- `404`/`not_found` - Code not found

- `410`/`use_limit_reached` - Code's usage limit reached

- `410`/`code_expired` - Code has expired

- `401`/`invalid_password` - Invalid password

- `422`/`invalid_data` - Invalid data provided to API endpoint

- `422`/`invalid_url` - Invalid URL provided

- `306`/`already_taken` - This code is already taken
  
  

**Responses** with extended base model (status_code, status, data):

- `201`/`created` - Code has been created:
  
  ```json
  {
      "status": "created",
      "value": "shrink url"
  }
  ```

- `200`/`redirect` - Redirect user to target URL:
  
  ```json
  {
      "status": "redirect",
      "redirect": "target url"
  }
  ```

- `200`/`ok` - Sent by `checkCode` endpoint:
  
  ```json
  {
      "status": "ok",
      "entry": {
          "code": "shx code",
          "created_date": "yyyy-mm-dd hh:mm:ss",
          "passowrd": true/false,
          "target_url": "https://www.youtube.com/ only first part"
          "times_used": 0,
          "use_limit": 10/"∞"
      }
  }
  ```

## 🎯 Endpoints.

#### GET `/redirect/{code:str}`

Possible responses: `blacklist`, `not_found`, `use_limit_reached`, `code_expired`, `gate_redirect`, `redirect`

#### GET `/checkCode/{code:str}`

Possible responses: `blacklist`, `not_found`, `ok` (entry)

#### POST `/gate`

Possible responses: `blacklist`, `not_found`, `use_limit_reached`, `code_expired`, `invalid_password`, `redirect`

Body data model:

```json
{
    "code": "str",
    "password": "str"
}
```

#### POST `/create`

Possible responses: `blacklist`, `invalid_data`, `already_taken`, `invalid_url`, `created`

Body data model:

```json
{
    "code": "str?",
    "target_url": "str",
    "password": "str?",
    "use_limit": 0,
    "expiration_date": 0,
}
```

Model requirements:

`code` length: <3, 16>, alpha-numeric, not taken

`expiration_date` 0 if not set, moment must not have passed

`target_url` valid URL (GET request is being send to verify) 

#### POST `/report`

Possible responses: `blacklist`, `not_found`, `ok`

Body data model:

```json
{
    "code": "str",
    "message": "str",
    "email": "str?",
}
```