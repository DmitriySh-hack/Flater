class CalendarDTO {
    id;
    advertisement_id;
    user_id;
    start_date;
    end_date;
    created_at;

    constructor(module) {
        this.id = module.id;
        this.advertisement_id = module.advertisement_id;
        this.user_id = module.user_id;
        this.start = module.start_date ? module.start_date.toISOString().split('T')[0] : null;
        this.end = module.end_date ? module.end_date.toISOString().split('T')[0] : null;
        this.created_at = module.created_at;
    }
}

module.exports = CalendarDTO
