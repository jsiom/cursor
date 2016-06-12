import {softUnbox} from 'result'

/**
 * Provides a way to focus on parts of a large immutable data structure
 * while still making updates globally available
 *
 * @param {Cursor} parent
 * @param {Any}    key
 */

export class Cursor {
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
   * Like get but can step down several levels at once
   *
   * @param  {Any} ...keys
   * @return {Cursor}
   */

  getIn(...keys) {
    return keys.reduce((cursor, key) => cursor.get(key), this)
  }

  get root() {
    return this.parent.root
  }

  /**
   * Get the current value this cursor points to
   * @return {Any}
   */

  get value() {
    return getKey(this.parent.value, this)
  }

  /**
   * Update the global data structure so the section of it
   * controlled by this cursor is replaced by `data`
   *
   * @param  {Any} data
   * @return {Any} data
   */

  set value(data) {
    this.parent.value = setKey(this.parent.value, this.key, data)
    return data
  }

  /**
   * Apply this cursor to another data structure
   *
   * @param {Any} data
   * @return {Any}
   */

  call(data) {
    return getKey(this.parent.call(data), this)
  }

  /**
   * Remove the Cursors value from the global data structure
   */

  destroy() {
    this.parent.value = this.parent.value.remove(this.key)
  }
}

export default class RootCursor {
  constructor(value) {
    this._value = value
    this.onChange = []
  }
  get root() {
    return this
  }
  get value() {
    return this._value
  }
  set value(newValue) {
    const array = this.onChange
    const oldValue = this._value
    this._value = newValue
    for (var i = 0, len = array.length; i < len; i++) {
      array[i](newValue, oldValue)
    }
    return newValue
  }
  call(data) {
    return data
  }
  destroy() {
    this._value = null
  }
  addListener(fn) {
    this.onChange.push(fn)
  }
  removeListener(fn) {
    const i = this.onChange.findIndex(f => f === fn)
    if (i >= 0) this.onChange.splice(i , 1)
  }
}

/**
 * For presenting objects which don't implement get/set methods
 * for altering their attributes. e.g. Date's
 */

export class ProxyCursor {
  constructor(parent) {
    this.parent = parent
  }
  get root() {
    return this.parent.root
  }
  get value() {
    return this.get(this.parent.value)
  }
  set value(n) {
    return this.parent.value = this.set(this.parent.value, n)
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
    const value = this.value
    const fn = value[method] || defaults[method]
    if (typeof fn != 'function') throw new Error(`${method} is not implemented`)
    return this.value = fn.apply(value, arguments)
  }
})

const defaults = {
  merge(b) {
    const a = Object.create(this)
    for (var key in b) {
      a[key] = b[key]
    }
    return a
  },
  set(key, value) {
    return setKey(this, key, value)
  }
}

RootCursor.prototype.get = Cursor.prototype.get
RootCursor.prototype.getIn = Cursor.prototype.getIn

const getKey = (object, cursor) => {
  const value = softUnbox(typeof object.get == 'function'
    ? object.get(cursor.key)
    : object[cursor.key])
  return value instanceof Reference
    ? value.call(cursor.root)
    : value
}

const setKey = (object, key, value) =>
  typeof object.set == 'function'
    ? object.set(key, value)
    : assoc(object, key, value)

const assoc = (object, key, value) => {
  const o = Object.create(object)
  o[key] = value
  return o
}

export function Reference(...path) {
  this.path = path
}

Reference.prototype.call = function(root) {
  for (const key of this.path) {
    root = root.get(key)
  }
  return root.value
}
