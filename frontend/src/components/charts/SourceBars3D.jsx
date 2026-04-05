import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';

const SOURCE_COLORS = ['#6d28d9', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const HorizontalBar = ({ data, index, max, color }) => {
  const [hovered, setHover] = useState(false);

  // Consistent dimensions
  const height = 0.45;
  const depth = 0.45;
  const gap = 0.25;
  
  // Width calculation (X axis length)
  const normalizedWidth = max > 0 ? (data.count / max) * 4.5 : 0.05;
  const width = Math.max(normalizedWidth, 0.05); 
  
  // Y position (stacking downwards from top)
  const posY = -index * (height + gap) + 1.2;

  return (
    <group position={[0, posY, 0]}>
      {/* Label (Source name) perfectly aligned to the left */}
      <Html position={[-0.5, 0, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', width: '80px', textAlign: 'right', whiteSpace: 'nowrap' }}>
            {data.source}
        </div>
      </Html>

      {/* 3D Bar aligned cleanly based on width */}
      <mesh
        position={[width / 2, 0, 0]} 
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.4} 
          metalness={0.1}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Hover Tooltip perfectly attached to the end of the bar */}
      {hovered && (
        <Html position={[width + 0.1, 0, 0]} style={{ pointerEvents: 'none', zIndex: 10 }}>
            <div style={{
                background: 'rgba(17, 24, 39, 0.95)',
                border: `1px solid ${color}`,
                padding: '4px 8px',
                borderRadius: '6px',
                color: '#fff',
                whiteSpace: 'nowrap',
                boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transform: 'translate(0, -50%)'
            }}>
               <span style={{fontWeight: 'bold'}}>{data.count}</span> Leads
            </div>
        </Html>
      )}
    </group>
  );
};

export default function SourceBars3D({ data }) {
    if (!data || data.length === 0) {
        return <div style={{ color: '#4b6280', textAlign: 'center', padding: '40px 0' }}>No source data</div>;
    }

    const maxVal = Math.max(...data.map(d => d.count), 1);

    return (
        <div style={{ width: '100%', height: '220px' }}>
            {/* Very low FOV for flat isometric projection feeling */}
            <Canvas camera={{ position: [0, 2, 7], fov: 30 }}>
                {/* Soft, even lighting */}
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 10, 8]} intensity={1.5} castShadow />

                <group position={[-1.5, 0, 0]}> 
                    {data.map((d, i) => (
                        <HorizontalBar 
                            key={d.source} 
                            data={d} 
                            index={i} 
                            max={maxVal} 
                            color={SOURCE_COLORS[i % SOURCE_COLORS.length]} 
                        />
                    ))}
                    
                    {/* Reference plane to anchor visual depth */}
                    <mesh position={[2.5, 0, -0.5]} rotation={[0, 0, 0]}>
                        <planeGeometry args={[7, 4]} />
                        <meshStandardMaterial color="#0b1120" transparent opacity={0.6} />
                    </mesh>
                </group>

                {/* Subtle depth shadow across the backboard */}
                <ContactShadows position={[0, -1, 0]} opacity={0.2} scale={10} blur={2.5} far={2} color="#000" />
                <Environment preset="city" />
                
                {/* Minimal perspective tilt adjustments */}
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false} 
                    maxPolarAngle={Math.PI / 2} 
                    minPolarAngle={Math.PI / 2.5}
                    maxAzimuthAngle={Math.PI / 8}
                    minAzimuthAngle={-Math.PI / 16}
                />
            </Canvas>
        </div>
    );
}
