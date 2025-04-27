import { Dialog, DialogBackdrop } from "@headlessui/react";
import { ShieldCheckIcon } from "@heroicons/react/24/solid"; // Use solid icon for owned badge
import { OrbitControls, useTexture } from "@react-three/drei"; // Added OrbitControls, useTexture, Plane, Html
import { Canvas, useFrame } from "@react-three/fiber"; // Added Canvas, useFrame
import React, { memo, Suspense, useEffect, useRef, useState } from "react"; // Added useState, Suspense, useRef, memo, useEffect
import * as THREE from "three"; // Added THREE
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import cardBack from "../assets/images/back.svg";
import { cardImageFromKind, numberImage } from "../assets/images/cards";
import CardDetail from "./CardDetail";
import { LibraryCardProps } from "./Library";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

// Define the props for the new CardModelViewer component
interface CardModelViewerProps {
  card: LibraryCardProps;
  onClose: () => void;
}

// --- CardMeshContent Component --- (New Inner Component)
// This component uses the R3F hooks and renders the mesh. It must be rendered inside <Canvas>.
const CardMeshContent: React.FC<{
  frontImage: string;
  backImage: string;
  borderColour: string;
  acquiredAt?: string | null; // Add acquiredAt prop
  overlayTextures?: (string | THREE.Texture)[]; // New prop for overlay textures
  owned?: boolean; // Add owned prop
}> = ({
  frontImage,
  backImage,
  borderColour,
  overlayTextures = [],
  owned = true, // default to true for backward compatibility
}) => {
  const [frontTexture, backTexture, ...overlayLoadedTextures] = useTexture([
    frontImage,
    backImage,
    ...(overlayTextures || []).map((t) => (typeof t === "string" ? t : "")),
  ]);

  // Ensure textures repeat correctly if needed (usually not for cards)
  frontTexture.wrapS = frontTexture.wrapT = THREE.ClampToEdgeWrapping;
  backTexture.wrapS = backTexture.wrapT = THREE.ClampToEdgeWrapping;

  const meshRef = useRef<THREE.Mesh>(null!); // Ref for the card mesh
  const orbitControlsRef = useRef<OrbitControlsImpl>(null!); // Ref for the OrbitControls

  // State to trigger reset animation
  const [isResetting, setIsResetting] = useState(false);
  // Store initial target and position from controls once available
  const initialTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const initialPosition = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 3)); // Default, update from controls

  useEffect(() => {
    // Capture initial state once controls are mounted
    // Add a small delay to ensure controls have initialized position0/target0
    const timer = setTimeout(() => {
      if (orbitControlsRef.current) {
        initialTarget.current.copy(orbitControlsRef.current.target0);
        initialPosition.current.copy(orbitControlsRef.current.position0);
      }
    }, 0); // Execute after the current call stack
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []); // Run once on mount

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useFrame((_state, _delta) => {
    const controls = orbitControlsRef.current;
    if (!controls) return;

    if (isResetting) {
      // Smoothly interpolate target and position back to initial values
      controls.target.lerp(initialTarget.current, 0.1); // Adjust lerp factor (0.1) for speed
      controls.object.position.lerp(initialPosition.current, 0.1);

      // Check if close enough to stop resetting
      const targetDistance = controls.target.distanceToSquared(
        initialTarget.current,
      );
      const positionDistance = controls.object.position.distanceToSquared(
        initialPosition.current,
      );

      // Use a slightly larger threshold to avoid floating point issues
      if (targetDistance < 0.0001 && positionDistance < 0.0001) {
        // Snap to final position and stop animation
        controls.target.copy(initialTarget.current);
        controls.object.position.copy(initialPosition.current);
        setIsResetting(false);
      }
      // Ensure update is called during lerp
      controls.update();
    } else if (controls.enabled && controls.enableDamping) {
      // Only call update if damping is enabled and not resetting
      // This prevents update being called unnecessarily when static
      controls.update();
    }
  });

  // Create a gradient texture for the front face
  const gradientTexture = React.useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      if (owned) {
        grad.addColorStop(0, "#e2f1ff"); // blue-100
        grad.addColorStop(1, "#1e40af"); // blue-900
      } else {
        grad.addColorStop(0, "#d1d5db"); // gray-300
        grad.addColorStop(1, "#6b7280"); // gray-500
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
    }
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [owned]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <mesh ref={meshRef} scale={[1, 1, 0.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial attach="material-0" color={borderColour} />
        <meshStandardMaterial attach="material-1" color={borderColour} />
        <meshStandardMaterial attach="material-2" color={borderColour} />
        <meshStandardMaterial attach="material-3" color={borderColour} />
        {/* Front face: gradient */}
        <meshStandardMaterial attach="material-4" map={gradientTexture} />
        {/* Back face: card back image */}
        <meshStandardMaterial attach="material-5" map={backTexture} />
      </mesh>

      {/* Card image plane, halfway between front face and overlays */}
      <mesh position={[0, 0, 0.03]} scale={[1, 1, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={frontTexture} transparent />
      </mesh>

      {/* Overlay planes on the front face */}
      {overlayTextures &&
        overlayTextures.length > 0 &&
        overlayTextures.map((_tex, idx) => {
          // Position overlays spaced horizontally, above the card face
          const positions = [
            { x: -0.26, y: 0.34 }, // Top
            { x: -0.26, y: 0.0 }, // Bottom
            { x: -0.34, y: 0.17 }, // Left
            { x: -0.18, y: 0.17 }, // Right
          ];
          const { x, y } = positions[idx] || { x: 0, y: 0 }; // Fallback to 0,0 if idx is out of range
          const z = 0.1; // Just above the front face
          const overlayTexture = overlayLoadedTextures[idx] || undefined;
          return (
            <mesh key={idx} position={[x, y, z]} scale={[0.15, 0.15, 1]}>
              <planeGeometry args={[1, 1]} />
              {overlayTexture ? (
                <meshStandardMaterial map={overlayTexture} transparent />
              ) : (
                <meshStandardMaterial
                  color={"white"}
                  opacity={0.7}
                  transparent
                />
              )}
            </mesh>
          );
        })}

      <OrbitControls
        ref={orbitControlsRef}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={2 * (Math.PI / 3)}
        minAzimuthAngle={-Math.PI / 8}
        maxAzimuthAngle={Math.PI / 8}
        rotateSpeed={0.8}
        enableDamping={true} // Enable damping for smooth manual control AND reset animation
        dampingFactor={0.1}
        onEnd={() => {
          setIsResetting(true);
        }}
      />
    </>
  );
};
// --- End CardMeshContent Component ---

// --- CardModelViewer Component --- (Modified)
const CardModelViewer: React.FC<CardModelViewerProps> = ({ card, onClose }) => {
  const actualCardFrontImage = cardImageFromKind(card.kind, card.edition); // Use the card's kind to get the image

  let borderColour = "gray";
  switch (card.rarity) {
    case "common":
      borderColour = "gray";
      break;
    case "uncommon":
      borderColour = "green";
      break;
    case "rare":
      borderColour = "blue";
      break;
    case "ultra-rare":
      borderColour = "red";
      break;
    case "legendary":
      borderColour = "purple";
      break;
  }

  // Example overlay textures (replace with real ones as needed)
  const overlayTextures = [
    // You can use URLs or import images/textures here
    // e.g. require('../assets/images/overlay1.png'), ...
    numberImage(card.up),
    numberImage(card.down),
    numberImage(card.left),
    numberImage(card.right),
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Overlay */}
      <div
        className="relative aspect-square h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Canvas camera={{ position: [0, 0, 3], fov: 21 }}>
          <Suspense fallback={null}>
            {/* Render the component that uses the hooks */}
            <CardMeshContent
              borderColour={borderColour}
              frontImage={actualCardFrontImage}
              backImage={cardBack}
              overlayTextures={overlayTextures} // Pass overlays
              owned={!!card.owned}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};
// --- End CardModelViewer Component ---

interface CardGridProps {
  cards: LibraryCardProps[];
}

// --- Create a Memoized Card Item Component ---
interface GridCardItemProps {
  card: LibraryCardProps;
  quantity: number;
  onSelect: (card: LibraryCardProps) => void;
}

const GridCardItem: React.FC<GridCardItemProps> = memo(
  ({ card, quantity, onSelect }) => {
    return (
      <div
        key={card.kind} // Key should ideally be on the component usage in the map
        className="cursor-pointer overflow-hidden rounded-lg bg-gray-800 shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
        onClick={() => card.owned && onSelect(card)} // Only allow selection if owned
      >
        <div className="relative aspect-square w-full">
          {card.owned ? (
            <>
              <CardDetail
                className={"opacity-100"} // Always full opacity when rendered here
                colour={card.colour}
                edition={card.edition}
                kind={card.kind}
                up={card.up}
                down={card.down}
                left={card.left}
                right={card.right}
                name={card.name}
              />
              {/* Overlay for name/count on hover (optional) */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2 opacity-0 transition-opacity duration-300 hover:opacity-100">
                {card.acquiredAt && (
                  <div className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-gray-900 p-1.5 text-xs font-medium text-amber-500">
                    {quantity >= 1 && ` x${quantity}`}
                  </div>
                )}

                {card.acquiredAt && (
                  <div className="absolute bottom-2 left-2 flex items-center justify-center rounded-full bg-black p-1.5">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 text-amber-500" />
                      <span className="ml-1 text-[10px] font-medium text-amber-400">
                        {new Date(card.acquiredAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Basic info visible when not hovered */}
              <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-1 transition-opacity duration-300 group-hover:opacity-0">
                <h3 className="truncate text-center text-xs font-medium text-white">
                  {card.name}
                </h3>
              </div>
            </>
          ) : (
            // Render placeholder for unowned cards
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-700 opacity-50">
              <QuestionMarkCircleIcon className="h-1/2 w-1/2 text-gray-400" />
              <h3 className="absolute bottom-1 w-full truncate p-1 text-center text-xs font-medium text-gray-300">
                {card.name}
              </h3>
            </div>
          )}
        </div>
      </div>
    );
  },
);
// --- End Memoized Card Item Component ---

const CardGrid: React.FC<CardGridProps> = ({ cards }) => {
  const [selectedCard, setSelectedCard] = useState<LibraryCardProps | null>(
    null,
  );

  // useCallback ensures this function reference doesn't change on every render
  // unless 'cards' changes, preventing unnecessary re-renders of GridCardItem
  // if quantity calculation was complex. (Simple here, but good practice).
  const getQuantity = React.useCallback(
    (kind: number): number => {
      return (
        cards.filter((card) => card.owned && card.kind === kind).length || 0
      );
    },
    [cards],
  ); // Dependency array includes 'cards'

  // useCallback for the selection handler
  const handleSelectCard = React.useCallback((card: LibraryCardProps) => {
    setSelectedCard(card);
  }, []); // Empty dependency array: this function never needs to change

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {cards.map((card) => (
          // Use the memoized component
          <GridCardItem
            key={card.kind} // Key goes here now
            card={card}
            quantity={getQuantity(card.kind)}
            onSelect={handleSelectCard}
          />
        ))}
      </div>

      <Dialog
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          {selectedCard && (
            <CardModelViewer
              card={selectedCard}
              onClose={() => setSelectedCard(null)} // Keep this simple inline function
            />
          )}
        </div>
      </Dialog>
    </>
  );
};

export default CardGrid;
