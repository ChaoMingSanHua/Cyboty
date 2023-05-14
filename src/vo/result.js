import {StatusCodeEnum} from "@/enums/status_code_enum";

class Result {

  #flag

  #data

  #code

  #message

  constructor() {
  }

  set setFlag (flag) {
    this.#flag = flag
  }

  set setData (data) {
    this.#data = data
  }

  set setCode (code) {
    this.#code = code
  }

  set setMessage (message) {
    this.#message = message
  }

  static ok = () => {
    const result = this.restResult(true, null, StatusCodeEnum.SUCCESS.code, StatusCodeEnum.SUCCESS.desc)
  }

  static okData = (data) => {
    const result = this.restResult(true, null, StatusCodeEnum.SUCCESS.code, StatusCodeEnum.SUCCESS.desc)
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
