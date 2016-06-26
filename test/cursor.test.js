/* global before, it */
import RootCursor,{Cursor,Reference} from '..'
import {is,fromJS} from 'immutable'
import assert from 'assert'
import {wrap} from 'result'

var v, c
before(() => {
  v = fromJS({a:{b:1, c: [1,2,3]}})
  c = new RootCursor(v)
})

it('removeListener', done => {
  assert(c.onChange.length == 0)
  c.addListener(done)
  assert(c.onChange[0] == done)
  c.removeListener(done)
  assert(c.onChange.length == 0)
  done()
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
  function Graph(value) {
    this.edge = value
  }
  const a = new Graph('hi')
  const r = new RootCursor(a)
  r.get('edge').value = 'bye'
  assert(a.edge == 'hi')
  assert(r.get('edge').value == 'bye')
})

it('get()', () => {
  assert(c.get('a').get('b').value == 1)
  assert(c.get('a').get('c').get(0).value == 1)
  assert(new RootCursor([1,2,3]).get(0).value == 1)
})

it('with promises', () => {
  let c = new RootCursor(fromJS({a:{b:1, c: wrap([1,2,3])}}))
  let cursor = c.get('a').get('c').get(0)
  assert(cursor.value == 1)
})

it('getIn(...keys)', () => {
  assert(c.getIn('a','b').value == 1)
  assert(c.getIn('a').getIn('b').value == 1)
})

it('get References', () => {
  const v = {a: {b:1},
             b: new Reference('a', 'b'),
             c: new Reference('b')}
  const c = new RootCursor(v)
  assert(c.get('b').value == 1)
  assert(c.get('c').value == 1)
})

it('set References', () => {
  const v = {a: {b:1},
             b: new Reference('a', 'b'),
             c: new Reference('b')}
  const c = new RootCursor(v)
  c.get('b').value = 2
  assert(c.get('a').get('b').value == 2)
  c.get('c').value = 3
  assert(c.get('a').get('b').value == 3)
})

it('defaults', () => {
  assert(new RootCursor({}).get('a', 1).value == 1)
})
