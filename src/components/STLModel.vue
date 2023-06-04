<template>
  <v-card class="container animated zoomIn">
    <div class="canvas" ref="container"></div>
  </v-card>
</template>

<script setup>
import {onMounted, ref, reactive, watch} from "vue";
import * as THREE from 'three'
import {useStore} from "vuex"
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader'
import {OrthographicCamera} from "three";

const container = ref()
const scene = new THREE.Scene()
const stlLoader = new STLLoader()

const qDelta = reactive({
  list: [0, 0, 0, 0, 0, 0]
})


const store = useStore()

const type = "cooperation"
// const type = "industry"
const dof = 6

const xmlhttp = new XMLHttpRequest()
xmlhttp.open("GET", "/" + type + "/urdf/robot.urdf", false)
xmlhttp.send()
const xmlDoc = xmlhttp.responseXML
const robotNode = xmlDoc.getElementsByTagName("robot")[0]
const linkNodes = robotNode.getElementsByTagName("link")
const jointNodes = robotNode.getElementsByTagName("joint")

const link0Geometry = await stlLoader.loadAsync("/" + type + "/meshes/link_0.STL");
const link0Material = new THREE.MeshPhongMaterial({color:0xDDDADA})
const link0 = new THREE.Mesh(link0Geometry, link0Material);
link0.position.set(...linkNodes[0].getElementsByTagName("visual")[0].getElementsByTagName("origin")[0].getAttribute("xyz").split(" ").map(Number))
const link0Euler = new THREE.Euler(...linkNodes[0].getElementsByTagName("visual")[0].getElementsByTagName("origin")[0].getAttribute("rpy").split(" ").map(Number))
link0.setRotationFromEuler(link0Euler)
scene.add(link0);

let parent = link0
const joints = []
const jointRotationAxises = []
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

  const axes = new THREE.AxesHelper(0.2)
  joint.add(axes)
  parent = joint
}


// const axes6 = new THREE.AxesHelper(0.2);
// axes6.position.set(0.02,0.0, 0.0)
// const axes6Euler = new THREE.Euler(Math.PI / 2, 0.0,Math.PI / 2, 'ZYX')
// axes6.setRotationFromEuler(axes6Euler)
// parent.add(axes6)


// link0.rotateY(Math.PI / 2 * x1.value)

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
// document.body.appendChild(renderer.domElement);
// container.value.appendChild(renderer.domElement)
onMounted(() => {
  const width = container.value.offsetWidth;
  const height = container.value.offsetHeight;
  renderer.setSize(width, height);
  container.value.appendChild(renderer.domElement)
  // console.log(width)
})

// const mesh1Axes = new THREE.AxesHelper(1)
// mesh1Axes.position.set(0.1,0,0)
// link0.add(mesh1Axes)

function render() {
  for (let i = 0; i < dof; i++) {
    joints[i].rotateOnAxis(jointRotationAxises[i], qDelta.list[i])
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
  qDelta.list.forEach((value, index, array) => {
    array[index] = 0
  })
}

const controls = new OrbitControls(camera, renderer.domElement);
const axes = new THREE.AxesHelper(1);
scene.add(axes);
render();

// const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})

watch(() => [...store.state.Q], ((value, oldValue) => {
  qDelta.list.forEach((val, ind, arr) => {
    arr[ind] = value[ind] - oldValue[ind]
  })

  // for (let i = 0; i < 6; i++) {
  //   qDelta.list[i] = value[i] - oldValue[i]
  // }
  // console.log(qDelta.list)
  // q1Delta.value = value[0] - oldValue[0]
  // q2Delta.value = value[1] - oldValue[1]
  // q3Delta.value = value[2] - oldValue[2]
  // q4Delta.value = value[3] - oldValue[3]
  // q5Delta.value = value[4] - oldValue[4]
  // q6Delta.value = value[5] - oldValue[5]
}))

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
