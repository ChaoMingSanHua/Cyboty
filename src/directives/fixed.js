const fixed = (fractionDigits) => {
  return {
    name: 'fixed',
    mounted: (el, binding) => {
      const key = typeof binding.value.key === 'string' ? binding.value.key : binding.value.key.toString()
      if (binding.value.index !== undefined) {
        el.value = binding.value.obj[binding.value.key][binding.value.index].toFixed(fractionDigits)
      } else {
        el.value = binding.value.obj[key].toFixed(fractionDigits)
      }
      el.onblur = (event) => {
        if (binding.value.index !== undefined) {
          binding.value.obj[key][binding.value.index] = parseFloat(parseFloat(event.target.value).toFixed(fractionDigits))
          el.value = binding.value.obj[binding.value.key][binding.value.index].toFixed(fractionDigits)
          return
        }
        binding.value.obj[key] = parseFloat(parseFloat(event.target.value).toFixed(fractionDigits))
        el.value = binding.value.obj[key].toFixed(fractionDigits)
      }
    }
  }
}

export default fixed
