import {StatusCodeEnum} from "@/enums/status_code_enum";

class Result {

  flag

  data

  code

  message

  constructor() {
  }

  set setFlag (flag) {
    this.flag = flag
  }

  set setData (data) {
    this.data = data
  }

  set setCode (code) {
    this.code = code
  }

  set setMessage (message) {
    this.message = message
  }

  static ok = () => {
    return this.restResult(true, null, StatusCodeEnum.SUCCESS.code, StatusCodeEnum.SUCCESS.desc)
  }

  static okData = (data) => {
    return this.restResult(true, data, StatusCodeEnum.SUCCESS.code, StatusCodeEnum.SUCCESS.desc)
  }

  static fail = (status) => {
    return this.restResult(false, null, status.code, status.desc)
  }

  static restResult = (flag, data, code, message) => {
    const result = new Result()
    result.setFlag = flag
    result.setData = data
    result.setCode = code
    result.setMessage = message
    return result
  }
}

export {Result}
