<template>
  <v-card class="container animated zoomIn">
    <div class="canvas" ref="container"></div>
  </v-card>
</template>

<script setup>
import {onMounted, ref, reactive, watch} from "vue";
import * as THREE from 'three'
import {useStore} from "vuex"
import {RobotService} from "@/services/robotService";
import {RobotTypeEnum} from "@/utils/robot";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader'
import {OrthographicCamera} from "three";

const container = ref()

const qDelta = reactive({
  list: [0, 0, 0, 0, 0, 0]
})

const store = useStore()
const dof = 6

const joints = []
const jointRotationAxises = []

const scene = new THREE.Scene()
const stlLoader = new STLLoader()
// 4,创建相机对象
// const k = width / height;
// const s = 200;
const camera = new OrthographicCamera();
camera.up.x = 0
camera.up.y = 0
camera.up.z = 1;
camera.position.set(10, 10, 10);
camera.lookAt(scene.position);

// 5，创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor('rgba(135,206,250,0.5)',1.0)

onMounted(async () => {
  const width = container.value.offsetWidth;
  const height = container.value.offsetHeight;
  renderer.setSize(width, height);
  container.value.appendChild(renderer.domElement)

  await loadSTL()
  loadOther()
  render()
})


let loopId = null
function render() {
  for (let i = 0; i < dof; i++) {
    joints[i].rotateOnAxis(jointRotationAxises[i], qDelta.list[i])
  }
  renderer.render(scene, camera);
  loopId = requestAnimationFrame(render);
  qDelta.list.forEach((value, index, array) => {
    array[index] = 0
  })
}

watch(() => [...store.state.Q], ((value, oldValue) => {
  qDelta.list.forEach((val, ind, arr) => {
    arr[ind] = value[ind] - oldValue[ind]
  })
}))

let link0 = null
watch(() => store.state.robotType,  (value) => {
  cancelAnimationFrame(loopId)
  setTimeout(async () => {
    scene.remove(link0)
    await loadSTL()
    render()
  }, 0.1 * 1000)
})

const loadSTL = async () => {
  joints.length = 0
  jointRotationAxises.length = 0

  let type = null

  Object.keys(RobotTypeEnum).forEach(value => {
    if (RobotTypeEnum[value] === store.state.robotType) {
      type = value.toLowerCase()
    }
  })

  const xmlHttp = new XMLHttpRequest()
  xmlHttp.open("GET", "/" + type + "/urdf/robot.urdf", false)
  xmlHttp.send()
  const xmlDoc = xmlHttp.responseXML
  const robotNode = xmlDoc.getElementsByTagName("robot")[0]
  const linkNodes = robotNode.getElementsByTagName("link")
  const jointNodes = robotNode.getElementsByTagName("joint")

  const link0Geometry = await stlLoader.loadAsync("/" + type + "/meshes/link_0.STL");
  const link0Material = new THREE.MeshPhongMaterial({color:0xDDDADA})
  // const link0 = new THREE.Mesh(link0Geometry, link0Material);
  link0 = new THREE.Mesh(link0Geometry, link0Material);
  link0.position.set(...linkNodes[0].getElementsByTagName("visual")[0].getElementsByTagName("origin")[0].getAttribute("xyz").split(" ").map(Number))
  const link0Euler = new THREE.Euler(...linkNodes[0].getElementsByTagName("visual")[0].getElementsByTagName("origin")[0].getAttribute("rpy").split(" ").map(Number))
  link0.setRotationFromEuler(link0Euler)
  scene.add(link0);
  let parent = link0
  for (let i = 0; i < dof; i++) {
    const jointGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5)
    const jointMaterial = new THREE.MeshPhongMaterial({color:0xFFFFFF})
    const joint = new THREE.Mesh(jointGeometry, jointMaterial)
    joint.position.set(...jointNodes[i].getElementsByTagName("origin")[0].getAttribute("xyz").split(" ").map(Number))
    const jointEuler = new THREE.Euler(...jointNodes[i].getElementsByTagName("origin")[0].getAttribute("rpy").split(" ").map(Number), 'ZYX')
    joint.setRotationFromEuler(jointEuler)
    joint.material.visible = false
    const jointRotationAxis = new THREE.Vector3(...jointNodes[i].getElementsByTagName("axis")[0].getAttribute("xyz").split(" ").map(Number))
    jointRotationAxises.push(jointRotationAxis)
    joints.push(joint)
    parent.add(joint)

    const linkGeometry = await stlLoader.loadAsync("/" + type + "/meshes/link_" + (i + 1) + ".STL");
    const linkMaterial = new THREE.MeshPhongMaterial({color:0xDDDADA})
    const link = new THREE.Mesh(linkGeometry, linkMaterial);
    link.position.set(...linkNodes[i + 1].getElementsByTagName("visual")[0].getElementsByTagName("origin")[0].getAttribute("xyz").split(" ").map(Number))
    link.setRotationFromEuler(new THREE.Euler(...linkNodes[i + 1].getElementsByTagName("visual")[0].getElementsByTagName("origin")[0].getAttribute("rpy").split(" ").map(Number), "ZYX"))
    joint.add(link);

    parent = joint
  }
  const axes = new THREE.AxesHelper(0.2)
  parent.add(axes)
}

const loadOther = () => {
  // 3,创建灯光
  const point = new THREE.PointLight(0xffffff);
  point.position.set(0,0,0);
  scene.add(point);
  const point2 = new THREE.PointLight(0xffffff);
  point2.position.set(10,10,10);
  scene.add(point2);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1) // 创建环境光
  scene.add(ambientLight) // 将环境光添加到场景

  const spotLight = new THREE.SpotLight(0xffffff) // 创建聚光灯
  spotLight.position.set(0, 0, 0)
  spotLight.castShadow = true
  scene.add(spotLight)

  const controls = new OrbitControls(camera, renderer.domElement);
  const axes = new THREE.AxesHelper(1);
  scene.add(axes);
}

</script>

<style lang="scss" scoped>
.container {
  //position: fixed;
  //top: 100px;
  //right: 10px;
  height: 500px;
  margin-top: 160px;
  position: sticky;
  top: 100px;
  //right: 20px;

  .canvas {
    height: 100%;
    width: 100%;
  }
}

</style>
