class Lesson{
    constructor(dateStart, dateEnd, tutor, dayCode, hourRange, place){
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.tutor = tutor;
        this.day = this.parseDayCode(dayCode);
        this.timeStart = this.getStartTime(hourRange);
        this.timeEnd = this.getEndTime(hourRange);
        this.duration = this.getDuration();
        this.place = place;
    }

    parseDayCode(dayCode){
        switch(dayCode){
            case 'M':
                return 'Lunes';
            case 'T':
                return 'Martes';
            case 'W':
                return 'Miercoles';
            case 'R':
                return 'Jueves';
            case 'F':
                return 'Viernes';
            case 'S':
                return 'Sabado';
            default:
                return 'No definido';
        }
    }

    getStartTime(hourRange){
        return hourRange.toString().split('-')[0];
    }

    getEndTime(hourRange){
        let result =  hourRange.toString().split('-')[1];
        if(result[result.length  -1] === '9'){
            result = (parseInt(result) +1).toString();
        }else if(result[result.length  -1] === '8'){
            result = (parseInt(result) +2).toString();
        }else if(result[result.length  -1] === '7'){
            result = (parseInt(result) +3).toString();
        }
        return result;
    }

    getDuration(){
        return parseInt((parseInt(this.timeEnd) -parseInt(this.timeStart))/100).toString();
    }
}

export { Lesson }; 