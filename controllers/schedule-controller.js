/**
 * MODULES.
 */
import express from 'express';

/**
 * IMPORT, INITIALIZE SCRAPPER & ROOM MANAGER
 */
import { Scrapper } from '../utils/scrapper';
import { RoomManager } from '../utils/room-manager';
console.log(`CREATING SCRAPPER @ScheduleController`);
const scrapper = new Scrapper();
console.log(`CREATING ROOM MANAGER @ScheduleController`);
const roomManager = new RoomManager();

/**
 * INITIALIZE CONTROLLER.
 */
const ScheduleController = express.Router();

/**
 * DEFINE ROUTES
 */
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

ScheduleController.route('/obtainSupportCoursesInfo').post(async (req, res) => {
    const response = await scrapper
        .obtainSupportCoursesInfo(req.body.period, req.body.uri);
    res.json(response);
});

ScheduleController.route('/getRooms').post(async (req, res) => {
    const response = await roomManager
        .getRoomsAtPeriod(req.body.period);
    res.json(response);
});

ScheduleController.route('/getFreeRooms').post(async (req, res) => {
    const response = await roomManager
        .getRoomAvailabilityAtPeriodByDate(req.body.period, req.body.day, req.body.hour);
    if (response === '404') {
        res.status(404);
    } else {
        res.json(response);
    }
});

module.exports = ScheduleController;