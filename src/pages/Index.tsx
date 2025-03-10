
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Index = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cubeCount, setCubeCount] = useState(50);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 15;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Create cubes
    const cubes: THREE.Mesh[] = [];
    const createCubes = (count: number) => {
      // Clear existing cubes
      cubes.forEach(cube => scene.remove(cube));
      cubes.length = 0;
      
      for (let i = 0; i < count; i++) {
        const geometry = new THREE.BoxGeometry(
          Math.random() * 2 + 0.5,
          Math.random() * 2 + 0.5,
          Math.random() * 2 + 0.5
        );
        
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(
            Math.random(),
            Math.random(),
            Math.random()
          ),
          shininess: 100,
          specular: new THREE.Color(0xffffff)
        });
        
        const cube = new THREE.Mesh(geometry, material);
        
        // Position cubes in a spherical arrangement
        const radius = 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        cube.position.x = radius * Math.sin(phi) * Math.cos(theta);
        cube.position.y = radius * Math.sin(phi) * Math.sin(theta);
        cube.position.z = radius * Math.cos(phi);
        
        // Random rotation
        cube.rotation.x = Math.random() * Math.PI;
        cube.rotation.y = Math.random() * Math.PI;
        cube.rotation.z = Math.random() * Math.PI;
        
        scene.add(cube);
        cubes.push(cube);
      }
    };
    
    createCubes(cubeCount);
    setIsLoading(false);
    
    // Mouse interaction
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate cubes
      cubes.forEach((cube, i) => {
        cube.rotation.x += 0.005 + (i % 5) * 0.001;
        cube.rotation.y += 0.01 + (i % 3) * 0.001;
        
        // Make cubes respond to mouse position
        const distanceX = (mouse.x * 5) - cube.position.x;
        const distanceY = (mouse.y * 5) - cube.position.y;
        cube.position.x += distanceX * 0.01;
        cube.position.y += distanceY * 0.01;
        
        // Keep cubes within bounds
        const maxDistance = 15;
        const distance = cube.position.length();
        if (distance > maxDistance) {
          cube.position.multiplyScalar(maxDistance / distance);
        }
      });
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      
      // Dispose geometries and materials
      cubes.forEach(cube => {
        cube.geometry.dispose();
        (cube.material as THREE.Material).dispose();
      });
    };
  }, [cubeCount]);

  return (
    <div className="relative w-full h-screen">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Loading 3D Scene...</h2>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Three.js Interactive Cubes</h1>
          <p className="text-gray-600 mb-4">Drag to rotate. Scroll to zoom.</p>
          
          <div className="mb-4">
            <label htmlFor="cubeCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Cubes: {cubeCount}
            </label>
            <input
              id="cubeCount"
              type="range"
              min="10"
              max="200"
              value={cubeCount}
              onChange={(e) => setCubeCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Move your mouse to interact with the cubes</p>
          </div>
        </div>
      </div>
      
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default Index;
