import $ from 'jquery';

var MyAjax = (url, success, error, type, data) => {

    $.ajax({
        url: url,
        success: success,
        error: error,
        type: type,
        data: data,
        headers: { "Authorization": "Bearer " + sessionStorage.getItem("access_token") }
    })

};

var MyAjaxForAttachments = (url, success, error, type, data) => {

    $.ajax({
        url: url,
        success: success,
        error: error,
        type: type,
        data: data,
        contentType:false,
        processData: false,
        headers: { "Authorization": "Bearer " + sessionStorage.getItem("access_token") }
    })

};

export  {MyAjaxForAttachments, MyAjax};
