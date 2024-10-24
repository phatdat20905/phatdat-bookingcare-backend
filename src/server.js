import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web';
import connectDB from './config/connectDB';
require('dotenv').config();
const app = express();

//config app

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

viewEngine(app);

initWebRoutes(app);

connectDB();  // Connect to mysql

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;