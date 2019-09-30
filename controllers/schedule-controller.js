/**
 * MODULES.
 */
import express from 'express';

/**
 * IMPORT SCRAPPER
 */
import { Scrapper } from '../utils/scrapper';
console.log(`CREATING SCRAPPER @ScheduleController`);
const scrapper = new Scrapper();

/**
 * INITIALIZE CONTROLLER.
 */
const ScheduleController = express.Router();

ScheduleController.route('/obtainMetadata').get(async (req, res) => {
    const response = await scrapper.obtainSearchMetadata();
    res.json(response);
});

ScheduleController.route('/obtainDepartmentCourses').post(async (req, res) => {
    const response = await scrapper
        .obtainDepartmentCourses(req.body.period, req.body.level, req.body.department);
    res.json(response);
});

module.exports = ScheduleController;