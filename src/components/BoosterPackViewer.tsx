import { CubeIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { PurchaseKind } from "../shared/shop";

type BoosterPackViewerProps = {
  packKey: PurchaseKind;
  onClose: () => void;
  onOpenComplete: () => Promise<void>;
  children?: React.ReactNode;
};

type BoosterPackMeshProps = {
  packKey: PurchaseKind;
};

const BOOSTER_TIERS = {
  basic: {
    name: "Bronze",
    color: "#cd7f32",
    metallic: 0.7,
    roughness: 0.45,
    iridescence: 0.15,
  },
  premium: {
    name: "Silver",
    color: "#C0C0C0",
    metallic: 0.85,
    roughness: 0.28,
    iridescence: 0.35,
  },
  ultimate: {
    name: "Gold",
    color: "#e6e68a", // silver with a yellow tint
    metallic: 0.85,
    roughness: 0.28,
    iridescence: 0.35,
  },
};

const BoosterPackMesh: React.FC<BoosterPackMeshProps> = ({ packKey }) => {
  const tier = BOOSTER_TIERS[packKey] || BOOSTER_TIERS.basic;

  // Load texture for front/back
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load("/booster_pack_texture.png");
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Custom shader material for sides (iridescent metallic)
  const sideMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(tier.color) },
        metallic: { value: tier.metallic },
        roughness: { value: tier.roughness },
        iridescence: { value: tier.iridescence },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float metallic;
        uniform float roughness;
        uniform float iridescence;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          float facing = dot(normalize(vNormal), normalize(vViewPosition));
          facing = clamp(facing, 0.0, 1.0);
          // Always keep some base color visible
          float base = 0.38; // lower base brightness for more texture visibility
          float dynamic = 0.62 * facing;
          float irid = pow(1.0 - facing, 2.0) * iridescence;
          vec3 iridColor = mix(color, vec3(0.6,0.8,1.0), irid) + 0.15 * sin(time + vNormal.xyx * 8.0);
          float bright = base + dynamic;
          // Add a subtle rim light for realism
          float rim = pow(1.0 - facing, 2.5) * 0.32;
          vec3 finalColor = iridColor * bright + rim * vec3(1.0, 0.95, 0.7);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, [tier]);

  useFrame(({ clock }) => {
    if (sideMaterial.uniforms.time) {
      sideMaterial.uniforms.time.value = clock.getElapsedTime();
    }
  });

  // Materials for each face
  const materials = useMemo(() => {
    // 0: right, 1: left, 2: top, 3: bottom, 4: front, 5: back
    return [
      sideMaterial, // right
      sideMaterial, // left
      sideMaterial, // top
      sideMaterial, // bottom
      new THREE.MeshPhysicalMaterial({
        map: texture,
        color: "white",
        metalness: tier.metallic,
        roughness: tier.roughness,
        clearcoat: 0.3 + tier.iridescence * 0.5,
        clearcoatRoughness: 0.1,
        reflectivity: 0.4 + tier.iridescence * 0.3,
        sheen: tier.iridescence * 0.5,
        sheenColor: new THREE.Color(tier.color),
      }), // front
      new THREE.MeshPhysicalMaterial({
        map: texture,
        color: "white",
        metalness: tier.metallic,
        roughness: tier.roughness,
        clearcoat: 0.3 + tier.iridescence * 0.5,
        clearcoatRoughness: 0.1,
        reflectivity: 0.4 + tier.iridescence * 0.3,
        sheen: tier.iridescence * 0.5,
        sheenColor: new THREE.Color(tier.color),
      }), // back
    ];
  }, [texture, sideMaterial, tier]);

  return (
    <group>
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[0.7, 1.1, 0.03]} />
      </mesh>
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
    <div className="relative flex flex-col items-center rounded-lg bg-gray-900 p-6 shadow-lg">
      <button
        className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
        onClick={onClose}
        aria-label="Close"
        type="button"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <h1 className="mb-2 text-2xl font-bold text-amber-400">Buy a Booster</h1>
      <h2 className="mb-4 text-lg text-gray-300">{packKey}</h2>
      <div className="mb-6 flex w-full justify-center" style={{ height: 320 }}>
        <Canvas shadows camera={{ position: [0, 0, 2.3], fov: 30 }}>
          {/* Improved Lighting for more vivid packs */}
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[2, 4, 3]}
            intensity={2.2}
            castShadow
            color="#fffbe6"
          />
          <directionalLight
            position={[-2, 2, 3]}
            intensity={1.5}
            color="#fffde0"
          />
          <spotLight
            position={[0, 5, 2]}
            angle={0.3}
            penumbra={0.7}
            intensity={1.5}
            castShadow
            color="#fff"
          />
          <BoosterPackMesh packKey={packKey} />
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
      <button
        className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white shadow transition hover:bg-amber-600"
        onClick={onOpenComplete}
      >
        <CubeIcon className="h-5 w-5 text-white" />
        Confirm Purchase
      </button>
      {children}
    </div>
  );
};

export default BoosterPackViewer;
