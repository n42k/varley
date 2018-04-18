let A = 0
let S = 1

function _Sheet(image, width, height) {
  this.width = width
  this.height = height

  let dimensions = sizeOf('resources/' + image)
  this.columns = dimensions.width / this.width
  this.rows = dimensions.height / this.height

  if(this.rows % 1 != 0 || this.columns % 1 != 0)
    throw new Error('Sheet(' + image + ', ' + this.width + ', ' + this.height + ') has invalid width/height!')
}

function Sheet(image, width, height) {
  return new _Sheet(image, width, height)
}
