import fs from 'fs';
import mkdirp from 'mkdirp';
import { Room } from './room';

class RoomManager {
    constructor() { }

    async getRoomsAtPeriod(period) {
        const COURSES_DIR = `./FILES/${period}/courses.json`;
        const ROOMS_DIR = `./FILES/${period}/rooms.json`;

        let rooms = [];

        if (!fs.existsSync(ROOMS_DIR)) {
            if (fs.existsSync(COURSES_DIR)) {
                const jsonString = fs.readFileSync(COURSES_DIR);
                const courses = JSON.parse(jsonString);

                let rooms_n = [];
                for (const course of courses) {
                    for (const lesson of course.schedule) {
                        rooms_n.push(lesson.place);
                    }
                }
                console.log(rooms_n.length);
                let unique = rooms_n.filter((item, index) => rooms_n.indexOf(item) === index);
                console.log(unique.length);
                rooms_n = unique.sort().splice(1);
                for (const name of rooms_n) {
                    rooms.push(new Room(name));
                }
                let hour;
                for (const course of courses) {
                    console.log('Current: ' + (courses.indexOf(course) + 1) + ' of ' + courses.length)
                    for (const lesson of course.schedule) {
                        const roomIndex = rooms_n.indexOf(lesson.place);
                        if (roomIndex > -1) {
                            for (let rounds = 0; rounds < lesson.duration; rounds++) {
                                hour = (parseInt(lesson.timeStart) + (100 * rounds)).toString();
                                if (hour.length == 3) hour = '0' + hour;
                                console.log(roomIndex + ' - ' + lesson.day + ' - ' + hour);
                                rooms[roomIndex].toggleBusyAt(lesson.day, hour);
                            }
                        }
                    }
                }
                console.log('----------------------------------------------------');
                fs.writeFileSync(ROOMS_DIR, JSON.stringify(rooms));
            } else {
                Promise.reject('404');
            }
        } else {
            const jsonString = fs.readFileSync(ROOMS_DIR);
            rooms = JSON.parse(jsonString);
        }

        return Promise.resolve(rooms);
    }

    async getRoomAvailabilityAtPeriodByDate(period, day, hour) {
        const ROOMS_DIR = `./FILES/${period}/rooms.json`;
        let response = [];
        if (fs.existsSync(ROOMS_DIR)) {
            const jsonString = fs.readFileSync(ROOMS_DIR);
            const rooms_json = JSON.parse(jsonString);
            let available;
            let rooms = [];
            for (const room of rooms_json) {
                let { name, schedule } = room;
                rooms.push(new Room(name, schedule));
                let index = rooms_json.indexOf(room);
                if (!rooms[index].isBusyAt(day, hour)) {
                    available = {
                        roomName: room.name,
                        startTime: hour,
                        streak: rooms[index].getStreakAt(day, hour)
                    }

                    response.push(available);
                }
            }
            return Promise.resolve(response);
        } else {
            return Promise.resolve('404');
        }
    }


}

export { RoomManager }; 