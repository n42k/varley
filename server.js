function _Sheet(image, width, height) {
  this.width = width
  this.height = height
}

function Sheet(image, width, height) {
  return new _Sheet(image, width, height)
}
