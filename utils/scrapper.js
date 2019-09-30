import $ from 'cheerio';
import request from 'request-promise';
import { Option } from './option';


class Scrapper{
    constructor(){
        this.METADATA = process.env.METADATA;
        this.DEPARTMENT = process.env.DEPARTMENT;
        this.periods = [];
        this.departments = [];
        this.levels = [];
    }

    rng(min, max){
        return 1000 *Math.ceil(Math.random * (max -min) +min);
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

        console.log(options);

        try{
            const html = await request(options);
            $('#programa option', html).each((index, element) => {
                if(index > 0){
                    console.log(new Option(element.attribs.value, element.children[0].data));
                    response.courses.push(new Option(element.attribs.value, element.children[0].data));
                }
            });

            return Promise.resolve(response);
        }catch(error){
            Promise.reject(error);
        }
    }
}

export { Scrapper };