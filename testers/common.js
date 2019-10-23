const test = require('tape');
const itsadate = require('../index.js');
const parse = itsadate.parse;
const settings = itsadate.settings;
const moment = require('moment');

test('month and year only', t => {
  actual = parse('11/1990').getMonth();
  t.equal(actual, 10);

  actual = parse('08/2021').getMonth();
  t.equal(actual, 7);

  actual = parse('08/2021').getFullYear();
  t.equal(actual, 2021);
  t.end();
});

test('alternative settings day', t => {
  const actual = parse('11/1/1990', { day_before_month: false }).getDate();
  t.equal(actual, 1);
  t.end();
});

test('normal settings day', t => {
  const actual = parse('11/1/1990', { day_before_month: true }).getDate();
  t.equal(actual, 11);
  t.end();
});

test('GMT Tests', t => {
  var date = new Date();
  var ilNow = parse('now');
  t.equal(date.getHours(), ilNow.getHours(), 'auto gmt');

  settings({ gmt: -2.5 });
  const gmt_minus_5_halfs = parse('now');

  settings({ gmt: 1.5 });
  const gmt_plus_3_halfs = parse('now');

  t.equal(gmt_minus_5_halfs.getHours(), gmt_plus_3_halfs.getHours() - 4, 'gmt -2.5 & +1.5');

  settings({ gmt: 'auto' });
  t.equal(parse('11:00 PM').getHours(), 23, 'am/pm 11 pm');
  t.equal(parse('12:00 PM').getHours(), 12, 'am/pm 12 pm');

  t.equal(parse('June 18, 2015').getDate(), 18, 'June 18, 2015');

  settings({ gmt: 3 });
  settings().restore();

  t.end();
});

test('GMT restore settings', t => {
  var gmt = settings('gmt');
  t.equal(gmt, 'auto', 'restore settings');

  t.end();
});

test('Base Date Tests', t => {
  settings({ base_date: new Date(1999, 11, 31) });
  t.equal(parse('May').valueOf(), new Date(1999, 04, 31).valueOf());
  t.end();
});

test('hours of now', t => {
  t.equal(parse('now').getHours(), new Date().getHours());
  t.end();
});

test('Bugs', t => {
  settings({ day_before_month: false });
  test(parse('02.05.2015, 12:13').getMonth(), 1, 'feb bug');

  settings({ day_before_month: false });
  t.equal(parse('2015-11-2').getDate(), 2, 'day before month dd/mm/yyyy');

  settings().restore();
  //    /(?:^|\b)(\d{1,2}):(\d{1,2})(?::\d{1,2})?\s*(am|pm)?(?:$|\b)/
  t.equal(parse('16:29:15').getMinutes(), 29, ' minutes');
  t.equal(parse('16:29').getMinutes(), 29, ' minutes');

  settings({ day_before_month: false });
  t.equal(parse('2015.11.08 04:09:46').getDate(), 08, ' minutes');
  settings().restore();

  t.end();
});

test('Doron test', t => {
  t.equal(parse('2 days before 1 days after tomorrow').getDate(), parse('now').getDate());

  t.end();
});

test('auto hint switch', t => {
  // Doesn't work according to day_before_month hint, but because it is not in strict mode, it will try the other way around
  t.equal(parse('2016-09-21').getDate(), 21);
  t.end();
});

test('h&m', t => {
  t.equal(parse('15:00').getHours(), parse('15:00 1h').getHours() + 1);
  t.equal(parse('15:50').getMinutes(), parse('15:50 25m').getMinutes() + 25);
  t.end();
});

test('Chenese Hack', t => {
  var d = parse('2017年-Apr-25日 13:22');

  t.equal(d.getDate(), 25);
  t.equal(d.getMonth(), 3);
  t.equal(d.getFullYear(), 2017);
  t.end();
});

exports.wrapper = function(description, fn) {
  test(description, t => {
    const m = setup();
    fn(t, m);
    t.end();
  });
};

function setup() {
  const now = new Date();
  const date = moment(now);

  return date;
}
