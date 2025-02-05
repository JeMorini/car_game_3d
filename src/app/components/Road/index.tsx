import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Road: React.FC = () => {
  const stripeRefs = useRef<any[]>([]);

  useFrame(() => {
    stripeRefs.current.forEach((stripe) => {
      if (stripe) {
        stripe.position.z += 0.5;
        if (stripe.position.z > 100) {
          stripe.position.z = -100;
        }
      }
    });
  });

  return (
    <>
      {/* Estrada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 600]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Grama Esquerda */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, -1, 0]}>
        <planeGeometry args={[400, 600]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Grama Direita */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, -1, 0]}>
        <planeGeometry args={[400, 600]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Faixas Brancas Centrais */}
      {Array.from({ length: 80 }).map((_, i) => (
        <mesh
          key={i}
          ref={(ref) => (stripeRefs.current[i] = ref)}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, i * 2.5 - 120]}
        >
          <planeGeometry args={[0.2, 1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
    </>
  );
};

export default Road;
