// @ts-nocheck
"use client";
import { Peer } from "peerjs";
import { useEffect, useState } from "react";

export default function Control() {
  const [rotation, setRotation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [test, setTest] = useState();
  const peer = new Peer(); // Inicializa o PeerJS para comunicação WebRTC

  // Gerencia a rotação do dispositivo
  useEffect(() => {
    const requestPermissionAndListen = async () => {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const permissionState =
            await DeviceOrientationEvent.requestPermission();
          if (permissionState === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          } else {
            alert(
              "Permissão para acessar a orientação do dispositivo foi negada."
            );
          }
        } catch (error) {
          console.error(
            "Erro ao solicitar permissão para DeviceOrientation:",
            error
          );
        }
      } else {
        // Para navegadores que não requerem permissão
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    const handleOrientation = (event) => {
      setRotation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      });
    };

    requestPermissionAndListen();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Gerencia o AbsoluteOrientationSensor
  useEffect(() => {
    if ("AbsoluteOrientationSensor" in window) {
      const sensor = new AbsoluteOrientationSensor({ frequency: 60 });
      Promise.all([
        navigator.permissions.query({ name: "accelerometer" }),
        navigator.permissions.query({ name: "magnetometer" }),
        navigator.permissions.query({ name: "gyroscope" }),
      ])
        .then((results) => {
          setTest(results); // Para verificar o estado das permissões
          if (results.every((result) => result.state === "granted")) {
            sensor.addEventListener("reading", () => {
              const [x, y, z, w] = sensor.quaternion;
              console.log("Orientação do dispositivo:", { x, y, z, w });
            });
            sensor.start();
          } else {
            console.log("Permissões para sensores negadas.");
          }
        })
        .catch((error) =>
          console.error("Erro ao solicitar permissões:", error)
        );
    } else {
      console.warn("Generic Sensor API não é suportada neste navegador.");
    }
  }, []);

  // Configura o PeerJS para comunicação
  const connectPeer = () => {
    const conn = peer.connect("5229ee1b-ee4f-40de-908f-69715dd51b68");
    conn.on("open", () => {
      conn.send("Olá, conexão estabelecida!");
    });
    conn.on("data", (data) => {
      console.log("Dados recebidos:", data);
    });
  };

  return (
    <div>
      <h1>Controle</h1>
      <div>
        <h2>Rotação do Dispositivo</h2>
        <p>Alpha (Z): {rotation.alpha?.toFixed(2)}°</p>
        <p>Beta (X): {rotation.beta?.toFixed(2)}°</p>
        <p>Gamma (Y): {rotation.gamma?.toFixed(2)}°</p>
      </div>
      <div>
        <h2>Sensores Absolutos</h2>
        <p>Permissões: {JSON.stringify(test)}</p>
      </div>
      <button onClick={connectPeer}>Conectar ao PeerJS</button>
    </div>
  );
}
