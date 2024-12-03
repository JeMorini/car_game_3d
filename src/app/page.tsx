// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Peer } from "peerjs";

const Car: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const { scene } = useGLTF("/models/car.glb");
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

// import React, { useRef } from "react";
// import { useFrame } from "@react-three/fiber";

const Road: React.FC = () => {
  const stripeRefs = useRef<any[]>([]); // Array de referências para as faixas

  useFrame(() => {
    stripeRefs.current.forEach((stripe, index) => {
      if (stripe) {
        stripe.position.z += 0.1; // Velocidade do movimento
        if (stripe.position.z > 25) {
          stripe.position.z = -25; // Reinicia posição quando ultrapassa o limite
        }
      }
    });
  });

  const texture = useLoader(
    THREE.TextureLoader,
    "/models/depositphotos_65970815-stock-photo-asphalt-texture.jpg"
  );

  return (
    <>
      {/* Estrada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 400]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Grama Esquerda */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, -1, 0]}>
        <planeGeometry args={[100, 400]} />
        <meshStandardMaterial />
      </mesh>

      {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, -2, 0]}>
        <planeGeometry args={[100, 400]} />
        <meshStandardMaterial color="green" />
      </mesh> */}

      {/* Grama Direita */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, -1, 0]}>
        <planeGeometry args={[100, 400]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Faixas Brancas */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          ref={(ref) => (stripeRefs.current[i] = ref)} // Salva referência para cada faixa
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, i * 2.5 - 25]} // Posicionamento inicial
        >
          <planeGeometry args={[0.2, 1]} />{" "}
          {/* Largura e comprimento da faixa */}
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
    </>
  );
};

const GameLogic: React.FC = () => {
  const peer = new Peer("5229ee1b-ee4f-40de-908f-69715dd51b68");

  const [carPosition, setCarPosition] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [obstacles, setObstacles] = useState<[number, number, number][]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const speed = useRef(0.1);

  peer.on("connection", (conn) => {
    conn.on("data", (data) => {
      // Will print 'hi!'
      alert(1);
      console.log(data);
    });
    conn.on("open", () => {
      conn.send("hello!");
    });
  });

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
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useFrame((_, delta) => {
    const moveSpeed = speed.current * delta * 120;

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
    <div style={{ height: "100vh", backgroundImage: "#87ceeb" }}>
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
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
