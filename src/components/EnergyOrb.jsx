import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const PARTICLE_COUNT = 4600
const SHELL_RADIUS = 1.34

function ParticleShell() {
  const pointsRef = useRef(null)
  const positionsRef = useRef(null)
  const basePositionsRef = useRef(null)
  const randomOffsetsRef = useRef(null)
  const pointerTargetRef = useRef(new THREE.Vector3())
  const tempVector = useMemo(() => new THREE.Vector3(), [])
  const pointerVector = useMemo(() => new THREE.Vector3(), [])
  const { viewport } = useThree()

  useEffect(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const basePositions = new Float32Array(PARTICLE_COUNT * 3)
    const randomOffsets = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const stride = i * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const edgeBias = Math.random() ** 0.25
      const shellNoise = 0.92 + edgeBias * 0.3
      const wave = 1 + Math.sin(theta * 3.2) * 0.08 + Math.cos(phi * 4.4) * 0.07
      const radius = SHELL_RADIUS * shellNoise * wave

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)

      positions[stride] = x
      positions[stride + 1] = y
      positions[stride + 2] = z

      basePositions[stride] = x
      basePositions[stride + 1] = y
      basePositions[stride + 2] = z
      randomOffsets[i] = Math.random() * Math.PI * 2
    }

    positionsRef.current = positions
    basePositionsRef.current = basePositions
    randomOffsetsRef.current = randomOffsets

    if (pointsRef.current) {
      pointsRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3),
      )
    }
  }, [])

  useFrame((state) => {
    const points = pointsRef.current
    const positions = positionsRef.current
    const basePositions = basePositionsRef.current
    const randomOffsets = randomOffsetsRef.current

    if (!points || !positions || !basePositions || !randomOffsets) return

    const time = state.clock.elapsedTime
    const pointerX = state.pointer.x * (viewport.width / 3.4)
    const pointerY = state.pointer.y * (viewport.height / 3.4)

    pointerTargetRef.current.set(pointerX, pointerY, 0.42)

    points.rotation.y = time * 0.08
    points.rotation.x = 0.2 + Math.sin(time * 0.24) * 0.06
    points.rotation.z = time * 0.04

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const stride = i * 3
      const offset = randomOffsets[i]

      tempVector.set(
        basePositions[stride],
        basePositions[stride + 1],
        basePositions[stride + 2],
      )

      const pulse = 1 + Math.sin(time * 1.8 + offset) * 0.032
      const shimmer = Math.cos(time * 1.15 + offset) * 0.022

      tempVector.multiplyScalar(pulse)

      pointerVector.copy(pointerTargetRef.current).sub(tempVector)
      const distance = pointerVector.length()

      if (distance < 0.8) {
        const influence = (1 - distance / 0.8) ** 2
        pointerVector.normalize().multiplyScalar(influence * 0.22)
        tempVector.add(pointerVector)
      }

      const normal = tempVector.clone().normalize()
      tempVector.addScaledVector(normal, shimmer)

      positions[stride] = tempVector.x
      positions[stride + 1] = tempVector.y
      positions[stride + 2] = tempVector.z
    }

    points.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry />
        <pointsMaterial
          color="#ffffff"
          size={0.024}
          transparent
          opacity={0.94}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      <mesh scale={1.42}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.014} wireframe />
      </mesh>
    </group>
  )
}

function EnergyOrb() {
  return (
    <div className="energy-orb">
      <Canvas camera={{ position: [0, 0, 4.1], fov: 38 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[2.5, 1.2, 4]} intensity={7} color="#ffffff" />
        <pointLight position={[-2.2, -1.4, 3.2]} intensity={3} color="#c4b5fd" />
        <ParticleShell />
      </Canvas>
    </div>
  )
}

export default EnergyOrb
