import fs from 'fs';
import $ from 'cheerio';
import mkdirp from 'mkdirp';
import request from 'request-promise';
import { Option } from './option';
import { Lesson } from './lesson';


class Scrapper{
    constructor(){
        this.METADATA = process.env.METADATA;
        this.DEPARTMENT = process.env.DEPARTMENT;
        this.COURSE = process.env.COURSE;
        this.periods = [];
        this.departments = [];
        this.levels = [];
        this.courses = [];
    }

    async delayedCoruseCall(period, course_code, value, length, delay){
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                console.log(`Requesting ${course_code} info @ ${period} ...(${parseInt(value +1)}/${length})`);
                resolve(await this.obtainCourse(period, course_code));
            }, 1000 *delay);
        });
    }

    async obtainSearchMetadata(){
        let metadata = {
            periods: undefined, 
            departments: undefined, 
            levels: undefined
        };

        try{
            const html = await request(this.METADATA);
            if(this.periods.length > 0){
                metadata.periods = this.periods[this.periods.length -1];
            }else{    
                $('#periodo option', html).each((index, element) => {
                    if(index > 0){
                        this.periods.push(new Option(element.attribs.value, element.children[0].data));
                    }
                });            
                metadata.periods = this.periods[this.periods.length -1];;   
            }

            if(this.levels.length > 0){
                metadata.levels = this.levels;
            }else{    
                $('#nivel option', html).each((index, element) => {
                    if(index > 0){
                        this.levels.push(new Option(element.attribs.value, element.children[0].data));
                    }
                });            
                metadata.levels = this.levels;   
            }

            if(this.departments.length > 0){
                metadata.departments = this.departments;
            }else{
                $('#departamento option', html).each((index, element) => {
                    if(index > 0){
                        this.departments.push(new Option(element.attribs.value, element.children[0].data));
                    }
                });            
                metadata.departments = this.departments; 
            }
            return Promise.resolve(metadata);
        }catch(error){
            Promise.reject(error);
        }
    }

    async obtainDepartmentCourses(period, level, department){
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

        try{
            const html = await request(options);
            $('#programa option', html).each((index, element) => {
                if(index > 0){
                    response.courses.push(new Option(element.attribs.value, element.children[0].data));
                }
            });

            return Promise.resolve(response);
        }catch(error){
            Promise.reject(error);
        }
    }

    async obtainCourse(period, chosen){
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
        try{
            html = await request(options);
        }catch(error){
            success = false;
            let attempt = 0;
            while(success && (attempt < maxAttempts)){
                try{
                    html = await request(options);
                    success = true;
                }catch(error){
                    attempt++;
                }
            }
            if(!success){
                Promise.reject(error);
            }
        }

        const rowCount = $('tr', html).length;
        let element;

        for(let index = 1; index < rowCount; index ++){
            element = $('tr', html).eq(index);
            response.schedule.push(new Lesson(
                $('td', element).eq(0).text(),
                $('td', element).eq(1).text(),
                $('td', element).eq(2).text(),
                $('td', element).eq(3).text(),
                $('td', element).eq(4).text(),
                $('td', element).eq(5).text(),
            ));
        }

        return Promise.resolve(response);
    }

    async obtainDepartmentCoursesInfo(period, level, department){
        let courses = [];
        const DIR = `./FILES/${period}/${level}/${department}`;
        const FILEPATH = `${DIR}/courses.json`;
        if(!fs.existsSync(FILEPATH)){
            const departments = await this.obtainDepartmentCourses(period, level, department);
            for(let course = 0; course < departments.courses.length; course++){
                const courseInfo = await this.delayedCoruseCall(
                    period, 
                    departments.courses[course].value, 
                    course, 
                    departments.courses.length, 
                    1
                );
                courses.push(courseInfo);
            }
            if(!fs.existsSync(DIR)){
                mkdirp.sync(DIR);
            }
            fs.writeFileSync(FILEPATH, JSON.stringify(courses));
        }else{
            const jsonString = fs.readFileSync(FILEPATH);
            courses = JSON.parse(jsonString);
        }
        
        return Promise.resolve(courses);
    }

    async obtainLevelCoursesInfo(period, level){
        let courses = [];
        const DIR = `./FILES/${period}/${level}`;
        const FILEPATH = `${DIR}/courses.json`;
        let metadata = await this.obtainSearchMetadata();
        if(!fs.existsSync(FILEPATH)){
            let department_courses = [];
            const length = metadata.departments.length;
            for(let index = 0; index < length; index++){
                console.log(`⭐ Requesting ${metadata.departments[index].value} info @ ${period} ...(${parseInt(index +1)}/${length})`);
                department_courses = await this.obtainDepartmentCoursesInfo(period, level, metadata.departments[index].value);
                if(department_courses){
                    if(department_courses.length === 0){
                        console.log('Empt array!');
                    }
                }
                for(let course of department_courses){
                    courses.push(course);
                }
            }
            if(!fs.existsSync(DIR)){
                mkdirp.sync(DIR);
            }
            fs.writeFileSync(FILEPATH, JSON.stringify(courses));
        }else{
            const jsonString = fs.readFileSync(FILEPATH);
            courses = JSON.parse(jsonString);
        }
        
        return Promise.resolve(courses);
    }

    async obtainPeriodCoursesInfo(period){
        let courses = [];
        const DIR = `./FILES/${period}`;
        const FILEPATH = `${DIR}/courses.json`;
        let metadata = await this.obtainSearchMetadata();
        if(!fs.existsSync(FILEPATH)){
            let level_courses = [];
            const length = metadata.levels.length;
            for(let index = 0; index < length; index++){
                console.log(`<> Requesting ${metadata.levels[index].value} info @ ${period} ...(${parseInt(index +1)}/${length})`);
                level_courses = await this.obtainLevelCoursesInfo(period, metadata.levels[index].value);
                if(level_courses){
                    if(level_courses.length === 0){
                        console.log('Empt array!');
                    }
                }
                for(let course of level_courses){
                    courses.push(course);
                }
            }
            if(!fs.existsSync(DIR)){
                mkdirp.sync(DIR);
            }
            fs.writeFileSync(FILEPATH, JSON.stringify(courses));
        }else{
            const jsonString = fs.readFileSync(FILEPATH);
            courses = JSON.parse(jsonString);
        }
        return Promise.resolve(courses);
    }
}

export { Scrapper };