import * as moment from 'moment';
export async function sleep(millisecond: number) {
  return new Promise((resolve) => setTimeout(resolve, millisecond));
}

export function getWeekYear(createTable: boolean) {
  let week: string | number = moment(moment().format('YYYY-MM-DD')).isoWeek();

  let year = moment(moment().format('YYYY-MM-DD')).isoWeekYear();

  // 创建下一周的表
  createTable && week++;
  if (week > 53) {
    week = 1;
    year++;
  }
  if (week < 10) {
    week = '0' + week;
  }
  return year + '' + week;
}
