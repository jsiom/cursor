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
  var newData = this.value.set(key, value)
  var newParent = this.parent.set(this.name, newData)
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
 * @param {String|Number} key
 * @param {Any} value
 * @return {RootCursor}
 */

RootCursor.prototype.set = function(key, value) {
  this.atom.set(this.value.set(key, value))
  return new RootCursor(this.atom)
}

/**
 * A cursor which always uses the latest value of the root atom
 *
 * @param {Atom} atom
 * @param {Array} [path]
 */

function SoftCursor(atom, path) {
  this.atom = atom
  this.path = path || []
}

/**
 * Provide the cursors latest value as `cursor.value` to match
 * the hard cursor API
 *
 * @return {Associative}
 */

Object.defineProperty(SoftCursor.prototype, 'value', {
  get: function(){ return this.path.reduce(get, this.atom.value) }
})

SoftCursor.prototype.get = function(key) {
  var value = this.value.get(key)
  if (typeof value != 'object') return value
  return new SoftCursor(this.atom, this.path.concat(key))
}

SoftCursor.prototype.set = function(key, value) {
  var path = this.path
  var oldVals = Array(path.length)
  var oldVal = this.atom.value
  var i = 0
  for (var i = 0, len = path.length; i < len; i++) {
    oldVals[i]  = oldVal
    oldVal = oldVal.get(path[i])
  }
  var newVal = oldVal.set(key, value)
  while (i--) {
    var key = path[i]
    var parent = oldVals[i]
    newVal = parent.set(key, newVal)
  }
  this.atom.set(newVal)
  return value
}

function get(data, key) {
  return data.get(key)
}

/**
 * Create a cursor into an atom
 *
 * @param {Atom} atom
 * @param {String} [type]
 * @return {Cursor}
 */

function createCursor(atom, type) {
  return type == 'soft'
    ? new SoftCursor(atom)
    : new RootCursor(atom)
}

module.exports = exports = createCursor
exports.Hard = Cursor
exports.Soft = SoftCursor
