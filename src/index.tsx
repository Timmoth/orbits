import * as THREE from "three";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import React from "react";
import { Physics, useSphere } from "@react-three/cannon";
import { Sky, OrbitControls } from "@react-three/drei";

const rfs = THREE.MathUtils.randFloatSpread;
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const baubleMaterial = new THREE.MeshStandardMaterial({
  color: "red",
  roughness: 0,
  envMapIntensity: 0.2,
  emissive: "#370037",
});

createRoot(document.getElementById("root") as HTMLElement).render(
  <Canvas camera={{ position: [0, 0, 70] }}>
    <ambientLight intensity={0.25} />
    <spotLight
      intensity={1}
      angle={0.2}
      penumbra={1}
      position={[100, 100, 100]}
      castShadow
      shadow-mapSize={[512, 512]}
    />
    <directionalLight
      intensity={5}
      position={[-100, -100, -100]}
      color="purple"
    />
    <Physics gravity={[0, 0, 0]} iterations={1}>
      <Clump />
    </Physics>
    <OrbitControls maxDistance={100} />
    <Sky />
  </Canvas>
);
const objectCount: number = 100;
function Clump({ ...props }) {
  const [ref, api] = useSphere<THREE.InstancedMesh>(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.001,
    linearDamping: 0.001,
    position: [rfs(100), rfs(100), rfs(100)],
    velocity: [rfs(30), rfs(30), rfs(30)],
  }));
  useFrame((state) => {
    for (let i = 0; i < objectCount; i++) {
      let mat = new THREE.Matrix4();
      let vec = new THREE.Vector3();
      ref.current!.getMatrixAt(i, mat);
      vec.setFromMatrixPosition(mat);
      let point = vec.toArray();
      let force = new THREE.Vector3();

      for (let j = 0; j < objectCount; j++) {
        if (i == j) {
          continue;
        }

        let mat2 = new THREE.Matrix4();
        let vec2 = new THREE.Vector3();

        ref.current!.getMatrixAt(j, mat2);
        vec2.setFromMatrixPosition(mat2);
        let forceMag = 20 / vec2.distanceTo(vec);
        let forceDir = vec2.sub(vec).normalize();
        force.add(forceDir.multiplyScalar(forceMag));
      }

      api.at(i).applyForce(force.toArray(), point);
    }
  });
  return (
    <instancedMesh
      ref={ref}
      castShadow
      receiveShadow
      args={[undefined, undefined, objectCount]}
      geometry={sphereGeometry}
      material={baubleMaterial}
    />
  );
}
