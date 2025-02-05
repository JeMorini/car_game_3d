import React from "react";
import { useGLTF } from "@react-three/drei";

const Obstacle: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const { scene } = useGLTF("/models/obstacle.glb");
  return (
    <primitive
      object={scene}
      position={position}
      scale={[1.5, 1.5, 1.5]}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
};

export default Obstacle;
