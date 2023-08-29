<<<<<<< HEAD
const API = "http://api-shx.ct8.pl:38896/"
const API_REDIRECT = API + "redirect/"
const API_CHECKCODE = API + "checkCode/"
const API_GATE = API + "gate/"
const API_CREATE = API + "create/"
const API_REPORT = API + "report/"
const SHX_URL = "shx.ct8.pl"


// UTILS

function toTimestamp(strDate) {
  var datum = Date.parse(strDate);
  return datum / 1000;
}

function on_switch_flip(switch_id, group_id) {
  if (document.getElementById(switch_id).checked === true) {
    document.getElementById(group_id).style.display = "block"
  } else {
    document.getElementById(group_id).style.display = "none"
  }
}

function check_visit_context() {
  var hash = window.location.hash.substr(1)
  if (hash=="") {
    console.log("Visit context: normal")
    return
  }

  console.log("Visit context: redirect")
  url = API_REDIRECT + hash
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  fetch(url, options)
    .then(response => response.json())
    .then(result => {
      console.log('CTX CHECK GET: success', result);
      switch (result.status) {
        case "blacklist":
          openBlacklist()
          break
        case "not_found":
          openNotFound()
          break
        case "use_limit_reached":
          openLimitReached()
          break
        case "code_expired":
          openCodeExpired()
          break
        case "redirect":
          window.open(result.redirect, "_self")
          break
        case "gate_redirect":
          window.open("gate/gate.html#"+hash, "_self")
          break
      }
    })
    .catch(error => {
      console.error('CTX CHECK GET: fail', error);
      alert("There was an error...")
    });
  
}
check_visit_context()

document.getElementById("cards").onmousemove = e => {
  for(const card of document.getElementsByClassName("card")) {
    const rect = card.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };
}

function moveto(index) {
  switch (index) {
    case 1:
      var element = document.getElementById("s-create")
      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      break
    case 2:
      var element = document.getElementById("s-check")
      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      break
    case 3:
      var element = document.getElementById("s-report")
      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      break
  }
}


// STATIC SITES

function openBlacklist() {
  window.open("static/blacklist.html", "_self")
}

function openCodeExpired() {
  window.open("static/codeExpired.html", "_self")
}

function openInvalidCode() {
  window.open("static/invalidCode.html", "_self")
}

function openLimitReached() {
  window.open("static/limitReached.html", "_self")
}

function openNotFound() {
  window.open("static/notFound.html", "_self")
}


// SHRINK URL

function sh_check_url() {
  element = document.getElementById("sh-url")
  urlString = element.value

  if (Boolean(urlString) === false) {
    element.setAttribute("state", "none")
    return false
  }

  try {
    if (Boolean(new URL(urlString)) === true) {
      element.setAttribute("state", "valid")
      return true
    }
    element.setAttribute("state", "invalid")
    return false
  }
  catch (e) {
    element.setAttribute("state", "invalid")
    return false
  }
}

function sh_check_custom_code() {
  element = document.getElementById("sh-code")
  switch_state = document.getElementById("sh-s-code").checked
  if (!switch_state) {
    return true
  }

  code = element.value

  function isAlphanumeric(inputString) {
    var alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(inputString);
  }

  if (code.length == 0) {
    element.setAttribute("state", "none")
    return false
  }
  
  if (code.length >= 3 && code.length <= 16 && isAlphanumeric(code)) {
    element.setAttribute("state", "valid")
    return true
  }

  element.setAttribute("state", "invalid")
  return false
}

function sh_check_password() {
  element = document.getElementById("sh-pwd")
  switch_state = document.getElementById("sh-s-pwd").checked
  if (!switch_state) {
    return true
  }
  password = element.value

  if (password.length == 0) {
    element.setAttribute("state", "none")
    return false
  } 

  element.setAttribute("state", "valid")
  return true
}

function sh_check_use_limit() {
  element = document.getElementById("sh-limit")
  switch_state = document.getElementById("sh-s-limit").checked
  if (!switch_state) {
    return true
  }
  limit = element.value

  if (limit == "") {
    element.setAttribute("state", "none")
    return false
  }

  limit = parseInt(limit)
  if (limit < 1) {
    element.setAttribute("state", "invalid")
    return false
  }
  element.setAttribute("state", "valid")
  return true

}

function sh_check_exp_date() {
  element = document.getElementById("sh-exp")
  switch_state = document.getElementById("sh-s-exp").checked
  if (!switch_state) {
    return true
  }
  date = element.value

  try {
    date_obj = new Date(date)
  } catch (e) {
    element.setAttribute("state", "invalid")
    return false
  }

  curr_date = new Date()
  if (date_obj < curr_date) {
    element.setAttribute("state", "invalid")
    return false
  } 

  if (isNaN(date_obj)) {
    element.setAttribute("state", "invalid")
    return false
  }
  element.setAttribute("state", "valid")
  return true
}

function sh_create() {
  function output(value) {
    document.getElementById("sh-info").innerHTML = value
  }

  if (
    sh_check_url() &
    sh_check_custom_code() &
    sh_check_password() &
    sh_check_use_limit() &
    sh_check_exp_date()
  ) {
    console.log("sending create request to: " + API_CREATE)
    
    function get_exp_date() {
      date = new Date(document.getElementById("sh-exp").value)
      if (isNaN(date)) {
        return 0
      }
      return toTimestamp(date)
    }

    function get_limit() {
      limit = parseInt(document.getElementById("sh-limit").value)
      if (isNaN(limit)) {
        limit = 0
      }
      return limit
    }

    const data = {
      code: document.getElementById("sh-code").value,
      target_url: document.getElementById("sh-url").value,
      password: document.getElementById("sh-pwd").value,
      use_limit: get_limit(),
      expiration_date: get_exp_date()
    };

    const options = {
      method: 'POST',                 
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    };


    fetch(API_CREATE, options)
      .then(response => response.json())
      .then(result => {
        console.log('POST request successful', result);
        switch (result.status) {
          case "blacklist":
            openBlacklist()
            break
          case "already_taken":
            output("This code is already taken...")
            break
          case "invalid_data":
            output("Invalid data...")
            break
          case "invalid_url":
            output("Invalid target URL. Make sure it exists.")
            break
          case "created":
            url = SHX_URL + "#" + result.value
            output("Your URL:   " + url)
            alert("Your URL:   " + url)
        }
      })
      .catch(error => {
        console.error('Error sending POST request', error);
        output("There was an error...")
      });
  
  }
}


// CHECK CODE DETAILS

function ch_check_code() {
  element = document.getElementById("ch-code")
  code = element.value

  function isAlphanumeric(inputString) {
    var alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(inputString);
  }

  if (code.length == 0) {
    element.setAttribute("state", "none")
    return false
  }

  if (code.length >= 3 && code.length <= 16 && isAlphanumeric(code)) {
    element.setAttribute("state", "valid")
    return true
  }

  element.setAttribute("state", "invalid")
  return false
}

function ch_check_details(event) {
  console.log(event)
  event.preventDefault()

  if (ch_check_code()) {
    console.log("sending check request to: " + API_CHECKCODE)
    code = document.getElementById("ch-code").value
    
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    url = API_CHECKCODE + code
    fetch(url, options)
      .then(response => response.json())
      .then(result => {
        console.log('CODE CHECK GET: success', result);
        switch (result.status) {
          case "blacklist":
            openBlacklist()
            break
          case "not_found":
            alert("Code not found.")
            document.getElementById("ch-code").value = ""
            document.getElementById("ch-code").setAttribute("state", "none")
            break
          case "ok":
            entry = result.entry
            
            if (entry.use_limit == 0) {
              entry.use_limit = "∞"
            }
            use_limit = entry.times_used + " / " + entry.use_limit            
            pwd = entry.password ? "Yes" : "No"

            document.getElementById("val-code").innerHTML = code
            document.getElementById("val-url").innerHTML = entry.target_url + "..."
            document.getElementById("val-pwd").innerHTML = pwd
            document.getElementById("val-use-limit").innerHTML = use_limit
            document.getElementById("val-exp").innerHTML = entry.expiration_date
            document.getElementById("val-created").innerHTML = entry.created_date
        }
      })
      .catch(error => {
        console.error('CODE CHECK GET: fail', error);
        alert("There was an error...")
      });
  }
}


// REPORT CODE

function rp_check_code() {
  element = document.getElementById("rp-code")
  code = element.value

  function isAlphanumeric(inputString) {
    var alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(inputString);
  }

  if (code.length == 0) {
    element.setAttribute("state", "none")
    return false
  }

  if (code.length >= 3 && code.length <= 16 && isAlphanumeric(code)) {
    element.setAttribute("state", "valid")
    return true
  }

  element.setAttribute("state", "invalid")
  return false
}

function rp_check_email() {
  element = document.getElementById("rp-mail")
  switch_state = document.getElementById("rp-s-mail").checked
  if (!switch_state) {
    return true
  }
  mail = element.value
  validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!Boolean(mail)) {
    element.setAttribute("state", "none")
    return false
  }

  if (mail.match(validRegex)) {
    element.setAttribute("state", "valid")
    return true;
  }

  element.setAttribute("state", "invalid")
  return false;
}

function rp_send() {
  function output(value) {
    document.getElementById("rp-info").innerHTML = value
  }

  if (rp_check_code() && rp_check_email()) {
    console.log("sending report request to: " + API_REPORT)

    const data = {
      code: document.getElementById("rp-code").value,
      message: document.getElementById("rp-msg").value,
      email: document.getElementById("rp-mail").value
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

    fetch(API_REPORT, options)
      .then(response => response.json())
      .then(result => {
        console.log('POST request successful', result);
        switch (result.status) {
          case "blacklist":
            openBlacklist()
            break
          case "not_found":
            alert("Code not found.")
            output("Code not found.")
            break
          case "ok":
            alert("Report sent 💪")
            output("Report sent 💪")
        }
      })
      .catch(error => {
        console.error('Error sending POST request', error);
        output("There was an error...")
      });

  }
}
=======
const API = "http://api-shx.ct8.pl:38896/"
const API_REDIRECT = API + "redirect/"
const API_CHECKCODE = API + "checkCode/"
const API_GATE = API + "gate/"
const API_CREATE = API + "create/"
const API_REPORT = API + "report/"
const SHX_URL = "shx.ct8.pl"


// UTILS

function toTimestamp(strDate) {
  var datum = Date.parse(strDate);
  return datum / 1000;
}

function on_switch_flip(switch_id, group_id) {
  if (document.getElementById(switch_id).checked === true) {
    document.getElementById(group_id).style.display = "block"
  } else {
    document.getElementById(group_id).style.display = "none"
  }
}

function check_visit_context() {
  var hash = window.location.hash.substr(1)
  if (hash=="") {
    console.log("Visit context: normal")
    return
  }

  console.log("Visit context: redirect")
  url = API_REDIRECT + hash
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  fetch(url, options)
    .then(response => response.json())
    .then(result => {
      console.log('CTX CHECK GET: success', result);
      switch (result.status) {
        case "blacklist":
          openBlacklist()
          break
        case "not_found":
          openNotFound()
          break
        case "use_limit_reached":
          openLimitReached()
          break
        case "code_expired":
          openCodeExpired()
          break
        case "redirect":
          window.open(result.redirect, "_self")
          break
        case "gate_redirect":
          window.open("gate/gate.html#"+hash, "_self")
          break
      }
    })
    .catch(error => {
      console.error('CTX CHECK GET: fail', error);
      alert("There was an error...")
    });
  
}
check_visit_context()

document.getElementById("cards").onmousemove = e => {
  for(const card of document.getElementsByClassName("card")) {
    const rect = card.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };
}

function moveto(index) {
  switch (index) {
    case 1:
      var element = document.getElementById("s-create")
      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      break
    case 2:
      var element = document.getElementById("s-check")
      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      break
    case 3:
      var element = document.getElementById("s-report")
      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      break
  }
}


// STATIC SITES

function openBlacklist() {
  window.open("static/blacklist.html", "_self")
}

function openCodeExpired() {
  window.open("static/codeExpired.html", "_self")
}

function openInvalidCode() {
  window.open("static/invalidCode.html", "_self")
}

function openLimitReached() {
  window.open("static/limitReached.html", "_self")
}

function openNotFound() {
  window.open("static/notFound.html", "_self")
}


// SHRINK URL

function sh_check_url() {
  element = document.getElementById("sh-url")
  urlString = element.value

  if (Boolean(urlString) === false) {
    element.setAttribute("state", "none")
    return false
  }

  try {
    if (Boolean(new URL(urlString)) === true) {
      element.setAttribute("state", "valid")
      return true
    }
    element.setAttribute("state", "invalid")
    return false
  }
  catch (e) {
    element.setAttribute("state", "invalid")
    return false
  }
}

function sh_check_custom_code() {
  element = document.getElementById("sh-code")
  switch_state = document.getElementById("sh-s-code").checked
  if (!switch_state) {
    return true
  }

  code = element.value

  function isAlphanumeric(inputString) {
    var alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(inputString);
  }

  if (code.length == 0) {
    element.setAttribute("state", "none")
    return false
  }
  
  if (code.length >= 3 && code.length <= 16 && isAlphanumeric(code)) {
    element.setAttribute("state", "valid")
    return true
  }

  element.setAttribute("state", "invalid")
  return false
}

function sh_check_password() {
  element = document.getElementById("sh-pwd")
  switch_state = document.getElementById("sh-s-pwd").checked
  if (!switch_state) {
    return true
  }
  password = element.value

  if (password.length == 0) {
    element.setAttribute("state", "none")
    return false
  } 

  element.setAttribute("state", "valid")
  return true
}

function sh_check_use_limit() {
  element = document.getElementById("sh-limit")
  switch_state = document.getElementById("sh-s-limit").checked
  if (!switch_state) {
    return true
  }
  limit = element.value

  if (limit == "") {
    element.setAttribute("state", "none")
    return false
  }

  limit = parseInt(limit)
  if (limit < 1) {
    element.setAttribute("state", "invalid")
    return false
  }
  element.setAttribute("state", "valid")
  return true

}

function sh_check_exp_date() {
  element = document.getElementById("sh-exp")
  switch_state = document.getElementById("sh-s-exp").checked
  if (!switch_state) {
    return true
  }
  date = element.value

  try {
    date_obj = new Date(date)
  } catch (e) {
    element.setAttribute("state", "invalid")
    return false
  }

  curr_date = new Date()
  if (date_obj < curr_date) {
    element.setAttribute("state", "invalid")
    return false
  } 

  if (isNaN(date_obj)) {
    element.setAttribute("state", "invalid")
    return false
  }
  element.setAttribute("state", "valid")
  return true
}

function sh_create() {
  function output(value) {
    document.getElementById("sh-info").innerHTML = value
  }

  if (
    sh_check_url() &
    sh_check_custom_code() &
    sh_check_password() &
    sh_check_use_limit() &
    sh_check_exp_date()
  ) {
    console.log("sending create request to: " + API_CREATE)
    
    function get_exp_date() {
      date = new Date(document.getElementById("sh-exp").value)
      if (isNaN(date)) {
        return 0
      }
      return toTimestamp(date)
    }

    function get_limit() {
      limit = parseInt(document.getElementById("sh-limit").value)
      if (isNaN(limit)) {
        limit = 0
      }
      return limit
    }

    const data = {
      code: document.getElementById("sh-code").value,
      target_url: document.getElementById("sh-url").value,
      password: document.getElementById("sh-pwd").value,
      use_limit: get_limit(),
      expiration_date: get_exp_date()
    };

    const options = {
      method: 'POST',                 
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    };


    fetch(API_CREATE, options)
      .then(response => response.json())
      .then(result => {
        console.log('POST request successful', result);
        switch (result.status) {
          case "blacklist":
            openBlacklist()
            break
          case "already_taken":
            output("This code is already taken...")
            break
          case "invalid_data":
            output("Invalid data...")
            break
          case "invalid_url":
            output("Invalid target URL. Make sure it exists.")
            break
          case "created":
            url = SHX_URL + "#" + result.value
            output("Your URL:   " + url)
            alert("Your URL:   " + url)
        }
      })
      .catch(error => {
        console.error('Error sending POST request', error);
        output("There was an error...")
      });
  
  }
}


// CHECK CODE DETAILS

function ch_check_code() {
  element = document.getElementById("ch-code")
  code = element.value

  function isAlphanumeric(inputString) {
    var alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(inputString);
  }

  if (code.length == 0) {
    element.setAttribute("state", "none")
    return false
  }

  if (code.length >= 3 && code.length <= 16 && isAlphanumeric(code)) {
    element.setAttribute("state", "valid")
    return true
  }

  element.setAttribute("state", "invalid")
  return false
}

function ch_check_details(event) {
  console.log(event)
  event.preventDefault()

  if (ch_check_code()) {
    console.log("sending check request to: " + API_CHECKCODE)
    code = document.getElementById("ch-code").value
    
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    url = API_CHECKCODE + code
    fetch(url, options)
      .then(response => response.json())
      .then(result => {
        console.log('CODE CHECK GET: success', result);
        switch (result.status) {
          case "blacklist":
            openBlacklist()
            break
          case "not_found":
            alert("Code not found.")
            document.getElementById("ch-code").value = ""
            document.getElementById("ch-code").setAttribute("state", "none")
            break
          case "ok":
            entry = result.entry
            
            if (entry.use_limit == 0) {
              entry.use_limit = "∞"
            }
            use_limit = entry.times_used + " / " + entry.use_limit            
            pwd = entry.password ? "Yes" : "No"

            document.getElementById("val-code").innerHTML = code
            document.getElementById("val-url").innerHTML = entry.target_url + "..."
            document.getElementById("val-pwd").innerHTML = pwd
            document.getElementById("val-use-limit").innerHTML = use_limit
            document.getElementById("val-exp").innerHTML = entry.expiration_date
            document.getElementById("val-created").innerHTML = entry.created_date
        }
      })
      .catch(error => {
        console.error('CODE CHECK GET: fail', error);
        alert("There was an error...")
      });
  }
}


// REPORT CODE

function rp_check_code() {
  element = document.getElementById("rp-code")
  code = element.value

  function isAlphanumeric(inputString) {
    var alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(inputString);
  }

  if (code.length == 0) {
    element.setAttribute("state", "none")
    return false
  }

  if (code.length >= 3 && code.length <= 16 && isAlphanumeric(code)) {
    element.setAttribute("state", "valid")
    return true
  }

  element.setAttribute("state", "invalid")
  return false
}

function rp_check_email() {
  element = document.getElementById("rp-mail")
  switch_state = document.getElementById("rp-s-mail").checked
  if (!switch_state) {
    return true
  }
  mail = element.value
  validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!Boolean(mail)) {
    element.setAttribute("state", "none")
    return false
  }

  if (mail.match(validRegex)) {
    element.setAttribute("state", "valid")
    return true;
  }

  element.setAttribute("state", "invalid")
  return false;
}

function rp_send() {
  function output(value) {
    document.getElementById("rp-info").innerHTML = value
  }

  if (rp_check_code() && rp_check_email()) {
    console.log("sending report request to: " + API_REPORT)

    const data = {
      code: document.getElementById("rp-code").value,
      message: document.getElementById("rp-msg").value,
      email: document.getElementById("rp-mail").value
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

    fetch(API_REPORT, options)
      .then(response => response.json())
      .then(result => {
        console.log('POST request successful', result);
        switch (result.status) {
          case "blacklist":
            openBlacklist()
            break
          case "not_found":
            alert("Code not found.")
            output("Code not found.")
            break
          case "ok":
            alert("Report sent 💪")
            output("Report sent 💪")
        }
      })
      .catch(error => {
        console.error('Error sending POST request', error);
        output("There was an error...")
      });

  }
}
>>>>>>> 6c3130d1751fa2ff12a6976284eb1adc0ba80361
