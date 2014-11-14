
var immutable = require('immutable')
var Atom = require('atom')
var Cursor = require('..')
var eql = immutable.is

var v, a, c
before(function(){
  v = immutable.fromJS({a:{b:1, c: [1,2,3]}})
  a = new Atom(v)
  c = new Cursor(a)
})

it('get', function(){
  assert(c.get('a') instanceof Cursor.SubCursor)
  assert(c.get('a').get('b') instanceof Cursor.SubCursor)
  assert(c.get('a').get('c').get(0) instanceof Cursor.SubCursor)
  assert(c.get('a').get('b').value == 1)
  assert(c.get('a').get('c').get(0).value == 1)
})

it('update', function(done){
  a.addListener(function(newVal, oldVal){
    assert(eql(oldVal, immutable.fromJS({a:{b:1,c:[1,2,3]}})))
    assert(eql(newVal, immutable.fromJS({a:{b:2,c:[1,2,3]}})))
    done()
  })
  c.get('a').get('b').update(2)
  assert.throws(function(){ c.update() }, /double update/)
})

it('destroy', function(){
  c.get('a').get('c').destroy()
  assert(eql(a.value, immutable.fromJS({a:{b:1}})))
})

it('call', function(){
  assert(c.get('a').get('b').call(v) == 1)
})
