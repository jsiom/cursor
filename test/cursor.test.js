
var immutable = require('immutable')
var Atom = require('atom')
var cursor = require('..')
var eql = immutable.is

describe('hard cursors', function(){
  var v = immutable.fromJS({a:{b:1, c: [1,2,3]}})
  var a = new Atom(v)
  var c = cursor(a)

  it('get', function(){
    assert(c.get('a') instanceof cursor.Hard)
    assert(c.get('a').get('b') == 1)
    assert(c.get('a').get('c').get(0) == 1)
  })

  it('set', function(done){
    assert(c.set('a', 1) instanceof cursor.Hard)
    assert(c.set('a', 1) != c)
    assert(c.value === v)
    assert(eql(c.set('a', 1).value, immutable.fromJS({a:1})))
    assert(c.set('a', 1).get('a') == 1)
    assert(c.get('a').get('b') == 1)
    assert(c.get('a').set('b', 2) instanceof cursor.Hard)
    assert(c.get('a').set('b', 2) != c)
    assert(c.get('a').set('b', 2).get('b') == 2)
    a.addListener(function(newVal, oldVal){
      assert(eql(oldVal, immutable.fromJS({a:{b:2,c:[1,2,3]}})))
      assert(eql(newVal, immutable.fromJS({a:{b:1,c:2}})))
      done()
    })
    c.get('a').set('c', 2)
  })
})

describe('soft cursors', function(){
  var v = immutable.fromJS({a:{b:1, c: [1,2,3]}})
  var a = new Atom(v)
  var c = cursor(a, 'soft')

  it('get', function(){
    assert(c.get('a') instanceof cursor.Soft)
    assert(c.get('a').get('b') == 1)
    assert(c.get('a').get('c').get(0) == 1)
  })

  it('set', function(done){
    assert(c.set('a', 1) == 1)
    assert(a.value !== v)
    assert(a.value === c.value)
    assert(eql(a.value, immutable.fromJS({a:1})))
    assert(c.get('a') == 1)
    c.set('a', immutable.fromJS([1,2,3]))
    a.addListener(function(newVal, oldVal){
      assert(eql(oldVal, immutable.fromJS({a:[1,2,3]})))
      assert(eql(newVal, immutable.fromJS({a:[3,2,3]})))
      done()
    })
    assert(c.get('a').set(0, 3) == 3)
  })
})
