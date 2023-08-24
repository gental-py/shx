const API = "http://127.0.0.1:8000/"
const API_GATE = API + "gate/"


function check_code() {
    var code = window.location.hash.substr(1)
    if (code == "") {
        console.log("No code provided.")
        window.open("../index.html", "_self")
    }
    return code
}

hash_code = check_code()

function gate_send() {
    function output(content) {
        alert(content)
        document.getElementById("gate-info").innerHTML = content
    }

    pwd = document.getElementById("gate-pwd").value
    console.log(hash_code)
    const data = {
        code: hash_code,
        password: pwd,
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(API_GATE, options)
    .then(response => response.json())
    .then(result => {
        console.log('POST request successful', result);
        switch (result.status) {
            case "blacklist":
                window.open("../static/blacklist.html", "_self")
                break
            case "invalid_password":
                output("Invalid password!")
                break
            case "not_found":
                output("Invalid url code! (not password)")
                break
            case "use_limit_reached":
                output("You cannot enter. Use limit reached!")
                break
            case "code_expired":
                output("You cannot enter. Code is expired!")
                break
            case "redirect":
                console.log("Password OK")
                window.open(result.redirect, "_self")
                break
        }
    })
    .catch(error => {
        console.error('Error sending POST request', error);
        output("There was an error...")
    });
}