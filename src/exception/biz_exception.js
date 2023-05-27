class BizException {

  #statusCode

  constructor(statusCode) {
    this.#statusCode = statusCode
  }

  get statusCode() {
    return this.#statusCode
  }
}

export {BizException}
