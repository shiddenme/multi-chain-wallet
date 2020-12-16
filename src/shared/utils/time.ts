import * as moment from 'moment';
export async function sleep(millisecond: number) {
  return new Promise((resolve) => setTimeout(resolve, millisecond));
}

function getCurrentWeek() {
  return moment().unix() / 604800;
}
