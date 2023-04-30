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

// var link0

const q1Delta = ref(0)
const q2Delta = ref(0)
const q3Delta = ref(0)
const q4Delta = ref(0)
const q5Delta = ref(0)
const q6Delta = ref(0)

const qDelta = reactive({
  list: [0, 0, 0, 0, 0, 0]
})


const store = useStore()

// stlLoader.load('/ER15-1400/meshes/base_link.STL', geometry => {
//   // console.log(geometry)
//   const material = new THREE.MeshPhongMaterial({color:0xDDDADA})
//   link0 = new THREE.Mesh(geometry,material);
//   link0.translateY(x1.value)
//   scene.add(link0);
// })

const link0Geometry = await stlLoader.loadAsync('/ER15-1400/meshes/base_link.STL');
const link0Material = new THREE.MeshPhongMaterial({color:0xDDDADA})
const link0 = new THREE.Mesh(link0Geometry, link0Material);
scene.add(link0);

const joint1Geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5)
const joint1Material = new THREE.MeshPhongMaterial({color:0xFFFFFF})
const joint1 = new THREE.Mesh(joint1Geometry, joint1Material)
joint1.position.set(0.013059, 0.0045, 0.196)
const joint1Euler = new THREE.Euler(1.5708, 0, 0, 'ZYX')
joint1.setRotationFromEuler(joint1Euler)
joint1.material.visible = false
const joint1RotationAxis = new THREE.Vector3(0, 1, 0)
link0.add(joint1)

const link1Geometry = await stlLoader.loadAsync('/ER15-1400/meshes/link_1.STL');
const link1Material = new THREE.MeshPhongMaterial({color:0xDDDADA})
const link1 = new THREE.Mesh(link1Geometry, link1Material);
joint1.add(link1);

const joint2DeltaZ = 0.02

const joint2Geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5)
const joint2Material = new THREE.MeshPhongMaterial({color:0xFFFFFF})
const joint2 = new THREE.Mesh(joint2Geometry, joint2Material)
joint2.position.set(0.18, 0.234, 0.0615 + joint2DeltaZ)
const joint2Euler = new THREE.Euler(0, 0, 0, 'ZYX')
joint2.setRotationFromEuler(joint2Euler)
joint2.material.visible = false
const joint2RotationAxis = new THREE.Vector3(0.0, 0.0, 1.0)
link1.add(joint2)

const link2Geometry = await stlLoader.loadAsync('/ER15-1400/meshes/link_2.STL');
const link2Material = new THREE.MeshPhongMaterial({color:0xDDDADA})
const link2 = new THREE.Mesh(link2Geometry, link2Material);
joint2.add(link2);

const joint3Geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5)
const joint3Material = new THREE.MeshPhongMaterial({color:0xFFFFFF})
const joint3 = new THREE.Mesh(joint3Geometry, joint3Material)
joint3.position.set(0.0, 0.58, 0.0 - joint2DeltaZ)
const joint3Euler = new THREE.Euler(0.0, 0.0, 0.0, 'ZYX')
joint3.setRotationFromEuler(joint3Euler)
joint3.material.visible = false
const joint3RotationAxis = new THREE.Vector3(0.0, 0.0, 1.0)
link2.add(joint3)

const link3Geometry = await stlLoader.loadAsync('/ER15-1400/meshes/link_3.STL');
const link3Material = new THREE.MeshPhongMaterial({color:0xDDDADA})
const link3 = new THREE.Mesh(link3Geometry, link3Material);
joint3.add(link3);

const joint4Geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5)
const joint4Material = new THREE.MeshPhongMaterial({color:0xFFFFFF})
const joint4 = new THREE.Mesh(joint4Geometry, joint4Material)
joint4.position.set(0.20999, 0.16, -0.0628)
const joint4Euler = new THREE.Euler(0.0, 0.0, 0.0, 'ZYX')
joint4.setRotationFromEuler(joint4Euler)
joint4.material.visible = false
const joint4RotationAxis = new THREE.Vector3(1.0, 0.0, 0.0)
link3.add(joint4)

const link4Geometry = await stlLoader.loadAsync('/ER15-1400/meshes/link_4.STL');
const link4Material = new THREE.MeshPhongMaterial({color:0xDDDADA})
const link4 = new THREE.Mesh(link4Geometry, link4Material);
joint4.add(link4);

const joint5Geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5)
const joint5Material = new THREE.MeshPhongMaterial({color:0xFFFFFF})
const joint5 = new THREE.Mesh(joint5Geometry, joint5Material)
joint5.position.set(0.42951, 0.0, 0.0)
const joint5Euler = new THREE.Euler(0.0, 0.0, 0.0, 'ZYX')
joint5.setRotationFromEuler(joint5Euler)
joint5.material.visible = false
const joint5RotationAxis = new THREE.Vector3(0.0, 0.0, 1.0)
link4.add(joint5)

const link5Geometry = await stlLoader.loadAsync('/ER15-1400/meshes/link_5.STL');
const link5Material = new THREE.MeshPhongMaterial({color:0xDDDADA})
const link5 = new THREE.Mesh(link5Geometry, link5Material);
joint5.add(link5);

const joint6Geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5)
const joint6Material = new THREE.MeshPhongMaterial({color:0xFFFFFF})
const joint6 = new THREE.Mesh(joint6Geometry, joint6Material)
joint6.position.set(0.1, 0.0, 0.0)
const joint6Euler = new THREE.Euler(-0.0013162, 0.0, 0.0, 'ZYX')
joint6.setRotationFromEuler(joint6Euler)
joint6.material.visible = false
const joint6RotationAxis = new THREE.Vector3(1.0, 0.0, 0.0)
link5.add(joint6)

const link6Geometry = await stlLoader.loadAsync('/ER15-1400/meshes/link_6.STL');
const link6Material = new THREE.MeshPhongMaterial({color:0xDDDADA})
const link6 = new THREE.Mesh(link6Geometry, link6Material);
joint6.add(link6);

const axes6 = new THREE.AxesHelper(0.2);
axes6.position.set(0.02,0.0, 0.0)
const axes6Euler = new THREE.Euler(Math.PI / 2, 0.0,Math.PI / 2, 'ZYX')
axes6.setRotationFromEuler(axes6Euler)
link6.add(axes6)



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
  joint1.rotateOnAxis(joint1RotationAxis, qDelta.list[0])
  joint2.rotateOnAxis(joint2RotationAxis, qDelta.list[1])
  joint3.rotateOnAxis(joint3RotationAxis, qDelta.list[2])
  joint4.rotateOnAxis(joint4RotationAxis, qDelta.list[3])
  joint5.rotateOnAxis(joint5RotationAxis, qDelta.list[4])
  joint6.rotateOnAxis(joint6RotationAxis, qDelta.list[5])

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
