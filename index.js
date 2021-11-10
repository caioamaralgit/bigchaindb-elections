require('dotenv').config();

const express = require('express');

const port = process.env.PORT;

const app = express();

app.get("/", (request, response) => response.sendFile("./public/index.html", { root: __dirname }));

app.listen(port, () => console.log(`Ouvindo porta ${port}`));
