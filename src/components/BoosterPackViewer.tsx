import { CubeIcon } from "@heroicons/react/24/solid";
import { OrbitControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { PurchaseKind } from "../shared/shop";

type BoosterPackViewerProps = {
  packKey: PurchaseKind;
  onClose: () => void;
  onOpenComplete: () => Promise<void>;
  children?: React.ReactNode;
};

const BoosterPackMesh = () => {
  const cardWidth = 0.65;
  const cardHeight = 0.9;
  const cardThickness = 0.02; // Slightly thicker for visibility
  const numCards = 7;

  // Re-use geometry and material for performance
  const cardGeometry = new THREE.BoxGeometry(
    cardWidth,
    cardHeight,
    cardThickness,
  );
  const cardMaterial = new THREE.MeshStandardMaterial({
    color: "goldenrod",
  });

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      {" "}
      {/* Rotate group for better view */}
      {[...Array(numCards)].map((_, i) => {
        // Calculate the position for each card to stack them along the Y-axis after rotation
        // Center the stack around y=0
        const yPosition = (i - (numCards - 1) / 2) * cardThickness * 1.1; // Add slight gap
        return (
          <mesh
            key={i}
            geometry={cardGeometry}
            material={cardMaterial}
            position={[0, yPosition, 0]} // Stack along Y after group rotation
            castShadow
            receiveShadow
          />
        );
      })}
    </group>
  );
};

const BoosterPackViewer: React.FC<BoosterPackViewerProps> = ({
  packKey,
  onClose,
  onOpenComplete,
  children,
}) => {
  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-200 p-6 shadow-lg">
      <h1 className="mb-2 text-2xl font-bold">Buy a Booster</h1>
      <h2 className="mb-4 text-lg text-gray-600">{packKey}</h2>
      <div className="mb-6 flex w-full justify-center" style={{ height: 320 }}>
        <Canvas shadows camera={{ position: [2, 2, 3], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[0, 5, 2]} intensity={1.2} castShadow />
          <Stage environment={null} intensity={0.7} shadows="contact">
            <BoosterPackMesh />
          </Stage>
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
      <button
        className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-white shadow transition hover:bg-amber-500"
        onClick={onOpenComplete}
      >
        <CubeIcon className="h-5 w-5" />
        Confirm Purchase
      </button>
      <button
        className="mb-4 cursor-pointer text-sm text-gray-500 underline hover:text-gray-700"
        onClick={onClose}
      >
        Cancel
      </button>
      {children}
    </div>
  );
};

export default BoosterPackViewer;
