console.log(`INITIALIZING APP`);
/**
 * MODULE DEPENDENCIES:
 */
import express from 'express';
import bodyparser from 'body-parser';
import dontenv from 'dotenv';

/**
 * LOAD .env FILE.
 */
console.log(`LOADING ENVIROMENT VARIABLES`)
dontenv.config({ path: '.env' });

/**
 * LOAD CONTROLLERS.
 */
console.log(`LOADING API ROUTE CONTROLLERS`);
const ScheduleController = require('./controllers/schedule-controller');

/**
 * INITIALIZE APP.
 */
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));


/**
 * USE CONTROLLERS.
 */
app.use('/schedule', ScheduleController);


app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
});