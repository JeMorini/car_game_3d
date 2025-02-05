import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Trees: React.FC = () => {
  const leftTreeRefs = useRef<any[]>([]);
  const rightTreeRefs = useRef<any[]>([]);
  const treeCount = 50;
  const treeSpacing = 10;
  const totalLength = treeCount * treeSpacing;

  useFrame(() => {
    leftTreeRefs.current.forEach((tree) => {
      if (tree) {
        tree.position.z += 0.5;
        if (tree.position.z > 25) {
          tree.position.z -= totalLength;
        }
      }
    });

    rightTreeRefs.current.forEach((tree) => {
      if (tree) {
        tree.position.z += 0.5;
        if (tree.position.z > 25) {
          tree.position.z -= totalLength;
        }
      }
    });
  });

  return (
    <>
      {/* Árvores do lado esquerdo */}
      {Array.from({ length: treeCount }).map((_, i) => (
        <group
          key={`left-tree-${i}`}
          ref={(ref) => (leftTreeRefs.current[i] = ref)}
          position={[-11, 0, i * treeSpacing - totalLength / 2]}
        >
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
            <meshStandardMaterial color={"saddlebrown"} />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[1.5, 3, 8]} />
            <meshStandardMaterial color={"green"} />
          </mesh>
        </group>
      ))}

      {/* Árvores do lado direito */}
      {Array.from({ length: treeCount }).map((_, i) => (
        <group
          key={`right-tree-${i}`}
          ref={(ref) => (rightTreeRefs.current[i] = ref)}
          position={[11, 0, i * treeSpacing - totalLength / 2]}
        >
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
            <meshStandardMaterial color={"saddlebrown"} />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[1.5, 3, 8]} />
            <meshStandardMaterial color={"green"} />
          </mesh>
        </group>
      ))}
    </>
  );
};

export default Trees;
