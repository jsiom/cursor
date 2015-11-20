import {RootCursor,Cursor} from '..'
import {is,fromJS} from 'immutable'
import assert from 'assert'
import {wrap} from 'result'

var v, c
before(() => {
  v = fromJS({a:{b:1, c: [1,2,3]}})
  c = new RootCursor(v)
})

it('get value', () => {
  assert(is(c.value, fromJS({a:{b:1,c:[1,2,3]}})))
  assert(new Cursor(new Cursor(c, 'a'), 'b').value == 1)
})

it('set value', done => {
  c.addListener((newVal, oldVal) => {
    assert(is(oldVal, fromJS({a:{b:1,c:[1,2,3]}})))
    assert(is(newVal, fromJS({a:{b:2,c:[1,2,3]}})))
    done()
  })
  assert((new Cursor(new Cursor(c, 'a'), 'b').value = 2) == 2)
})

it('get()', () => {
  assert(c.get('a').get('b').value == 1)
  assert(c.get('a').get('c').get(0).value == 1)
  assert(new RootCursor([1,2,3]).get(0).value == 1)
})

it('with promises', () => {
  let c = new RootCursor(fromJS({a:{b:1, c: wrap([1,2,3])}}))
  let cursor = c.get('a').get('c').get(0)
  assert(cursor.value.value == 1)
})

it('getIn(...keys)', () => {
  assert(c.getIn('a','b').value == 1)
  assert(c.getIn('a').getIn('b').value == 1)
})
