import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

export default dayjs;

export function getMonthDateRange(year: number, month: number) {
  const start_date = dayjs().utc().year(year).month(month).startOf('month');
  const end_date = dayjs().utc().year(year).month(month).endOf('month');

  return { start_date, end_date };
}

export function getWeekDateRange(year: number, week: number) {
  const start_date = dayjs().utc().year(year).week(week).startOf('week');
  const end_date = dayjs().utc().year(year).week(week).endOf('week');

  return { start_date, end_date };
}
