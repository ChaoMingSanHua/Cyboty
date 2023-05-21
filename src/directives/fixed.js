const fixed = (fractionDigits) => {
  return {
    name: 'fixed',
    mounted: (el, binding) => {
      const digit = binding.value.digit === undefined ? fractionDigits : binding.value.digit
      const key = typeof binding.value.key === 'string' ? binding.value.key : binding.value.key.toString()
      if (binding.value.index !== undefined) {
        el.value = binding.value.obj[binding.value.key][binding.value.index].toFixed(digit)
      } else {
        el.value = binding.value.obj[key].toFixed(digit)
      }
      el.onblur = (event) => {
        if (binding.value.index !== undefined) {
          binding.value.obj[key][binding.value.index] = parseFloat(parseFloat(event.target.value).toFixed(digit))
          el.value = binding.value.obj[binding.value.key][binding.value.index].toFixed(digit)
          return
        }
        binding.value.obj[key] = parseFloat(parseFloat(event.target.value).toFixed(digit))
        el.value = binding.value.obj[key].toFixed(digit)
      }
    },
    updated: (el, binding) => {
      const digit = binding.value.digit === undefined ? fractionDigits : binding.value.digit
      const key = typeof binding.value.key === 'string' ? binding.value.key : binding.value.key.toString()
      if (binding.value.index !== undefined) {
        el.value = binding.value.obj[binding.value.key][binding.value.index].toFixed(digit)
      } else {
        el.value = binding.value.obj[key].toFixed(digit)
      }
    }
  }
}

export default fixed
