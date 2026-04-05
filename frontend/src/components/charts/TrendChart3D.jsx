import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';

const Bar = ({ data, index, total, max, color }) => {
  const [hovered, setHover] = useState(false);

  // Consistent dimensions
  const width = 0.45;
  const depth = 0.45;
  const gap = 0.25;
  
  // Center the whole chart
  const totalWidth = (total * width) + ((total - 1) * gap);
  const startX = -totalWidth / 2 + (width / 2);
  const posX = startX + index * (width + gap);
  
  // Height calculation relative to max data (min height 0.05)
  const normalizedHeight = max > 0 ? (data.count / max) * 2.5 : 0.05;
  const height = Math.max(normalizedHeight, 0.05); 

  return (
    <group position={[posX, 0, 0]}>
      {/* Box resting perfectly flat on the bottom (Y = height / 2) */}
      <mesh
        position={[0, height / 2, 0]}
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

      {/* Date Label on axis */}
      <Html position={[0, -0.2, 0.4]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.65rem', whiteSpace: 'nowrap', transform: 'rotate(-45deg)' }}>
            {data.date?.slice(5) || data.name}
        </div>
      </Html>

      {/* Hover Tooltip */}
      {hovered && (
        <Html position={[0, height + 0.2, 0]} center style={{ pointerEvents: 'none', zIndex: 10 }}>
            <div style={{
                background: 'rgba(17, 24, 39, 0.95)',
                border: `1px solid ${color}`,
                padding: '6px 10px',
                borderRadius: '6px',
                color: '#fff',
                whiteSpace: 'nowrap',
                boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
                fontSize: '0.8rem'
            }}>
                <div style={{ fontWeight: 'bold' }}>{data.count} Leads</div>
            </div>
        </Html>
      )}
    </group>
  );
};

export default function TrendChart3D({ data }) {
    if (!data || data.length === 0) {
        return <div style={{ color: '#4b6280', textAlign: 'center', padding: '40px 0' }}>No recent lead activity</div>;
    }

    const maxVal = Math.max(...data.map(d => d.count), 1);

    return (
        <div style={{ width: '100%', height: '220px' }}>
            {/* Reduced FOV for clean isometric-like perspective */}
            <Canvas camera={{ position: [0, 4, 7], fov: 30 }}>
                {/* Clean studio lighting */}
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 10, 8]} intensity={1.5} castShadow />

                <group position={[0, -0.8, 0]}>
                    {data.map((d, i) => (
                        <Bar 
                            key={d.date || i} 
                            data={d} 
                            index={i} 
                            total={data.length} 
                            max={maxVal} 
                            color="#3b82f6" 
                        />
                    ))}
                    
                    {/* Floor Plane to ground everything */}
                    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[12, 4]} />
                        <meshStandardMaterial color="#0b1120" transparent opacity={0.6} />
                    </mesh>
                </group>

                {/* Subtle soft shadows */}
                <ContactShadows position={[0, -0.79, 0]} opacity={0.3} scale={12} blur={2.5} far={2} color="#000" />
                <Environment preset="city" />
                
                {/* Limited camera movement to keep it professional */}
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false} 
                    maxPolarAngle={Math.PI / 2.5} 
                    minPolarAngle={Math.PI / 6} 
                    maxAzimuthAngle={Math.PI / 8}
                    minAzimuthAngle={-Math.PI / 8}
                />
            </Canvas>
        </div>
    );
}
