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
 * Get this cursors value in `data`
 *
 * @param {Any} data
 * @return {Any}
 */

Cursor.prototype.call = function(data) {
  return this.parent.call(data).get(this.name)
}

/**
 * Remove the Cursors value from the global data structure
 */

Cursor.prototype.destroy = function() {
  return this.parent.remove(this.name)
}

Object.defineProperty(Cursor.prototype, 'isCurrent', {
  get: function(){ return this.parent.isCurrent }
})

Cursor.prototype.toJSON = function() {
  return this.value.toJSON()
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

RootCursor.prototype = Object.create(Cursor.prototype)

/**
 * Alter the atoms value and return a new RootCursor pointing to
 * the new data
 *
 * @param {Any} newValue
 * @return {RootCursor}
 */

RootCursor.prototype.update = function(newValue) {
  if (this.value !== this.atom.value) throw new Error('double update')
  this.atom.set(newValue)
  return new RootCursor(this.atom)
}

RootCursor.prototype.call = function identity(data){ return data }

Object.defineProperty(RootCursor.prototype, 'isCurrent', {
  get: function(){ return this.atom.value === this.value }
})

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
