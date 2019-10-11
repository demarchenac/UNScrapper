class Room {
    constructor(name, schedule = undefined) {
        this.name = name ? name : '';
        if (schedule != undefined) {
            this.schedule = schedule;
        } else {
            this.schedule = [
                {
                    day: 'Lunes',
                    hours: [
                        false, false, false, false, false,
                        false, false, false, false, false,
                        false, false, false, false, false
                    ]
                },
                {
                    day: 'Martes',
                    hours: [
                        false, false, false, false, false,
                        false, false, false, false, false,
                        false, false, false, false, false
                    ]
                },
                {
                    day: 'Miercoles',
                    hours: [
                        false, false, false, false, false,
                        false, false, false, false, false,
                        false, false, false, false, false
                    ]
                },
                {
                    day: 'Jueves',
                    hours: [
                        false, false, false, false, false,
                        false, false, false, false, false,
                        false, false, false, false, false
                    ]
                },
                {
                    day: 'Viernes',
                    hours: [
                        false, false, false, false, false,
                        false, false, false, false, false,
                        false, false, false, false, false
                    ]
                },
                {
                    day: 'Sabado',
                    hours: [
                        false, false, false, false, false,
                        false, false, false, false, false,
                        false, false, false, false, false
                    ]
                }
            ];
        }
    }

    isBusyAt(day, hour) {
        if (this.indexOfDay(day) != -1) {
            if (this.indexOfHour(hour) != -1) {
                return this.schedule[this.indexOfDay(day)].hours[this.indexOfHour(hour)];
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    indexOfDay(day) {
        switch (day) {
            case 'Lunes':
                return 0;
            case 'Martes':
                return 1;
            case 'Miercoles':
                return 2;
            case 'Jueves':
                return 3;
            case 'Viernes':
                return 4;
            case 'Sabado':
                return 5;

            default:
                return -1;
        }
    }

    indexOfHour(hour) {
        switch (hour) {
            case '0630':
                return 0;
            case '0730':
                return 1;
            case '0830':
                return 2;
            case '0930':
                return 3;
            case '1030':
                return 4;
            case '1130':
                return 5;
            case '1230':
                return 6;
            case '1330':
                return 7;
            case '1430':
                return 8;
            case '1530':
                return 9;
            case '1630':
                return 10;
            case '1730':
                return 11;
            case '1830':
                return 12;
            case '1930':
                return 13;
            case '2030':
                return 14;

            default:
                return -1;
        }
    }

    toggleBusyAt(day, hour) {
        if (this.indexOfDay(day) != -1) {
            if (this.indexOfHour(hour) != -1) {
                this.schedule[this.indexOfDay(day)].hours[this.indexOfHour(hour)]
                    = !this.schedule[this.indexOfDay(day)].hours[this.indexOfHour(hour)];
            }
        }
    }

    getStreakAt(day, hour) {
        let response = 0;
        let hourIndex = this.indexOfHour(hour);
        while (hourIndex < 15 && !this.schedule[this.indexOfDay(day)].hours[hourIndex]) {
            response++;
            hourIndex++;
        }

        return response;
    }
}

export { Room }; 