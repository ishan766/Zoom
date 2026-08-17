let IS_PROD = false; // set to true for production
// development backend defaults to localhost:8000 which matches backend PORT
const server = IS_PROD ?
    "https://ishan766backend.onrender.com" :

    "http://localhost:8000"


export default server;