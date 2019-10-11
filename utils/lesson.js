class Lesson {
    constructor(dateStart, dateEnd, tutor, dayCode, hourRange, place) {
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.tutor = tutor;
        this.day = this.parseDayCode(dayCode);
        this.timeStart = this.getStartTime(hourRange);
        this.timeEnd = this.getEndTime(hourRange);
        this.duration = this.getDuration();
        this.place = place;
    }

    parseDayCode(dayCode) {
        switch (dayCode) {

            case 'LUNES':
            case 'M':
                return 'Lunes';
            case 'MARTES':
            case 'T':
                return 'Martes';
            case 'MIERCOLES':
            case 'W':
                return 'Miercoles';
            case 'JUEVES':
            case 'R':
                return 'Jueves';
            case 'VIERNES':
            case 'F':
                return 'Viernes';
            case 'SABADO':
            case 'S':
                return 'Sabado';
            default:
                return 'No definido';
        }
    }

    getStartTime(hourRange) {
        return hourRange.toString().split('-')[0].trim().replace(':', '');
    }

    getEndTime(hourRange) {
        let result
        if (hourRange.includes('-') && hourRange.trim().length > 1) {
            result = hourRange.toString().split('-')[1].trim();
            if (result[result.length - 1] === '9') {
                result = (parseInt(result) + 1).toString();
            } else if (result[result.length - 1] === '8') {
                result = (parseInt(result) + 2).toString();
            } else if (result[result.length - 1] === '7') {
                result = (parseInt(result) + 3).toString();
            }
            if (result.includes(':')) result = result.replace(':', '')
        } else {
            result = 0;
        }
        if (result.length === 3) result = '0' + result;
        return result;
    }

    getDuration() {
        return parseInt((parseInt(this.timeEnd) - parseInt(this.timeStart)) / 100).toString();
    }
}

export { Lesson }; 