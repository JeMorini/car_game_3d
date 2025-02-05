import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface CarProps {
  position: [number, number, number];
  currentSide: string;
}
const Car: React.FC<CarProps> = ({ position, currentSide }) => {
  const { scene } = useGLTF("/models/car.glb");
  const carRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (carRef.current) {
      let targetRotation = 0;
      if (currentSide === "left") {
        targetRotation = 0.1;
      } else if (currentSide === "right") {
        targetRotation = -0.1;
      }
      carRef.current.rotation.z = THREE.MathUtils.lerp(
        carRef.current.rotation.z,
        targetRotation,
        0.1
      );
    }
  });

  return (
    <group ref={carRef} position={position}>
      <primitive
        object={scene}
        scale={[1, 1, 1]}
        rotation={[0, Math.PI / 2, 0]}
      />
    </group>
  );
};

export default Car;
