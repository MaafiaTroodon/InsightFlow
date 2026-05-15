import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeHero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    // Particle field
    const COUNT = 1200;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const t = Math.random();
      if (t < 0.6) {
        // teal
        colors[i*3]   = 0.12;
        colors[i*3+1] = 0.69;
        colors[i*3+2] = 0.67;
      } else if (t < 0.85) {
        // gold
        colors[i*3]   = 0.96;
        colors[i*3+1] = 0.62;
        colors[i*3+2] = 0.04;
      } else {
        // sky
        colors[i*3]   = 0.22;
        colors[i*3+1] = 0.74;
        colors[i*3+2] = 0.97;
      }
      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Connecting lines (sparse)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1fb0aa, transparent: true, opacity: 0.06 });
    for (let i = 0; i < 30; i++) {
      const a = Math.floor(Math.random() * COUNT);
      const b = Math.floor(Math.random() * COUNT);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(positions[a*3], positions[a*3+1], positions[a*3+2]),
        new THREE.Vector3(positions[b*3], positions[b*3+1], positions[b*3+2]),
      ]);
      scene.add(new THREE.Line(lineGeo, lineMat));
    }

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    const handleMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse);

    // Resize
    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Animate
    let frame;
    let t = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      t += 0.0008;
      particles.rotation.y  = t * 0.15 + mouse.x * 0.04;
      particles.rotation.x  = t * 0.08 + mouse.y * 0.03;
      particles.rotation.z  = t * 0.05;
      mat.opacity = 0.55 + Math.sin(t * 2) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
