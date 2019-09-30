import $ from 'cheerio';
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

    rng(min, max){
        return 1000 *Math.ceil(Math.random() * (max -min) +min);
    }

    async delayedCoruseCall(period, course_code, value, length, min, max){
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                console.log(`Requesting ${course_code} info @ ${period} ...(${parseInt(value +1)}/${length})`);
                resolve(await this.obtainCourse(period, course_code));
            }, 1000);
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
        const departments = await this.obtainDepartmentCourses(period, level, department);
        for(let course = 0; course < departments.courses.length; course++){
            const courseInfo = await this.delayedCoruseCall(
                period, 
                departments.courses[course].value, 
                course, 
                departments.courses.length, 
                1, 
                3
            ); 
            courses.push(courseInfo);
        }
        return Promise.resolve(courses);
    }
}

export { Scrapper };