const randInt = (factor = 10) => {
  const random = Math.random() * factor
  return parseInt(random, 10) + 1
}

const randFloat = (factor = 10, fix = 2) => {
  const random = Math.random() * factor
  return parseFloat(random).toFixed(fix)
}

export default {
  randInt,
  randFloat
}
