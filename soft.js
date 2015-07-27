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

function get(object,key) { return object.get(key) }

SoftCursor.prototype.get = function(key) {
  return new SoftCursor(this.atom, this.path.concat(key))
}

SoftCursor.prototype.update = function(value) {
  var data = this.atom.value.setIn(this.path, value)
  this.atom.set(data)
}

module.exports = SoftCursor
