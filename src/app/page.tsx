"use client";
import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const Car: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const { scene } = useGLTF("/models/car.glb"); // Carregue o modelo .glb
  return (
    <primitive
      object={scene}
      position={position}
      scale={[1, 1, 1]}
      rotation={[0, Math.PI / 2, 0]}
      style={{ background: "red" }}
    />
  );
};

const Obstacle: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const Road: React.FC = () => {
  return (
    <>
      {/* Estrada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 50]} /> {/* largura 10, comprimento 50 */}
        <meshStandardMaterial color="black" /> {/* Cor preta para asfalto */}
      </mesh>
      {/* Grama Esquerda */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, 0, 0]}>
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial color="green" /> {/* Cor verde para grama */}
      </mesh>
      {/* Grama Direita */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0, 0]}>
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </>
  );
};

const GameLogic: React.FC = () => {
  const [carPosition, setCarPosition] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [obstacles, setObstacles] = useState<[number, number, number][]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const speed = useRef(0.1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setObstacles((prev) => [...prev, [Math.random() * 6 - 3, 0.5, -10]]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useFrame((_, delta) => {
    const moveSpeed = speed.current * delta * 60;

    setCarPosition((prev) => {
      let x = prev[0];
      if (keysPressed.current["ArrowLeft"]) x = Math.max(x - 0.1, -3);
      if (keysPressed.current["ArrowRight"]) x = Math.min(x + 0.1, 3);
      return [x, prev[1], prev[2]];
    });

    setObstacles((prev) =>
      prev
        .map(([x, y, z]) => [x, y, z + moveSpeed])
        .filter(([_, __, z]) => z < 5)
    );

    obstacles.forEach(([ox, oy, oz]) => {
      if (
        Math.abs(carPosition[0] - ox) < 1 &&
        Math.abs(carPosition[2] - oz) < 1
      ) {
        setCarPosition([0, 0, 0]);
        setObstacles([]);
      }
    });
  });

  return (
    <>
      <Car position={carPosition} />
      {obstacles.map((pos, index) => (
        <Obstacle key={index} position={pos} />
      ))}
    </>
  );
};

const App: React.FC = () => {
  return (
    <div style={{ height: "100vh" }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <Road />
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <GameLogic />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default App;
