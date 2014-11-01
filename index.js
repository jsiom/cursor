var inherit = require('inherit')

/**
 * Present a peice of data as if it was at the top level
 *
 * @param {Object} value
 * @param {String|Number} name
 * @param {Cursor} parent
 */

function Cursor(value, name, parent) {
  this.value = value
  this.name = name
  this.parent = parent
}

/**
 * Get a subset of the cursors data. If it turns out to be
 * another associative structure it will be wrapped in another
 * cursor
 *
 * @param {String} key
 * @return {Primitive|Cursor}
 */

Cursor.prototype.get = function(key) {
  var value = this.value.get(key)
  if (typeof value != 'object') return value
  return new Cursor(value, key, this)
}

/**
 * Associate a new value on this cursors data and recur
 * up the cursor tree. Will return a new cursor pointing
 * to the new data
 *
 * @param {String|Number} key
 * @param {Any} value
 * @return {Cursor}
 */

Cursor.prototype.set = function(key, value) {
  return this.update(this.value.set(key, value))
}

/**
 * Replace the cursors data within its parent
 *
 * @param {Any} newData
 * @return {Cursor}
 */

Cursor.prototype.update = function(newData) {
  var newParent = this.parent.set(this.name, newData)
  if (typeof newData != 'object') return newData
  return new Cursor(newData, this.name, newParent)
}

/**
 * A specialized Cursor to manage the top level atom
 *
 * @param {Atom} atom
 */

function RootCursor(atom) {
  this.value = atom.value
  this.atom = atom
}

inherit(RootCursor, Cursor)

/**
 * Alter the atoms value and return a new RootCursor pointing to
 * the new data
 *
 * @param {Any} newValue
 * @return {RootCursor}
 */

RootCursor.prototype.update = function(newValue) {
  this.atom.set(newValue)
  if (typeof newValue != 'object') return newValue
  return new RootCursor(this.atom)
}

RootCursor.prototype.set = function(key, value) {
  return this.update(this.value.set(key, value))
}

/**
 * Generate proxy methods. Each method will delegate to the
 * cursors value and return the resulting value. If the return
 * value is an associative it will be wrapped in a cursor
 * however changes are never propagated up so if you want to
 * affect the global state you will need to call `commit`
 */

;[
  'forEach',
  'filter',
  'reduce',
  'remove',
  'splice',
  'slice',
  'every',
  'push',
  'some'
].forEach(function(method){
  Cursor.prototype[method] = function() {
    var value = this.value[method].apply(this.value, arguments)
    if (typeof value != 'object') return value
    return new Cursor(value, this.name, this.parent)
  }
})

/**
 * Merge the changes you made to this cursor into the
 * global data structure
 *
 * @return {Cursor}
 */

Cursor.prototype.commit = function(){
  return this.update(this.value)
}

/**
 * ensure each value is wrapped in a cursor
 *
 * @param {Function} fn
 * @return {Cursor}
 */

Cursor.prototype.map = function(fn){
  var list = this.value.map(function(value, key){
    return fn(this.get(key), key, this)
  }, this)
  return new Cursor(list, this.name, this.parent)
}

/**
 * Set multiple keys in one transaction
 *
 * @param {Object} map
 * @return {Cursor}
 */

Cursor.prototype.merge = function(map){
  var value = this.value
  for (var key in map) value = value.set(key, map[key])
  return this.update(value)
}

Cursor.prototype.toJSON = function() {
  return this.value.toJSON()
}

module.exports = RootCursor
RootCursor.SubCursor = Cursor
