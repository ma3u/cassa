import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Camera, X, Hand, ZoomIn, ZoomOut } from 'lucide-react'

interface Node {
  id: string
  label: string
  type: 'person' | 'case' | 'evidence' | 'location' | 'communication' | 'law' | 'organization' | 'account' | 'vehicle'
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
  law: 0x9b59b6,
  organization: 0xe74c3c,
  account: 0x3498db,
  vehicle: 0x2ecc71
}

const nodeLabels = {
  person: '👤 Person',
  case: '📋 Verfahren',
  evidence: '🔍 Beweismittel',
  location: '📍 Ort',
  communication: '💬 Kommunikation',
  law: '⚖️ Rechtsgrundlage',
  organization: '🏢 Organisation',
  account: '💳 Konto',
  vehicle: '🚗 Fahrzeug'
}

function createTextSprite(text: string, color: number): THREE.Sprite {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = 512
  canvas.height = 128
  
  context.fillStyle = `#${color.toString(16).padStart(6, '0')}`
  context.font = 'Bold 48px Inter, Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, 256, 64)
  
  const texture = new THREE.CanvasTexture(canvas)
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture,
    transparent: true,
    opacity: 0.9
  })
  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.scale.set(8, 2, 1)
  
  return sprite
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
  const labelSpritesRef = useRef<Map<string, THREE.Sprite>>(new Map())
  const edgeLinesRef = useRef<THREE.Line[]>([])
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const cameraPathRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const previousMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const cameraAnglesRef = useRef<{ theta: number; phi: number; radius: number }>({ 
    theta: Math.PI / 4, 
    phi: Math.PI / 6, 
    radius: 80 
  })
  
  const [isAnimating, setIsAnimating] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [connectedNodes, setConnectedNodes] = useState<string[]>([])
  const [flyThroughEnabled, setFlyThroughEnabled] = useState(true)
  const [selectedNodeData, setSelectedNodeData] = useState<Node | null>(null)
  const [relatedEdges, setRelatedEdges] = useState<Edge[]>([])
  const [isManualControl, setIsManualControl] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(60, 30, 60)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(20, 30, 20)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xffffff, 0.5)
    pointLight.position.set(-20, 20, -20)
    scene.add(pointLight)

    initializeGraph()

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !camera || !renderer || isDraggingRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const meshes = Array.from(nodeMeshesRef.current.values())
      const intersects = raycasterRef.current.intersectObjects(meshes)

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh
        const nodeId = clickedMesh.userData.id
        handleNodeClick(nodeId)
      } else {
        clearSelection()
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = false
      previousMouseRef.current = { x: event.clientX, y: event.clientY }
      setIsManualControl(true)
      setFlyThroughEnabled(false)
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (event.buttons !== 1) return
      
      isDraggingRef.current = true
      const deltaX = event.clientX - previousMouseRef.current.x
      const deltaY = event.clientY - previousMouseRef.current.y
      
      cameraAnglesRef.current.theta -= deltaX * 0.01
      cameraAnglesRef.current.phi -= deltaY * 0.01
      cameraAnglesRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAnglesRef.current.phi))
      
      previousMouseRef.current = { x: event.clientX, y: event.clientY }
      updateCameraPosition()
    }

    const handleMouseUp = () => {
      setTimeout(() => {
        isDraggingRef.current = false
      }, 100)
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      setIsManualControl(true)
      setFlyThroughEnabled(false)
      
      cameraAnglesRef.current.radius += event.deltaY * 0.05
      cameraAnglesRef.current.radius = Math.max(20, Math.min(150, cameraAnglesRef.current.radius))
      updateCameraPosition()
    }

    renderer.domElement.addEventListener('click', handleClick)
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('resize', handleResize)

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', handleClick)
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('wheel', handleWheel)
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
      { id: 'suspect1', label: 'Person A', type: 'person', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'suspect2', label: 'Person B', type: 'person', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'suspect3', label: 'Person C', type: 'person', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'witness1', label: 'Zeuge 1', type: 'person', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'witness2', label: 'Zeuge 2', type: 'person', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      
      { id: 'case1', label: 'OK-Verfahren 2024', type: 'case', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'case2', label: 'Cybercrime', type: 'case', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'case3', label: 'Geldwäsche', type: 'case', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      
      { id: 'evidence1', label: 'Handy', type: 'evidence', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'evidence2', label: 'Dokumente', type: 'evidence', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'evidence3', label: 'Server-Logs', type: 'evidence', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'evidence4', label: 'Laptop', type: 'evidence', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'evidence5', label: 'USB-Stick', type: 'evidence', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      
      { id: 'location1', label: 'Hamburg', type: 'location', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'location2', label: 'München', type: 'location', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'location3', label: 'Berlin', type: 'location', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'location4', label: 'Frankfurt', type: 'location', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      
      { id: 'comm1', label: 'TKÜ-Daten', type: 'communication', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'comm2', label: 'Chat-Protokolle', type: 'communication', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'comm3', label: 'E-Mails', type: 'communication', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'comm4', label: 'Messenger', type: 'communication', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      
      { id: 'law1', label: '§ 100a StPO', type: 'law', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'law2', label: '§ 81b StPO', type: 'law', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'law3', label: '§ 261 StGB', type: 'law', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      
      { id: 'org1', label: 'Briefkastenfirma A', type: 'organization', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'org2', label: 'Briefkastenfirma B', type: 'organization', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'org3', label: 'IT-Firma', type: 'organization', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      
      { id: 'account1', label: 'Konto DE123', type: 'account', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'account2', label: 'Konto CH456', type: 'account', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'account3', label: 'Konto LU789', type: 'account', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      
      { id: 'vehicle1', label: 'BMW M5', type: 'vehicle', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'vehicle2', label: 'Mercedes AMG', type: 'vehicle', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
    ]

    const edges: Edge[] = [
      { source: 'suspect1', target: 'case1', type: 'verdächtig in' },
      { source: 'suspect2', target: 'case1', type: 'verdächtig in' },
      { source: 'suspect3', target: 'case2', type: 'verdächtig in' },
      { source: 'suspect1', target: 'suspect2', type: 'bekannt mit' },
      { source: 'suspect2', target: 'suspect3', type: 'bekannt mit' },
      
      { source: 'witness1', target: 'case1', type: 'Zeuge in' },
      { source: 'witness2', target: 'case2', type: 'Zeuge in' },
      
      { source: 'evidence1', target: 'suspect1', type: 'gehört zu' },
      { source: 'evidence2', target: 'case1', type: 'Beweis in' },
      { source: 'evidence3', target: 'case2', type: 'Beweis in' },
      { source: 'evidence4', target: 'suspect3', type: 'gehört zu' },
      { source: 'evidence5', target: 'case3', type: 'Beweis in' },
      
      { source: 'location1', target: 'case1', type: 'Tatort' },
      { source: 'location2', target: 'case2', type: 'Tatort' },
      { source: 'location3', target: 'suspect1', type: 'Wohnort' },
      { source: 'location4', target: 'org1', type: 'Firmensitz' },
      
      { source: 'comm1', target: 'suspect1', type: 'überwacht' },
      { source: 'comm2', target: 'suspect2', type: 'sichergestellt' },
      { source: 'comm3', target: 'suspect3', type: 'analysiert' },
      { source: 'comm4', target: 'suspect2', type: 'entschlüsselt' },
      
      { source: 'law1', target: 'comm1', type: 'Rechtsgrundlage' },
      { source: 'law2', target: 'evidence1', type: 'Rechtsgrundlage' },
      { source: 'law3', target: 'case3', type: 'Rechtsgrundlage' },
      
      { source: 'suspect1', target: 'org1', type: 'Geschäftsführer' },
      { source: 'suspect2', target: 'org2', type: 'Gesellschafter' },
      { source: 'org1', target: 'org2', type: 'verbunden mit' },
      { source: 'org3', target: 'suspect3', type: 'Arbeitgeber' },
      
      { source: 'org1', target: 'account1', type: 'Kontoinhaber' },
      { source: 'org2', target: 'account2', type: 'Kontoinhaber' },
      { source: 'account1', target: 'account3', type: 'Überweisung' },
      { source: 'account2', target: 'account3', type: 'Überweisung' },
      { source: 'suspect1', target: 'account1', type: 'kontrolliert' },
      { source: 'case3', target: 'account1', type: 'Ermittlung gegen' },
      
      { source: 'vehicle1', target: 'suspect1', type: 'Halter' },
      { source: 'vehicle2', target: 'suspect2', type: 'Halter' },
      { source: 'vehicle1', target: 'case1', type: 'verwendet in' },
    ]

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2
      const radius = 40
      const height = Math.sin(i * 0.5) * 20
      node.x = Math.cos(angle) * radius
      node.y = height
      node.z = Math.sin(angle) * radius
      node.vx = (Math.random() - 0.5) * 0.08
      node.vy = (Math.random() - 0.5) * 0.08
      node.vz = (Math.random() - 0.5) * 0.08
    })

    nodesRef.current = nodes
    edgesRef.current = edges

    createNodeMeshes()
    createEdgeLines()
  }

  const createNodeMeshes = () => {
    if (!sceneRef.current) return

    nodeMeshesRef.current.forEach(mesh => sceneRef.current!.remove(mesh))
    labelSpritesRef.current.forEach(sprite => sceneRef.current!.remove(sprite))
    nodeMeshesRef.current.clear()
    labelSpritesRef.current.clear()

    nodesRef.current.forEach(node => {
      const geometry = new THREE.SphereGeometry(1.8, 32, 32)
      const material = new THREE.MeshPhongMaterial({ 
        color: nodeColors[node.type],
        emissive: nodeColors[node.type],
        emissiveIntensity: 0.3,
        shininess: 100
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(node.x, node.y, node.z)
      mesh.userData = { id: node.id, label: node.label, type: node.type }
      
      sceneRef.current!.add(mesh)
      nodeMeshesRef.current.set(node.id, mesh)

      const sprite = createTextSprite(node.label, nodeColors[node.type])
      sprite.position.set(node.x, node.y + 3, node.z)
      sceneRef.current!.add(sprite)
      labelSpritesRef.current.set(node.id, sprite)
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
        
        const isHighlighted = selectedNode && (edge.source === selectedNode || edge.target === selectedNode)
        const material = new THREE.LineBasicMaterial({ 
          color: isHighlighted ? 0xff6b6b : 0xcccccc,
          opacity: isHighlighted ? 1 : 0.3,
          transparent: true,
          linewidth: isHighlighted ? 3 : 1
        })
        const line = new THREE.Line(geometry, material)
        sceneRef.current!.add(line)
        edgeLinesRef.current.push(line)
      }
    })
  }

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId)
    const node = nodesRef.current.find(n => n.id === nodeId)
    setSelectedNodeData(node || null)

    const related = edgesRef.current.filter(e => e.source === nodeId || e.target === nodeId)
    setRelatedEdges(related)

    const connectedIds = new Set<string>()
    related.forEach(edge => {
      if (edge.source === nodeId) connectedIds.add(edge.target)
      if (edge.target === nodeId) connectedIds.add(edge.source)
    })
    setConnectedNodes(Array.from(connectedIds))

    highlightSelectedNode(nodeId, Array.from(connectedIds))
    createEdgeLines()
  }

  const clearSelection = () => {
    setSelectedNode(null)
    setSelectedNodeData(null)
    setRelatedEdges([])
    setConnectedNodes([])
    resetNodeHighlights()
    createEdgeLines()
  }

  const highlightSelectedNode = (nodeId: string, connectedIds: string[]) => {
    nodeMeshesRef.current.forEach((mesh, id) => {
      const material = mesh.material as THREE.MeshPhongMaterial
      if (id === nodeId) {
        material.emissiveIntensity = 0.8
        mesh.scale.set(1.5, 1.5, 1.5)
      } else if (connectedIds.includes(id)) {
        material.emissiveIntensity = 0.5
        mesh.scale.set(1.2, 1.2, 1.2)
      } else {
        material.emissiveIntensity = 0.1
        material.opacity = 0.3
        material.transparent = true
      }
    })
  }

  const resetNodeHighlights = () => {
    nodeMeshesRef.current.forEach(mesh => {
      const material = mesh.material as THREE.MeshPhongMaterial
      material.emissiveIntensity = 0.3
      material.opacity = 1
      material.transparent = false
      mesh.scale.set(1, 1, 1)
    })
  }

  const updateCameraPosition = () => {
    if (!cameraRef.current) return
    
    const { theta, phi, radius } = cameraAnglesRef.current
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.cos(theta)
    cameraRef.current.position.y = radius * Math.cos(phi)
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.sin(theta)
    cameraRef.current.lookAt(0, 0, 0)
  }

  const updatePhysics = () => {
    const centerForce = 0.0008
    const repulsionForce = 0.8
    const attractionForce = 0.015
    const damping = 0.92

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
      
      const sprite = labelSpritesRef.current.get(node.id)
      if (sprite) {
        sprite.position.set(node.x, node.y + 3, node.z)
      }
    })

    createEdgeLines()

    if (cameraRef.current && sceneRef.current && flyThroughEnabled && !isManualControl) {
      cameraPathRef.current += 0.0003
      const radius = 70
      const height = Math.sin(cameraPathRef.current * 0.5) * 20
      cameraRef.current.position.x = Math.sin(cameraPathRef.current) * radius
      cameraRef.current.position.y = 30 + height
      cameraRef.current.position.z = Math.cos(cameraPathRef.current) * radius
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
    clearSelection()
    initializeGraph()
    setIsAnimating(true)
    setIsManualControl(false)
    cameraPathRef.current = 0
    cameraAnglesRef.current = { 
      theta: Math.PI / 4, 
      phi: Math.PI / 6, 
      radius: 80 
    }
  }

  const toggleFlyThrough = () => {
    const newFlyThroughState = !flyThroughEnabled
    setFlyThroughEnabled(newFlyThroughState)
    if (newFlyThroughState) {
      setIsManualControl(false)
      cameraPathRef.current = 0
    }
  }

  const handleZoomIn = () => {
    setIsManualControl(true)
    setFlyThroughEnabled(false)
    cameraAnglesRef.current.radius = Math.max(20, cameraAnglesRef.current.radius - 10)
    updateCameraPosition()
  }

  const handleZoomOut = () => {
    setIsManualControl(true)
    setFlyThroughEnabled(false)
    cameraAnglesRef.current.radius = Math.min(150, cameraAnglesRef.current.radius + 10)
    updateCameraPosition()
  }

  return (
    <Card className="border-2 overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">3D Knowledge Graph Visualisierung</CardTitle>
            <CardDescription className="text-base">
              Interaktive Darstellung eines komplexen Ermittlungskomplexes. <strong>Ziehen</strong> zum Drehen, <strong>Mausrad</strong> zum Zoomen, <strong>Klicken</strong> auf Knoten für Details.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              title="Hineinzoomen"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              title="Herauszoomen"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant={isManualControl ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsManualControl(!isManualControl)
                if (!isManualControl) {
                  setFlyThroughEnabled(false)
                }
              }}
              title="Manuelle Steuerung"
            >
              <Hand className="h-4 w-4" />
            </Button>
            <Button
              variant={flyThroughEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleFlyThrough}
              title="Automatischer Kameraflug"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              title={isAnimating ? "Physik pausieren" : "Physik fortsetzen"}
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              title="Zurücksetzen"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div 
            ref={containerRef} 
            className="w-full h-[600px] rounded-lg bg-muted/20 cursor-pointer"
          />
          
          {selectedNodeData && (
            <div className="absolute top-4 left-4 bg-card/95 backdrop-blur border-2 border-primary rounded-lg p-4 shadow-xl max-w-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: `#${nodeColors[selectedNodeData.type].toString(16).padStart(6, '0')}` }}
                  />
                  <Badge variant="outline">{nodeLabels[selectedNodeData.type]}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <h4 className="font-bold text-lg mb-3">{selectedNodeData.label}</h4>
              
              {relatedEdges.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    Verbindungen ({relatedEdges.length}):
                  </p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {relatedEdges.map((edge, idx) => {
                      const otherNodeId = edge.source === selectedNodeData.id ? edge.target : edge.source
                      const otherNode = nodesRef.current.find(n => n.id === otherNodeId)
                      return (
                        <div key={idx} className="text-sm bg-muted/50 rounded p-2">
                          <span className="font-medium">{edge.type}</span>
                          {' → '}
                          <span className="text-primary">{otherNode?.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
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
