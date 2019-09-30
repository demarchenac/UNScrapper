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
    }

    rng(min, max){
        return 1000 *Math.ceil(Math.random * (max -min) +min);
    }

    async wait(min, max){
        setTimeout(() => {
            return Promise.resolve(true);
        }, this.rng(min, max));
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

        try{
            const html = await request(options);
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
        }catch(error){
            Promise.reject(error);
        }
    }

    async obtainDepartmentCoursesInfo(period, level, department){
        const departments = await this.obtainDepartmentCourses(period, level, department);
        console.log(departments);
        for(const course in departments.courses){
            console.log('!'); 
            await this.wait(4, 5);
            console.log(course); 
        }
    }
}

export { Scrapper };