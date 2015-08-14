const {is,fromJS} = require('immutable')
const {RootCursor,Cursor,SymLink} = require('..')
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

describe('symlinks', () => {
  before(() => {
    c.get('a').get('d').value = new SymLink('../a/e')
    c.get('a').get('e').value = new SymLink('./c/2')
  })

  it('get value', () => {
    assert(c.get('a').get('e').value == 3)
    assert(c.get('a').get('d').value == 3)
  })

  it('set value', () => {
    assert((c.get('a').get('d').value = 'changed') == 'changed')
    assert(c.get('a').get('d').value == 'changed')
    assert(c.get('a').get('c').get(2).value == 'changed')
  })
})
