// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import io from "socket.io-client";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import Road from "./components/Road";
import ZebraBarriers from "./components/ZebraBarriers";
import Trees from "./components/Trees";
import Car from "./components/Car";
import Obstacle from "./components/Obstacle";

const socket = io("YOUR SOCKET URL", {
  transports: ["websocket"],
});

interface CameraMotionProps {
  carPosition: [number, number, number];
  currentSide: string;
}
const CameraMotion: React.FC<CameraMotionProps> = ({
  carPosition,
  currentSide,
}) => {
  const { camera } = useThree();
  const baseFov = 50;

  useFrame(() => {
    const targetX = carPosition[0] * 0.5;
    const targetY = 3;
    const targetZ = 10;

    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);

    let targetRotationZ = 0;
    if (currentSide === "left") {
      targetRotationZ = 0.05;
    } else if (currentSide === "right") {
      targetRotationZ = -0.05;
    }
    camera.rotation.z = THREE.MathUtils.lerp(
      camera.rotation.z,
      targetRotationZ,
      0.1
    );

    const speedFactor = Math.min(Math.abs(carPosition[2]) / 10, 0.1);
    camera.fov = THREE.MathUtils.lerp(
      camera.fov,
      baseFov + speedFactor * 20,
      0.1
    );
    camera.updateProjectionMatrix();
  });

  return null;
};

interface GameLogicProps {
  carPosition: [number, number, number];
  setCarPosition: React.Dispatch<
    React.SetStateAction<[number, number, number]>
  >;
  currentSide: string;
  setCurrentSide: React.Dispatch<React.SetStateAction<string>>;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  gameOver: boolean;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}
const GameLogic: React.FC<GameLogicProps> = ({
  carPosition,
  setCarPosition,
  currentSide,
  setCurrentSide,
  setGameOver,
  gameOver,
  setScore,
}) => {
  useEffect(() => {
    console.log("AQUI");
    socket.on("orientationResponse", (data) => {
      console.log(data);
      if (data === "right") {
        setCurrentSide("right");
      } else if (data === "left") {
        setCurrentSide("left");
      } else {
        setCurrentSide("");
      }
    });
  }, []);

  const [obstacles, setObstacles] = useState<[number, number, number][]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const speed = useRef(0.1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setCurrentSide("left");
      }
      if (event.key === "ArrowRight") {
        setCurrentSide("right");
      }
      keysPressed.current[event.key] = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      setCurrentSide("");
      keysPressed.current[event.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setCurrentSide]);

  useEffect(() => {
    const interval = setInterval(() => {
      setObstacles((prev) => [...prev, [Math.random() * 7 - 3, 0, -100]]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useFrame((_, delta) => {
    // Atualiza a pontuação somente se o jogo não acabou.
    if (!gameOver) {
      setScore((prev) => prev + delta * 100);
    }

    const moveSpeed = speed.current * delta * 1000;
    setCarPosition((prev) => {
      let x = prev[0];
      if (currentSide === "left") x = Math.max(x - 0.1, -3);
      if (currentSide === "right") x = Math.min(x + 0.1, 3);
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
        setGameOver(true);
        setCarPosition([0, 0, 4]);
        setObstacles([]);
      }
    });
  });

  return (
    <>
      <Car position={carPosition} currentSide={currentSide} />
      {obstacles.map((pos, index) => (
        <Obstacle key={index} position={pos} />
      ))}
    </>
  );
};

const App: React.FC = () => {
  const [carPosition, setCarPosition] = useState<[number, number, number]>([
    0, 0, 4,
  ]);
  const [currentSide, setCurrentSide] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const restartGame = () => {
    location.reload();
  };

  return (
    <div
      style={{ height: "100vh", background: "#87ceeb", position: "relative" }}
    >
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <Road />
        <ZebraBarriers />
        <Trees />
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <GameLogic
          carPosition={carPosition}
          setCarPosition={setCarPosition}
          currentSide={currentSide}
          setCurrentSide={setCurrentSide}
          setGameOver={setGameOver}
          gameOver={gameOver}
          setScore={setScore}
        />
        <CameraMotion carPosition={carPosition} currentSide={currentSide} />
        <OrbitControls />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.5}
            height={300}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
      </Canvas>
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          fontSize: "1.5rem",
          color: "#fff",
          textShadow: "1px 1px 2px #000",
        }}
      >
        Pontuação: {Math.floor(score)}
      </div>
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
              color: "#000",
            }}
          >
            <h2 style={{ margin: 16 }}>Que pena, você bateu</h2>
            <p style={{ margin: 16 }}>Sua pontuação: {Math.floor(score)}</p>
            <button
              style={{
                margin: 16,
                padding: 16,
                cursor: "pointer",
                backgroundColor: "orange",
              }}
              onClick={restartGame}
            >
              Reiniciar corrida
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
