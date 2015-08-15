const {is,fromJS} = require('immutable')
const {RootCursor,Cursor} = require('..')
const Atom = require('atom')

var v, a, c
before(() => {
  v = fromJS({a:{b:1, c: [1,2,3]}})
  a = new Atom(v)
  c = new RootCursor(a)
})

it('get value', () => {
  assert(is(c.value, fromJS({a:{b:1,c:[1,2,3]}})))
  assert(new Cursor(new Cursor(c, 'a'), 'b').value == 1)
})

it('set value', done => {
  a.addListener((newVal, oldVal) => {
    assert(is(oldVal, fromJS({a:{b:1,c:[1,2,3]}})))
    assert(is(newVal, fromJS({a:{b:2,c:[1,2,3]}})))
    done()
  })
  assert((new Cursor(new Cursor(c, 'a'), 'b').value = 2) == 2)
})

it('get()', () => {
  assert(c.get('a').get('b').value == 1)
  assert(c.get('a').get('c').get(0).value == 1)
})
