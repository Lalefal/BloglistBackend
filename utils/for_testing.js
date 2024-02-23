const reverse = string => {
  return string.split('').reverse().join('')
}

const average = array => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.length === 0 ? 0 : array.reduce(reducer, 0) / array.length
}
//jos taulukon pituus on 0, palautetaan 0 ja muussa tapauksessa
//palautetaan metodin reduce avulla laskettu keskiarvo
module.exports = {
  reverse,
  average,
}
