import React, { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const Slice = ({ data, startAngle, endAngle, innerRadius, outerRadius, color }) => {
  const [hovered, setHover] = useState(false);
  const meshRef = useRef();

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);
    s.absarc(0, 0, outerRadius, startAngle, endAngle, false);
    s.lineTo(Math.cos(endAngle) * innerRadius, Math.sin(endAngle) * innerRadius);
    s.absarc(0, 0, innerRadius, endAngle, startAngle, true);
    return s;
  }, [startAngle, endAngle, innerRadius, outerRadius]);

  const extrudeSettings = { 
    depth: 0.4, 
    bevelEnabled: true, 
    bevelSegments: 4, 
    steps: 1, 
    bevelSize: 0.015, 
    bevelThickness: 0.015 
  };
  
  // Center of slice for hover lifting and tooltips
  const midAngle = (startAngle + endAngle) / 2;
  const midRadius = (innerRadius + outerRadius) / 2;
  const labelX = Math.cos(midAngle) * midRadius;
  const labelY = Math.sin(midAngle) * midRadius;

  useFrame(() => {
    if (meshRef.current) {
        // Subtle Z-lift on hover, no scaling
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, hovered ? 0.15 : 0, 0.1);
    }
  });

  return (
    <group ref={meshRef}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.3} 
          metalness={0.1} 
          emissive={color}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
      
      {hovered && (
        <Html position={[labelX, labelY, 0.6]} center style={{ pointerEvents: 'none', zIndex: 10 }}>
            <div style={{
                background: 'rgba(17, 24, 39, 0.95)',
                border: `1px solid ${color}`,
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#fff',
                whiteSpace: 'nowrap',
                boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
                fontSize: '0.85rem'
            }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{data.name}</div>
                <div style={{ fontWeight: 'bold' }}>{data.value} Leads</div>
            </div>
        </Html>
      )}
    </group>
  );
};

export default function PipelineDonut3D({ data }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  
  if (total === 0) {
      return <div style={{ color: '#4b6280', textAlign: 'center', padding: '40px 0' }}>No pipeline data to visualize</div>;
  }

  let currentAngle = 0;
  const slices = data.map((d) => {
    const angle = (d.value / total) * Math.PI * 2;
    const slice = {
      ...d,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return slice;
  });

  return (
    <div style={{ width: '100%', height: '260px' }}>
      {/* Lower FOV reduces distortion for a natural product feel */}
      <Canvas camera={{ position: [0, 4, 4], fov: 35 }}>
        {/* Soft, clean lighting */}
        <ambientLight intensity={0.7} color="#ffffff" />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#e2e8f0" />
        
        {/* Group perfectly flat, rotated -90deg on X to lay on the ground */}
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          {slices.map((slice) => (
            <Slice 
              key={slice.name} 
              data={slice} 
              startAngle={slice.startAngle} 
              endAngle={slice.endAngle} 
              innerRadius={1.1} 
              outerRadius={1.7} 
              color={slice.color}
            />
          ))}
        </group>

        {/* Soft subtle shadow on the floor */}
        <ContactShadows position={[0, -0.21, 0]} opacity={0.3} scale={10} blur={2.5} far={2} color="#000" />
        <Environment preset="city" />
        
        {/* Only camera handles the tilt angle. Restricted between 20-35 degrees */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 3} 
          minPolarAngle={Math.PI / 6} 
        />
      </Canvas>
    </div>
  );
}
