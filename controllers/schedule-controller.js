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

ScheduleController.route('/obtainCourse').post(async (req, res) => {
    const response = await scrapper
        .obtainCourse(req.body.period, req.body.course_code);
    res.json(response);
});

ScheduleController.route('/obtainDepartmentCoursesInfo').post(async (req, res) => {
    const response = await scrapper
        .obtainDepartmentCoursesInfo(req.body.period, req.body.level, req.body.department);
    res.json(response);
});

ScheduleController.route('/obtainLevelCoursesInfo').post(async (req, res) => {
    const response = await scrapper
        .obtainLevelCoursesInfo(req.body.period, req.body.level);
    res.json(response);
});

ScheduleController.route('/obtainPeriodCoursesInfo').post(async (req, res) => {
    const response = await scrapper
        .obtainPeriodCoursesInfo(req.body.period);
    res.json(response);
});

ScheduleController.route('/obtainSupportLinks').get(async (req, res) => {
    const response = await scrapper
        .obtainSupportLinks();
    res.json(response);
});

module.exports = ScheduleController;