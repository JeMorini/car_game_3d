import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const ZebraBarriers: React.FC = () => {
  const leftStripeRefs = useRef<any[]>([]);
  const rightStripeRefs = useRef<any[]>([]);
  const stripeCount = 200;
  const stripeHeight = 1;
  const totalLength = stripeCount * stripeHeight;

  useFrame(() => {
    leftStripeRefs.current.forEach((stripe) => {
      if (stripe) {
        stripe.position.z += 0.5;
        if (stripe.position.z > 25) {
          stripe.position.z -= totalLength;
        }
      }
    });
    rightStripeRefs.current.forEach((stripe) => {
      if (stripe) {
        stripe.position.z += 0.5;
        if (stripe.position.z > 25) {
          stripe.position.z -= totalLength;
        }
      }
    });
  });

  return (
    <>
      {/* Faixas do lado esquerdo */}
      {Array.from({ length: stripeCount }).map((_, i) => (
        <mesh
          key={`left-${i}`}
          ref={(ref) => (leftStripeRefs.current[i] = ref)}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-5, 0.02, i * stripeHeight - totalLength / 2]}
        >
          <planeGeometry args={[0.5, stripeHeight]} />
          <meshStandardMaterial color={i % 2 === 0 ? "red" : "white"} />
        </mesh>
      ))}
      {/* Faixas do lado direito */}
      {Array.from({ length: stripeCount }).map((_, i) => (
        <mesh
          key={`right-${i}`}
          ref={(ref) => (rightStripeRefs.current[i] = ref)}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[5, 0.02, i * stripeHeight - totalLength / 2]}
        >
          <planeGeometry args={[0.5, stripeHeight]} />
          <meshStandardMaterial color={i % 2 === 0 ? "red" : "white"} />
        </mesh>
      ))}
    </>
  );
};

export default ZebraBarriers;
