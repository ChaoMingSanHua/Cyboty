import {createStore} from "vuex";
import createPersistedState from "vuex-persistedstate"
import * as math from "mathjs"
import {Transformation} from "@/utils/transformation";
import {robot} from "@/utils/robot";

export default createStore({
  state: {
    configComplete: false,

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

    robotType: 0,
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
    T: (state) => {
      return robot.fKine([...state.Q])
    },
    X: ((state, getters) => {
      return Transformation.TransToX(getters.T)
    }),
    R: ((state, getters) => {
      // return getters.T.subset(math.index(math.range(0, 3), math.range(0, 3)))
      return Transformation.TransToRp(getters.T).R
    }),
    quaternion: ((state, getters) => {
      return Transformation.RToQuaternion(getters.R)
    }),
    axisAngle: ((state, getters) => {
      return Transformation.RToAxisAngle(getters.R)
    }),
    Jacobian: (state) => {
      return robot.getJacobian([...state.Q])
    }
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

      state.configComplete = true
    },
    clearConfirm(state) {
      state.configComplete = false
    },
    setQ(state, qs) {
      qs.forEach((value, index) => {
        state.Q[index] = value
      })
    }

  },
  actions: {
  },
  modules: {
  },
  plugins: [
    // createPersistedState({
    //   storage: window.sessionStorage
    // })
  ]
})
