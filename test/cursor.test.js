
var immutable = require('immutable')
var Atom = require('atom')
var Cursor = require('..')
var eql = immutable.is

var v = immutable.fromJS({a:{b:1, c: [1,2,3]}})
var a = new Atom(v)
var c = new Cursor(a)

it('get', function(){
  assert(c.get('a') instanceof Cursor.SubCursor)
  assert(c.get('a').get('b') instanceof Cursor.SubCursor)
  assert(c.get('a').get('c').get(0) instanceof Cursor.SubCursor)
  assert(c.get('a').get('b').value == 1)
  assert(c.get('a').get('c').get(0).value == 1)
})

it('set', function(){
  assert(c.set('a', 1) instanceof Cursor.SubCursor)
  assert(c.set('a', 1) != c)
  assert(c.value === v)
  assert(c.get('a').set('b', 2) instanceof Cursor.SubCursor)
  assert(eql(c.get('a').set('b', 2).value, v.get('a').set('b', 2)))
  assert(c.get('a').set('b', 2).get('b').value == 2)
})

it('update', function(done){
  a.addListener(function(newVal, oldVal){
    assert(eql(oldVal, immutable.fromJS({a:{b:2,c:[1,2,3]}})))
    assert(eql(newVal, immutable.fromJS({a:{b:1,c:2}})))
    done()
  })
  c.get('a').get('c').update(2)
})
