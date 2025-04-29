import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import useMeasure from 'react-use-measure';

const ParticleBackground = ({ imageState }) => {
  const [containerRef, bounds] = useMeasure();
  const sceneRef = useRef();
  const engineRef = useRef(null);
  const mouseRef = useRef(null);
  const attractorRef = useRef(null);
  
  // Configuration
  const CONFIG = {
    colors: {
      primary: '#872e1b',
      secondary: '#63854f',
      neutral: '#333333',
      neutral2: '#555555',
      highlight: '#a8b4bc',
    },
    particles: {
      count: 300,  // base count for reference 1920x1080 resolution
      minSize: 2,
      maxSize: 10,
      opacity: 0.5,
    },
    physics: {
      frictionAir: 0.02,
      restitution: 0.4,
      influenceRadius: 200,
      attractionStrength: 0.0001,
      repulsionStrength: 0.0003,
      connectionDistance: 150,
      connectionOpacity: 0.15,
    }
  };

  useEffect(() => {
    if (!bounds.width || !bounds.height) return;

    const { Engine, Render, Runner, Bodies, Body, World, Mouse, Events } = Matter;

    // Create engine and renderer
    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    engineRef.current = engine;
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: bounds.width,
        height: bounds.height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio,
      }
    });

    // Mouse attractor (invisible body following the pointer)
    const mouse = Mouse.create(render.canvas);
    mouseRef.current = mouse;
    const attractor = Bodies.circle(0, 0, 20, { isStatic: false, render: { visible: false } });
    attractorRef.current = attractor;
    World.add(engine.world, attractor);

    // Containment walls
    const wallThickness = 50;
    const walls = [
      Bodies.rectangle(bounds.width/2, -wallThickness/2, bounds.width, wallThickness, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(bounds.width/2, bounds.height+wallThickness/2, bounds.width, wallThickness, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(-wallThickness/2, bounds.height/2, wallThickness, bounds.height, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(bounds.width+wallThickness/2, bounds.height/2, wallThickness, bounds.height, { isStatic: true, render: { visible: false } }),
    ];
    World.add(engine.world, walls);

    // Compute dynamic particle count (density constant)
    const baseCount = CONFIG.particles.count;
    const baseArea = 1920 * 1080;
    let particleCount = Math.round(baseCount * (bounds.width * bounds.height) / baseArea);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) {
      particleCount = Math.round(particleCount * 0.6);
    }
    particleCount = Math.max(particleCount, 50);

    // Helpers for random attributes
    const randomPosition = () => ({
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height
    });
    const randomSize = () => 
      CONFIG.particles.minSize + Math.random() * (CONFIG.particles.maxSize - CONFIG.particles.minSize);
    const colors = [
      CONFIG.colors.primary,
      CONFIG.colors.secondary,
      CONFIG.colors.neutral,
      CONFIG.colors.neutral2,
      CONFIG.colors.highlight
    ];

    // Create particles
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const { x, y } = randomPosition();
      const size = randomSize();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = Bodies.circle(x, y, size, {
        restitution: CONFIG.physics.restitution,
        frictionAir: CONFIG.physics.frictionAir + Math.random() * 0.02,
        render: { fillStyle: color, opacity: CONFIG.particles.opacity },
        isParticle: true
      });
      // small initial velocity
      Body.setVelocity(particle, {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5
      });
      particles.push(particle);
    }
    World.add(engine.world, particles);

    // Spatial grid for connections
    let grid = {};
    const cellSize = CONFIG.physics.connectionDistance;
    const updateGrid = () => {
      grid = {};
      particles.forEach(p => {
        const cellX = Math.floor(p.position.x / cellSize);
        const cellY = Math.floor(p.position.y / cellSize);
        const key = `${cellX},${cellY}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(p);
      });
    };

    // After each render: apply mouse forces and draw connections
    Events.on(render, 'afterRender', () => {
      if (!mouseRef.current) return;

      // Update attractor position
      Body.setPosition(attractor, { x: mouse.position.x, y: mouse.position.y });

      // Apply attraction/repulsion forces
      const infRadius = CONFIG.physics.influenceRadius;
      const infRadiusSq = infRadius * infRadius;
      particles.forEach(particle => {
        const px = particle.position.x, py = particle.position.y;
        const dx = mouse.position.x - px;
        const dy = mouse.position.y - py;
        const distSq = dx*dx + dy*dy;
        if (distSq > 0 && distSq < infRadiusSq) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist, ny = dy / dist;
          const strength = mouse.button === 0 
            ? CONFIG.physics.attractionStrength 
            : -CONFIG.physics.repulsionStrength;
          const force = strength * (1 - dist / infRadius);
          Body.applyForce(particle, particle.position, { x: nx * force, y: ny * force });
        }
      });

      // Update spatial grid for connections
      updateGrid();

      // Draw lines between nearby particles
      const ctx = render.context;
      ctx.lineWidth = 1;
      const connectDist = CONFIG.physics.connectionDistance;
      const connectDistSq = connectDist * connectDist;
      particles.forEach(particleA => {
        const ax = particleA.position.x, ay = particleA.position.y;
        const cellX = Math.floor(ax / cellSize);
        const cellY = Math.floor(ay / cellSize);
        // check neighbors in adjacent cells
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const key = `${cellX+dx},${cellY+dy}`;
            const cellParticles = grid[key];
            if (!cellParticles) continue;
            cellParticles.forEach(particleB => {
              if (particleA.id >= particleB.id) return; // avoid duplicate pairs
              const bx = particleB.position.x, by = particleB.position.y;
              const dx2 = ax - bx, dy2 = ay - by;
              const distSq = dx2*dx2 + dy2*dy2;
              if (distSq < connectDistSq) {
                const dist = Math.sqrt(distSq);
                const opacity = (1 - dist / connectDist) * CONFIG.physics.connectionOpacity;
                ctx.strokeStyle = imageState === 0
                  ? `rgba(99,133,79,${opacity})`
                  : `rgba(135,46,27,${opacity})`;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.stroke();
              }
            });
          }
        }
      });
    });

    // Start engine
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Periodic random impulse for variation
    const randomImpulse = setInterval(() => {
      particles.forEach(p => {
        if (Math.random() < 0.1) {
          Body.applyForce(p, p.position, { 
            x: (Math.random() - 0.5) * 0.0005, 
            y: (Math.random() - 0.5) * 0.0005 
          });
        }
      });
    }, 3000);

    // Cleanup on unmount or resize
    return () => {
      clearInterval(randomImpulse);
      Events.off(render);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      World.clear(engine.world, false);
      if (sceneRef.current && sceneRef.current.firstChild) {
        sceneRef.current.removeChild(sceneRef.current.firstChild);
      }
    };
  }, [bounds, imageState]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <div ref={sceneRef} style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'auto'
      }} />
    </div>
  );
};

export default ParticleBackground;
