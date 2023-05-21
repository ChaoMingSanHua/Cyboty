const StatusCodeEnum = {
  SUCCESS: {
    code: 20000,
    desc: {
      title: "操作成功",
      text: ""
    },
  },

  SINGULARITY: {
    code: 30001,
    desc: {
      title: "接近奇异点",
      text: "运行关节运动远离奇异点"
    }
  },

  OUT_OF_WORKSPACE: {
    code: 30002,
    desc: {
      title: "超出工作空间",
      text: "减小运动范围"
    }
  }
}

export {StatusCodeEnum}
