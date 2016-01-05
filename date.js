import {ProxyCursor} from './index'

export class YearProxy extends ProxyCursor {
  get(date) { return date.getFullYear() }
  set(date, n) { return setDate(date, 'setFullYear', n) }
}

export class MonthProxy extends ProxyCursor {
  get(date) { return date.getMonth() }
  set(date, n) { return setDate(date, 'setMonth', n) }
}

export class DayProxy extends ProxyCursor {
  get(date) { return date.getDate() }
  set(date, n) { return setDate(date, 'setDate', n)}
}

export class HourProxy extends ProxyCursor {
  get(date) { return date.getHours() }
  set(date, n) { return setDate(date, 'setHours', n)}
}

export class MinuteProxy extends ProxyCursor {
  get(date) { return date.getMinutes() }
  set(date, n) { return setDate(date, 'setMinutes', n)}
}

export class SecondProxy extends ProxyCursor {
  get(date) { return date.getSeconds() }
  set(date, n) { return setDate(date, 'setSeconds', n)}
}

const setDate = (date, method, n) => {
  date = new Date(date)
  date[method](n)
  return date
}
