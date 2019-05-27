var ApiUrl = "";

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    ApiUrl = "http://localhost:54093/";
}
else {
    ApiUrl = "https://maxmaster.azurewebsites.net/api";
}

var remote = (remoteFunction) => {
    remoteFunction.pagination = true;
    remoteFunction.cellEdit=true;
    return remoteFunction;
}

export { ApiUrl, remote };
