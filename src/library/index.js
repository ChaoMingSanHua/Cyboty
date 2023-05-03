import ConfigDialog from "@/components/dialog/BackConfiguration"
import fixed from "@/directives/fixed";
import toFixed from "@/filters/to_fixed";

const fractionDigits = 4

const components = [
  ConfigDialog
]

const directives = [
  fixed(fractionDigits)
]

const filters = {
  'toFixed': toFixed(fractionDigits)
}

export default {
  install: app => {
    components.forEach(component => {
      // 在app上进行扩展，app提供 component directive 函数
      // 如果要挂载原型 app.config.globalProperties 方式
      app.component(component.__name, component);
    });
    directives.forEach(directive => {
      app.directive(directive.name, directive)
    })
    app.config.globalProperties.$filters = filters
  }
}
