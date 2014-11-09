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
 * Get a cursor to a subset of this cursors value
 *
 * @param {String} key
 * @return {Primitive|Cursor}
 */

Cursor.prototype.get = function(key) {
  return new Cursor(this.value.get(key), key, this)
}

/**
 * Replace the cursors data within its parent
 *
 * @param {Any} newData
 * @return {Cursor}
 */

Cursor.prototype.update = function(newData) {
  var data = this.parent.value.set(this.name, newData)
  var newParent = this.parent.update(data)
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
  return new RootCursor(this.atom)
}

Cursor.prototype.toJSON = function() {
  return this.value.toJSON()
}

/**
 * Generate proxy methods. Each method will delegate to the
 * cursors value and update itself with the return value
 */

;[
  'filter',
  'reduce',
  'remove',
  'splice',
  'slice',
  'merge',
  'push',
  'set',
  'map',
].forEach(function(method){
  Cursor.prototype[method] = function() {
    return this.update(this.value[method].apply(this.value, arguments))
  }
})

module.exports = RootCursor
RootCursor.SubCursor = Cursor
