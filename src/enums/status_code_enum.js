const StatusCodeEnum = {
  SUCCESS: {
    code: 20000,
    desc: "操作成功"
  },

  SINGULARITY: {
    code: 30001,
    desc: "接近奇异点"
  },

  OUT_OF_WORKSPACE: {
    code: 30002,
    desc: "超出工作空间"
  }
}

export {StatusCodeEnum}
