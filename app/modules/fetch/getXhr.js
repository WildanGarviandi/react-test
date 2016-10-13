import config from './config';

function formatParams(params){
    return "?" + Object
        .keys(params)
        .map(function(key){
          return key+"="+params[key]
        })
        .join("&");
}

export function fetchXhr(url, params, token, acceptHeader, responseType) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', config.baseUrl + '/order/export/'+ formatParams(params), true);
    xhr.setRequestHeader('LoginSessionKey', token);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Accept', acceptHeader || 'application/json');
    if (responseType) {
        xhr.responseType = responseType;
    }
    return xhr;
}
