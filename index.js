/**
 * Provides a way to focus on parts of a large immutable data structure
 * while still making updates globally available
 *
 * @param {Cursor} parent
 * @param {Any}    key
 */

class Cursor {
  constructor(parent, key) {
    this.parent = parent
    this.key = key
  }

  /**
   * Create a new cursor focused on a subset of this one
   *
   * @param  {Any} key
   * @return {Cursor}
   */

  get(key) {
    return new Cursor(this, key)
  }

  /**
   * Get the current value this cursor points to
   * @return {Any}
   */

  get value() {
    return this.parent.value.get(this.key)
  }

  /**
   * Update the global data structure so the section of it
   * controlled by this cursor is replaced by `data`
   *
   * @param  {Any} data
   * @return {Any} data
   */

  set value(data) {
    this.parent.value = this.parent.value.set(this.key, data)
    return data
  }

  /**
   * Apply this cursor to another data structure
   *
   * @param {Any} data
   * @return {Any}
   */

  call(data) {
    return this.parent.call(data).get(this.key)
  }

  /**
   * Remove the Cursors value from the global data structure
   */

  destroy() {
    this.parent.value = this.parent.value.remove(this.key)
  }
}

class RootCursor {
  constructor(atom) {
    this.atom = atom
  }
  get(key) {
    return new Cursor(this, key)
  }
  get value() {
    return this.atom.value
  }
  set value(data) {
    return this.atom.set(data)
  }
  call(data) {
    return data
  }
  destroy() {
    this.atom.set(null)
  }
}

/**
 * Generate proxy methods. Each method will delegate to the
 * cursors value and update itself with the return value
 */

[
  'filter',
  'reduce',
  'remove',
  'splice',
  'slice',
  'merge',
  'push',
  'set',
  'map',
].forEach(method => {
  RootCursor.prototype[method] =
  Cursor.prototype[method] = function() {
    var value = this.value
    return this.value = value[method].apply(value, arguments)
  }
})

export default RootCursor
export {Cursor,RootCursor}
