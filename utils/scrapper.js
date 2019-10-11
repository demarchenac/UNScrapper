import fs from 'fs';
import $ from 'cheerio';
import mkdirp from 'mkdirp';
import request from 'request-promise';
import puppeteer from 'puppeteer';
import { Option } from './option';
import { Lesson } from './lesson';


class Scrapper {
    constructor() {
        this.METADATA = process.env.METADATA;
        this.DEPARTMENT = process.env.DEPARTMENT;
        this.COURSE = process.env.COURSE;
        this.ACADEMY_SUPPORT = process.env.ACADEMY_SUPPORT;
        this.periods = [];
        this.departments = [];
        this.levels = [];
        this.courses = [];
    }

    async delayedCoruseCall(period, course_code, value, length, delay) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                console.log(`Requesting ${course_code} info @ ${period} ...(${parseInt(value + 1)}/${length})`);
                resolve(await this.obtainCourse(period, course_code));
            }, 1000 * delay);
        });
    }

    async obtainSearchMetadata() {
        let metadata = {
            periods: undefined,
            departments: undefined,
            levels: undefined
        };

        try {
            const html = await request(this.METADATA);
            if (this.periods.length > 0) {
                metadata.periods = this.periods[this.periods.length - 1];
            } else {
                $('#periodo option', html).each((index, element) => {
                    if (index > 0) {
                        this.periods.push(new Option(element.attribs.value, element.children[0].data));
                    }
                });
                metadata.periods = this.periods[this.periods.length - 1];;
            }

            if (this.levels.length > 0) {
                metadata.levels = this.levels;
            } else {
                $('#nivel option', html).each((index, element) => {

                    this.levels.push(new Option(element.attribs.value, element.children[0].data));

                });
                metadata.levels = this.levels;
            }

            if (this.departments.length > 0) {
                metadata.departments = this.departments;
            } else {
                $('#departamento option', html).each((index, element) => {
                    if (index > 0) {
                        this.departments.push(new Option(element.attribs.value, element.children[0].data));
                    }
                });
                metadata.departments = this.departments;
            }
            return Promise.resolve(metadata);
        } catch (error) {
            Promise.reject(error);
        }
    }

    async obtainDepartmentCourses(period, level, department) {
        const options = {
            method: `POST`,
            uri: this.DEPARTMENT,
            form: {
                departamento: `${department}`,
                datos_periodo: `${period}`,
                datos_nivel: `${level}`
            }
        };

        let response = {
            period: period,
            level: level,
            department: department,
            courses: []
        };

        try {
            const html = await request(options);
            $('#programa option', html).each((index, element) => {
                if (index > 0) {
                    response.courses.push(new Option(element.attribs.value, element.children[0].data));
                }
            });

            return Promise.resolve(response);
        } catch (error) {
            Promise.reject(error);
        }
    }

    async obtainCourse(period, chosen) {
        const options = {
            method: `POST`,
            uri: this.COURSE,
            form: {
                periodo: `${period}`,
                elegido: `${chosen}`
            }
        };

        let response = {
            period: period,
            course_code: chosen,
            schedule: []
        };

        let html;
        let success = true;
        let maxAttempts = 3;
        try {
            html = await request(options);
        } catch (error) {
            success = false;
            let attempt = 0;
            while (success && (attempt < maxAttempts)) {
                try {
                    html = await request(options);
                    success = true;
                } catch (error) {
                    attempt++;
                }
            }
            if (!success) {
                Promise.reject(error);
            }
        }

        const rowCount = $('tr', html).length;
        let element;

        for (let index = 1; index < rowCount; index++) {
            element = $('tr', html).eq(index);

            if (
                $('td', element).eq(5).text().includes(' - ') &&
                !$('td', element).eq(5).text().includes('NNS') &&
                !$('td', element).eq(5).text().includes('LF') &&
                !$('td', element).eq(5).text().includes('LE') &&
                !$('td', element).eq(5).text().includes('LG') &&
                !$('td', element).eq(5).text().includes('VIRT') &&
                !$('td', element).eq(5).text().includes('CJ') &&
                !$('td', element).eq(5).text().includes('SDR') &&
                !$('td', element).eq(5).text().includes('EMP') &&
                !$('td', element).eq(5).text().includes('LJ') &&
                !$('td', element).eq(5).text().includes('H') &&
                !$('td', element).eq(5).text().includes('CDA') &&
                !$('td', element).eq(5).text().includes('LC') &&
                !$('td', element).eq(5).text().includes('M') &&
                !$('td', element).eq(5).text().includes('SAL') &&
                !$('td', element).eq(5).text().includes('CAB') &&
                !$('td', element).eq(5).text().includes('LD') &&
                !$('td', element).eq(5).text().includes('SM') &&
                !$('td', element).eq(5).text().includes('S1') &&
                $('td', element).eq(5).text().length > 3
            ) {
                response.schedule.push(new Lesson(
                    $('td', element).eq(0).text(),
                    $('td', element).eq(1).text(),
                    $('td', element).eq(2).text(),
                    $('td', element).eq(3).text(),
                    $('td', element).eq(4).text(),
                    $('td', element).eq(5).text().split(' - ')[1].trim(),
                ));
            }
        }

        return Promise.resolve(response);
    }

    async obtainDepartmentCoursesInfo(period, level, department) {
        let courses = [];
        const DIR = `./FILES/${period}/${level}/${department}`;
        const FILEPATH = `${DIR}/courses.json`;
        if (!fs.existsSync(FILEPATH)) {
            const departments = await this.obtainDepartmentCourses(period, level, department);
            for (let course = 0; course < departments.courses.length; course++) {
                const courseInfo = await this.delayedCoruseCall(
                    period,
                    departments.courses[course].value,
                    course,
                    departments.courses.length,
                    1
                );
                courses.push(courseInfo);
            }
            if (!fs.existsSync(DIR)) {
                mkdirp.sync(DIR);
            }
            fs.writeFileSync(FILEPATH, JSON.stringify(courses));
        } else {
            const jsonString = fs.readFileSync(FILEPATH);
            courses = JSON.parse(jsonString);
        }

        return Promise.resolve(courses);
    }

    async obtainLevelCoursesInfo(period, level) {
        let courses = [];
        const DIR = `./FILES/${period}/${level}`;
        const FILEPATH = `${DIR}/courses.json`;
        let metadata = await this.obtainSearchMetadata();
        if (!fs.existsSync(FILEPATH)) {
            let department_courses = [];
            const length = metadata.departments.length;
            for (let index = 0; index < length; index++) {
                console.log(`⭐ Requesting ${metadata.departments[index].value} info @ ${period} ...(${parseInt(index + 1)}/${length})`);
                department_courses = await this.obtainDepartmentCoursesInfo(period, level, metadata.departments[index].value);
                if (department_courses) {
                    if (department_courses.length === 0) {
                        console.log('Empt array!');
                    }
                }
                for (let course of department_courses) {
                    courses.push(course);
                }
            }
            if (!fs.existsSync(DIR)) {
                mkdirp.sync(DIR);
            }
            fs.writeFileSync(FILEPATH, JSON.stringify(courses));
        } else {
            const jsonString = fs.readFileSync(FILEPATH);
            courses = JSON.parse(jsonString);
        }

        return Promise.resolve(courses);
    }

    async obtainPeriodCoursesInfo(period) {
        let courses = [];
        const DIR = `./FILES/${period}`;
        const SUP = `./FILES/${period}/SUPPORT/courses.json`;
        const FILEPATH = `${DIR}/courses.json`;
        let metadata = await this.obtainSearchMetadata();
        if (!fs.existsSync(FILEPATH)) {
            let level_courses = [];
            const length = metadata.levels.length;
            for (let index = 0; index < length; index++) {
                console.log(`<> Requesting ${metadata.levels[index].value} info @ ${period} ...(${parseInt(index + 1)}/${length})`);
                level_courses = await this.obtainLevelCoursesInfo(period, metadata.levels[index].value);
                if (level_courses) {
                    if (level_courses.length === 0) {
                        console.log('Empt array!');
                    }
                }
                for (let course of level_courses) {
                    courses.push(course);
                }
            }

            if (fs.existsSync(SUP)) {
                const jsonString = fs.readFileSync(SUP);
                const support_info = JSON.parse(jsonString);
                courses.push(support_info);
            }

            if (!fs.existsSync(DIR)) {
                mkdirp.sync(DIR);
            }

            fs.writeFileSync(FILEPATH, JSON.stringify(courses));
        } else {
            const jsonString = fs.readFileSync(FILEPATH);
            courses = JSON.parse(jsonString);
        }
        return Promise.resolve(courses);
    }

    async obtainSupportLinks() {
        let response = {
            links: []
        };

        try {
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();
            page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36');
            await page.goto(this.ACADEMY_SUPPORT);
            await page.waitForSelector('a');
            const temp = await page.$$eval('a', anchors => [].map.call(anchors, a => a.href));
            response.links.push(temp[0]);
            await browser.close();
            return Promise.resolve(response);
        } catch (err) {
            Promise.reject(err);
        }
    }

    async obtainSupportCoursesInfo(period, uri) {
        const options = {
            method: `GET`,
            uri: `${uri}`
        };

        const subLevel = uri.toString().split('/')[5].toUpperCase();

        let response = {
            period: `${period}`,
            level: `SUPPORT`,
            subLevel: `${subLevel}`,
            schedule: []
        };

        const DIR = `./FILES/${period}/SUPPORT/${subLevel}`;
        const _DIR = `./FILES/${period}/SUPPORT`;
        const FILEPATH = `${DIR}/courses.json`;
        const _FILEPATH = `${_DIR}/courses.json`;
        if (!fs.existsSync(FILEPATH)) {
            let html;
            let success = true;
            let maxAttempts = 3;
            try {
                html = await request(options);
            } catch (error) {
                success = false;
                let attempt = 0;
                while (success && (attempt < maxAttempts)) {
                    try {
                        html = await request(options);
                        success = true;
                    } catch (error) {
                        attempt++;
                    }
                }
                if (!success) {
                    Promise.reject(error);
                }
            }

            const rowCount = $('tr', html).length;
            let element;

            if (subLevel === 'APOYO') {
                for (let index = 1; index < rowCount; index++) {
                    element = $('tr', html).eq(index);
                    if (
                        $('td', element).eq(2).text().trim() !== '-' &&
                        $('td', element).eq(3).text().trim() !== '-' &&
                        $('td', element).eq(4).text().trim() !== '-' &&
                        !$('td', element).eq(4).text().includes('KONDER') &&
                        !$('td', element).eq(4).text().includes('TUTORIAS') &&
                        !$('td', element).eq(4).text().includes('MULTIPLE') &&
                        !$('td', element).eq(4).text().includes('BIBLIOTECA') &&
                        !$('td', element).eq(4).text().includes('REUNIONES') &&
                        !$('td', element).eq(4).text().includes('LAB.') &&
                        !$('td', element).eq(4).text().includes('SDU')
                    ) {
                        response.schedule.push(new Lesson(
                            '',
                            '',
                            $('td', element).eq(5).text(),
                            $('td', element).eq(2).text(),
                            $('td', element).eq(3).text(),
                            $('td', element).eq(4).text(),
                        ));
                    }
                }
            }

            if (!fs.existsSync(DIR)) {
                mkdirp.sync(DIR);
            }
            if (!fs.existsSync(_DIR)) {
                mkdirp.sync(_DIR);
            }
            fs.writeFileSync(FILEPATH, JSON.stringify(response));
            fs.writeFileSync(_FILEPATH, JSON.stringify(response));
        } else {
            const jsonString = fs.readFileSync(FILEPATH);
            response = JSON.parse(jsonString);
        }

        return Promise.resolve(response);
    }
}

export { Scrapper };