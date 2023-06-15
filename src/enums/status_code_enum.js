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
  },

  ARC_CENTER_ERROR: {
    code: 30003,
    desc: {
      title: "圆弧中心点规划错误",
      text: "圆弧中心接近起点或终点,更换路径点"
    }
  },

  ARC_POINT_ERROR: {
    code: 30004,
    desc: {
      title: "圆弧途径点规划错误",
      text: "圆弧的三点共线,更换路径点"
    }
  }
}

const getStatusFromCode = (code) => {
  for (const key in StatusCodeEnum) {
    if (StatusCodeEnum[key].code === code) {
      return StatusCodeEnum[key]
    }
  }
  return null
}

export {StatusCodeEnum, getStatusFromCode}
