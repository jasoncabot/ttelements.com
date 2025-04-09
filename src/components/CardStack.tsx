import { Html, PresentationControls, Text, useCursor } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ViewableCardResponse } from "../shared";

type CardStackProps = {
  cards: ViewableCardResponse[];
};

// Card component that renders an individual card
const Card = ({
  card,
  index,
  position,
  rotation,
  isTop,
  onSwipe,
}: {
  card: ViewableCardResponse;
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  isTop: boolean;
  onSwipe: () => void;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [startPosition, setStartPosition] = useState<[number, number]>([0, 0]);

  // Animation targets
  const targetPosition = useRef<[number, number, number]>([...position]);
  const targetRotation = useRef<[number, number, number]>([...rotation]);
  const currentPosition = useRef<[number, number, number]>([...position]);
  const currentRotation = useRef<[number, number, number]>([...rotation]);

  useCursor(hovered);

  // Handle animation with useFrame
  useFrame((_, delta) => {
    if (!ref.current) return;

    // Update target position/rotation when props change
    if (dragging) {
      targetPosition.current = [0, 0, position[2]];
      targetRotation.current = rotation.map(
        (r, i) => r + (i === 1 ? Math.PI * 0.1 : 0),
      ) as [number, number, number];
    } else {
      targetPosition.current = position;
      targetRotation.current = rotation;
    }

    // Smoothly interpolate current values toward targets
    const lerpFactor = 10 * delta; // Adjust for animation speed

    // Update position
    currentPosition.current = currentPosition.current.map((val, i) =>
      THREE.MathUtils.lerp(val, targetPosition.current[i], lerpFactor),
    ) as [number, number, number];

    // Update rotation
    currentRotation.current = currentRotation.current.map((val, i) =>
      THREE.MathUtils.lerp(val, targetRotation.current[i], lerpFactor),
    ) as [number, number, number];

    // Apply to mesh
    ref.current.position.set(...currentPosition.current);
    ref.current.rotation.set(...currentRotation.current);
  });

  // Card dimensions
  const width = 2.5;
  const height = 3.5;
  const thickness = 0.01;

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (isTop) {
      e.stopPropagation();
      setDragging(true);
      setStartPosition([e.point.x, e.point.y]);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (dragging && isTop) {
      e.stopPropagation();
      const deltaX = e.point.x - startPosition[0];
      const deltaY = e.point.y - startPosition[1];
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If the user has moved the card enough, consider it a swipe
      if (distance > 0.5) {
        onSwipe();
      }

      setDragging(false);
    }
  };

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    if (isTop && !dragging) {
      e.stopPropagation();
      onSwipe();
    }
  };

  // Initialize position and rotation on first render and when they change
  useEffect(() => {
    currentPosition.current = [...position];
    currentRotation.current = [...rotation];
    targetPosition.current = [...position];
    targetRotation.current = [...rotation];

    if (ref.current) {
      ref.current.position.set(...position);
      ref.current.rotation.set(...rotation);
    }
  }, [JSON.stringify(position), JSON.stringify(rotation)]);

  return (
    <mesh
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      onPointerOver={() => isTop && setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[width, height, thickness]} />
      <meshStandardMaterial color={hovered ? "#f5f5f5" : "#ffffff"} />

      {/* Card front face - this would typically have the card content */}
      <mesh position={[0, 0, thickness / 2 + 0.001]}>
        <planeGeometry args={[width - 0.05, height - 0.05]} />
        <meshStandardMaterial color={"#f0f0f0"} />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.2}
          color="#000"
          anchorX="center"
          anchorY="middle"
        >
          {card.name || `Card ${index + 1}`}
        </Text>
      </mesh>

      {/* Card back face */}
      <mesh
        position={[0, 0, -thickness / 2 - 0.001]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[width - 0.05, height - 0.05]} />
        <meshStandardMaterial color="#2a6ac7" />
      </mesh>
    </mesh>
  );
};

// Main Card Stack Component
const CardStack: React.FC<CardStackProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [discardedCards, setDiscardedCards] = useState<number[]>([]);

  const handleSwipe = () => {
    setDiscardedCards([...discardedCards, currentIndex]);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Optional: reset back to the first card when all cards are swiped
      setCurrentIndex(0);
      setDiscardedCards([]);
    }
  };

  // Create a unique key for each card's position to ensure animation triggers
  const getCardKey = (index: number) => {
    const isDiscarded = discardedCards.includes(index);
    return `card-${index}-${isDiscarded ? "discarded" : "stack"}-${currentIndex}`;
  };

  return (
    <div style={{ width: "100%", height: "80vh", touchAction: "none" }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]} // Responsive pixel ratio
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, 5]} castShadow intensity={0.4} />

        <PresentationControls
          global
          rotation={[0.13, 0, 0]}
          polar={[-0.1, 0.1]}
          azimuth={[-0.25, 0.25]}
          // config={{ mass: 2, tension: 400 }}
          snap={true}
        >
          <group position={[0, 0, 0]}>
            {cards.map((card, index) => {
              // Calculate positions for cards in stack and swiped cards
              let position: [number, number, number];
              let rotation: [number, number, number];

              const isDiscarded = discardedCards.includes(index);

              if (isDiscarded) {
                // Move discarded cards off to the side based on their order in discardedCards
                const discardIndex = discardedCards.indexOf(index);
                const angle = (Math.PI / 6) * (Math.random() * 0.5 + 0.75);
                const distance = 4 + Math.random() * 2;
                position = [
                  Math.cos(angle) * distance,
                  Math.sin(angle) * distance,
                  0.1 - discardIndex * 0.01,
                ];
                rotation = [
                  (Math.random() - 0.5) * 0.2,
                  (Math.random() - 0.5) * 0.2,
                  (Math.random() - 0.5) * 0.5,
                ];
              } else {
                // Stack remaining cards with a slight offset
                const stackPosition = index - currentIndex;
                position = [0, 0, 0.1 - stackPosition * 0.02];
                rotation = [0, 0, (Math.random() - 0.5) * 0.05 * stackPosition];
              }

              return (
                <Card
                  key={getCardKey(index)}
                  card={card}
                  index={index}
                  position={position}
                  rotation={rotation}
                  isTop={index === currentIndex}
                  onSwipe={handleSwipe}
                />
              );
            })}
          </group>
        </PresentationControls>

        {/* Instructions overlay */}
        <Html position={[0, -2.5, 0]} center>
          <div
            style={{
              background: "rgba(0,0,0,0.5)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            {currentIndex < cards.length - 1
              ? "Tap or swipe the top card to continue"
              : "Last card reached - tap to restart"}
          </div>
        </Html>
      </Canvas>
    </div>
  );
};

export default CardStack;
