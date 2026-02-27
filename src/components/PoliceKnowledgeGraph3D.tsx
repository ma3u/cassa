import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface Node {
  id: string
  label: string
  type: 'person' | 'case' | 'evidence' | 'location' | 'communication' | 'law'
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
}

interface Edge {
  source: string
  target: string
  type: string
}

const nodeColors = {
  person: 0xff6b6b,
  case: 0x4ecdc4,
  evidence: 0xffe66d,
  location: 0x95e1d3,
  communication: 0xffa07a,
  law: 0x9b59b6
}

const nodeLabels = {
  person: '👤 Person',
  case: '📋 Verfahren',
  evidence: '🔍 Beweismittel',
  location: '📍 Ort',
  communication: '💬 Kommunikation',
  law: '⚖️ Rechtsgrundlage'
}

export function PoliceKnowledgeGraph3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const edgeLinesRef = useRef<THREE.Line[]>([])
  
  const [isAnimating, setIsAnimating] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xfafafa)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 50
    camera.position.y = 20
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 10)
    scene.add(directionalLight)

    initializeGraph()

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current?.dispose()
    }
  }, [])

  const initializeGraph = () => {
    const nodes: Node[] = [
      { id: 'suspect1', label: 'Max Müller', type: 'person', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'suspect2', label: 'Anna Schmidt', type: 'person', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'witness1', label: 'Peter Weber', type: 'person', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'case1', label: 'OK-Ermittlung 2024', type: 'case', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'case2', label: 'Cybercrime-Fall', type: 'case', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'evidence1', label: 'Handy', type: 'evidence', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'evidence2', label: 'Dokumente', type: 'evidence', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'evidence3', label: 'Server-Logs', type: 'evidence', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'location1', label: 'Hamburg', type: 'location', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'location2', label: 'München', type: 'location', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'comm1', label: 'TKÜ-Daten', type: 'communication', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'comm2', label: 'Chat-Protokolle', type: 'communication', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'law1', label: '§ 100a StPO', type: 'law', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'law2', label: '§ 81b StPO', type: 'law', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
    ]

    const edges: Edge[] = [
      { source: 'suspect1', target: 'case1', type: 'verdächtig in' },
      { source: 'suspect2', target: 'case1', type: 'verdächtig in' },
      { source: 'suspect1', target: 'suspect2', type: 'bekannt mit' },
      { source: 'witness1', target: 'case1', type: 'Zeuge in' },
      { source: 'evidence1', target: 'suspect1', type: 'gehört zu' },
      { source: 'evidence2', target: 'case1', type: 'Beweis in' },
      { source: 'evidence3', target: 'case2', type: 'Beweis in' },
      { source: 'suspect2', target: 'case2', type: 'verdächtig in' },
      { source: 'location1', target: 'case1', type: 'Tatort' },
      { source: 'location2', target: 'case2', type: 'Tatort' },
      { source: 'comm1', target: 'suspect1', type: 'überwacht' },
      { source: 'comm2', target: 'suspect2', type: 'sichergestellt' },
      { source: 'law1', target: 'comm1', type: 'Rechtsgrundlage' },
      { source: 'law2', target: 'evidence1', type: 'Rechtsgrundlage' },
    ]

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2
      const radius = 25
      node.x = Math.cos(angle) * radius
      node.y = (Math.random() - 0.5) * 15
      node.z = Math.sin(angle) * radius
      node.vx = (Math.random() - 0.5) * 0.1
      node.vy = (Math.random() - 0.5) * 0.1
      node.vz = (Math.random() - 0.5) * 0.1
    })

    nodesRef.current = nodes
    edgesRef.current = edges

    createNodeMeshes()
    createEdgeLines()
  }

  const createNodeMeshes = () => {
    if (!sceneRef.current) return

    nodesRef.current.forEach(node => {
      const geometry = new THREE.SphereGeometry(1.5, 32, 32)
      const material = new THREE.MeshPhongMaterial({ 
        color: nodeColors[node.type],
        emissive: nodeColors[node.type],
        emissiveIntensity: 0.2
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(node.x, node.y, node.z)
      mesh.userData = { id: node.id, label: node.label, type: node.type }
      
      sceneRef.current!.add(mesh)
      nodeMeshesRef.current.set(node.id, mesh)
    })
  }

  const createEdgeLines = () => {
    if (!sceneRef.current) return

    edgeLinesRef.current.forEach(line => sceneRef.current!.remove(line))
    edgeLinesRef.current = []

    edgesRef.current.forEach(edge => {
      const sourceNode = nodesRef.current.find(n => n.id === edge.source)
      const targetNode = nodesRef.current.find(n => n.id === edge.target)
      
      if (sourceNode && targetNode) {
        const points = [
          new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
          new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)
        ]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({ 
          color: 0xcccccc,
          opacity: 0.5,
          transparent: true
        })
        const line = new THREE.Line(geometry, material)
        sceneRef.current!.add(line)
        edgeLinesRef.current.push(line)
      }
    })
  }

  const updatePhysics = () => {
    const centerForce = 0.001
    const repulsionForce = 0.5
    const attractionForce = 0.01
    const damping = 0.95

    nodesRef.current.forEach(node => {
      node.vx -= node.x * centerForce
      node.vy -= node.y * centerForce
      node.vz -= node.z * centerForce

      nodesRef.current.forEach(otherNode => {
        if (node.id !== otherNode.id) {
          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          const dz = node.z - otherNode.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
          const force = repulsionForce / (dist * dist)
          node.vx += dx * force
          node.vy += dy * force
          node.vz += dz * force
        }
      })

      edgesRef.current.forEach(edge => {
        if (edge.source === node.id || edge.target === node.id) {
          const other = nodesRef.current.find(n => 
            n.id === (edge.source === node.id ? edge.target : edge.source)
          )
          if (other) {
            const dx = other.x - node.x
            const dy = other.y - node.y
            const dz = other.z - node.z
            node.vx += dx * attractionForce
            node.vy += dy * attractionForce
            node.vz += dz * attractionForce
          }
        }
      })

      node.vx *= damping
      node.vy *= damping
      node.vz *= damping

      node.x += node.vx
      node.y += node.vy
      node.z += node.vz
    })
  }

  const animate = () => {
    animationIdRef.current = requestAnimationFrame(animate)

    if (isAnimating) {
      updatePhysics()
    }

    nodesRef.current.forEach(node => {
      const mesh = nodeMeshesRef.current.get(node.id)
      if (mesh) {
        mesh.position.set(node.x, node.y, node.z)
      }
    })

    createEdgeLines()

    if (cameraRef.current && sceneRef.current) {
      const time = Date.now() * 0.0001
      cameraRef.current.position.x = Math.sin(time) * 50
      cameraRef.current.position.z = Math.cos(time) * 50
      cameraRef.current.lookAt(0, 0, 0)
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
  }

  const handlePlayPause = () => {
    setIsAnimating(!isAnimating)
  }

  const handleReset = () => {
    initializeGraph()
    setIsAnimating(true)
  }

  return (
    <Card className="border-2 overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">3D Knowledge Graph Visualisierung</CardTitle>
            <CardDescription className="text-base">
              Interaktive Darstellung eines typischen Ermittlungskomplexes mit Personen, Beweismitteln und Rechtsgrundlagen
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef} 
          className="w-full h-[500px] rounded-lg bg-muted/20"
        />
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(nodeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: `#${nodeColors[type as keyof typeof nodeColors].toString(16).padStart(6, '0')}` }}
              />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
