import * as moment from 'moment-timezone';

export class ReportDateUtils {
  date: Date;

  constructor(date: Date) {
    this.date = moment(new Date(date.toISOString().split('T')[0]))
      .tz('America/Los_Angeles')
      .toDate();
  }

  addDays(days: number) {
    return new Date(new Date(this.date.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  }

  getDays(to: Date) {
    return to.getTime() / (24 * 60 * 60 * 1000) - this.date.getTime() / (24 * 60 * 60 * 1000);
  }

  static splitDate(from: ReportDateUtils, to: ReportDateUtils, daysBetween: number) {
    const result: { from: ReportDateUtils; to: ReportDateUtils }[] = [];
    let currentDate = new ReportDateUtils(from.date);
    while (currentDate.date.getTime() < to.date.getTime()) {
      result.push({
        from: new ReportDateUtils(currentDate.date),
        to: new ReportDateUtils(
          currentDate.addDays(daysBetween).getTime() < to.date.getTime() ? currentDate.addDays(daysBetween) : to.date,
        ),
      });
      currentDate = new ReportDateUtils(currentDate.addDays(daysBetween + 1));
    }
    if (result.length === 0) {
      result.push({
        from,
        to,
      });
    }
    return result;
  }
}
