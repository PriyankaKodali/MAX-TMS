let ApiUrl = "";

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    ApiUrl = "http://localhost:54093/";
 } 
   else {
    ApiUrl = "https://maxmaster.azurewebsites.net/api";
}

export { ApiUrl };
