const toFixed = (fractionDigits) => (value) => {
  if (value === null) {
    return "--"
  }
  return value.toFixed(fractionDigits)
}

export default toFixed
