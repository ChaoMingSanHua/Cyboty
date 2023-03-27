import {createStore} from "vuex";
import createPersistedState from "vuex-persistedstate"
import * as math from "mathjs"
import * as transformation from "@/utils/transformation";
import * as robot from "@/utils/robot"

export default createStore({
  state: {
    // DH Parameter
    Alpha: [0.0, Math.PI / 2, 0.0, Math.PI / 2, -Math.PI / 2, Math.PI / 2],
    A: [0.0, 0.05, 0.43, 0.05, 0.0, 0.0],
    D: [0.376, 0.0, 0.0, 0.4275, 0.0, 0.089],
    Theta: [0.0, Math.PI / 2, 0.0, 0.0, 0.0, 0.0],

    // Q
    Q: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],

    // Joint Limit
    qLowerLimit: [-Math.PI / 2, -Math.PI / 2, -Math.PI / 2, -Math.PI / 2, -Math.PI / 2, -Math.PI / 2],
    qUpperLimit: [Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2],
  },
  getters: {
    dhPara: (state) => {
      return {
        Alpha: state.Alpha,
        A: state.A,
        D: state.D,
        Theta: state.Theta
      }
    },
    T: (state, getters) => {
      // const getTransformationMatrixMDH = (alpha, a, d, theta, q) => {
      //   theta += q
      //   return math.matrix([
      //     [Math.cos(theta), -Math.sin(theta), 0, a],
      //     [Math.sin(theta) * Math.cos(alpha), Math.cos(theta) * Math.cos(alpha), -Math.sin(alpha), -d * Math.sin(alpha)],
      //     [Math.sin(theta) * Math.sin(alpha), Math.cos(theta) * Math.sin(alpha), Math.cos(alpha), d * Math.cos(alpha)],
      //     [0, 0, 0, 1]
      //   ])
      // }
      // const fKine = (Q) => {
      //   let T = math.identity(4);
      //   for (let index = 0; index < Q.length; index++) {
      //     T = math.multiply(T, getTransformationMatrixMDH(state.Alpha[index], state.A[index], state.D[index], state.Theta[index], Q[index]))
      //   }
      //   return T
      // }
      return robot.fKine(getters.dhPara, state.Q)
    },
    px: ((state, getters) => {
      return getters.T.get([0, 3])
    }),
    py: ((state, getters) => {
      return getters.T.get([1, 3])
    }),
    pz: ((state, getters) => {
      return getters.T.get([2, 3])
    }),
    roll: ((state, getters) => {
      return transformation.R2rpy(getters.T)[0]
    }),
    pitch: ((state, getters) => {
      return transformation.R2rpy(getters.T)[1]
    }),
    yaw: ((state, getters) => {
      return transformation.R2rpy(getters.T)[2]
    }),
    X: ((state, getters) => {
      return [getters.px, getters.py, getters.pz, getters.roll, getters.pitch, getters.yaw]
    })
  },
  mutations: {
    confirm(state, paras) {
      state.D[0] = paras[0].value
      state.A[1] = paras[1].value
      state.A[2] = paras[2].value
      state.D[2] = paras[3].value
      state.A[3] = paras[4].value
      state.D[3] = paras[5].value
      state.D[5] = paras[6].value
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [
    createPersistedState({
      storage: window.sessionStorage
    })
  ]
})
