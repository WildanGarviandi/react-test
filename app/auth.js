module.exports = {
  login(email, pass, cb) {
    cb = arguments[arguments.length - 1]
    pretendRequest(email, pass, (res) => {
      if (res.authenticated) {
        localStorage.token = res.token
        localStorage.fleetID = res.fleetManagerID
        if (cb) cb(true)
        this.onChange(true)
      } else {
        if (cb) cb(false)
        this.onChange(false)
      }
    })
  },

  getToken() {
    return localStorage.token
  },

  logout(cb) {
    delete localStorage.token
    if (cb) cb()
    this.onChange(false)
  },

  loggedIn() {
    return fetch('http://localhost:3001/v2/fleet/is-authenticated', {
      credentials: 'include',
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'LoginSessionKey': localStorage.token
      }
    }).then(function(response) {
      if (response.status >= 400) {
        return false;
      }

      return response.json();
    });
  },

  onChange() {}
}

function pretendRequest(email, pass, cb) {
  fetch('http://localhost:3001/v2/fleet/sign-in', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: email,
      password: pass
    })
  }).then(function(response) {
    if (response.status >= 400) {
      return {authenticated: false};
    }

    return response.json();
  }).then(function(response) {
    console.log(response);
    if(response.authenticated == false) {
      cb(response);
    } else {
      cb({
        authenticated: true,
        token: response.data.SignIn.LoginSessionKey,
        fleetManagerID: response.data.SignIn.UserID
      });
    }
  });
}
