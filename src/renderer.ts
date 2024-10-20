import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let box: THREE.BoxGeometry;
let material: THREE.Material;

let batchedMesh: THREE.BatchedMesh;
let geometryId: number;

export function init(width: number, height: number) {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(undefined, width / height);
    camera.position.z = 3;

    controls = new OrbitControls(camera, renderer.domElement);
    // controls.autoRotate = true;
    controls.enableDamping = true;

    box = new THREE.BoxGeometry();
    material = new THREE.MeshNormalMaterial();

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(5);
    scene.add(gridHelper);

    setAutoRender(true);

    document.body.appendChild(renderer.domElement);
}

export function render() {
    controls.update();
    renderer.render(scene, camera);
}

export function setAutoRender(enabled: boolean) {
    if (enabled) {
        renderer.setAnimationLoop(render);
    } else {
        renderer.setAnimationLoop(null);
    }
}

export function initBatchedMesh(maxInstanceCount: number) {
    if (batchedMesh) {
        scene.remove(batchedMesh);
        batchedMesh.dispose();
    }
    batchedMesh = new THREE.BatchedMesh(
        maxInstanceCount,
        24, // 顶点数：4 顶点 * 6 面，每个面的法线不同，无法共享顶点
        36, // 索引数：3 顶点 * 12 三角面
        material
    );
    geometryId = batchedMesh.addGeometry(box);
}

export function addCubeToMesh(position: number[], size: number) {
    const id = batchedMesh.addInstance(geometryId);
    batchedMesh.setMatrixAt(id, new THREE.Matrix4().compose(
        new THREE.Vector3().fromArray(position),
        new THREE.Quaternion(),
        new THREE.Vector3(size, size, size)
    ));
}

export function submitMesh() {
    scene.add(batchedMesh);
}
