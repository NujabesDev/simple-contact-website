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
      count: 300,
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
    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine,
      options: {
        width: bounds.width,
        height: bounds.height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio,
      },
    });

    // Mouse attractor
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

    // ---- ADD NAME ELEMENT AS COLLISION WALL ----
    const nameEl = document.getElementById('myName');
    if (nameEl) {
      const { left, top, width: w, height: h } = nameEl.getBoundingClientRect();
      const x = left + w / 2;
      const y = top + h / 2;
      const nameWall = Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        render: { visible: false },
      });
      World.add(engine.world, nameWall);
    }

    // Dynamic particle count based on area
    const baseCount = CONFIG.particles.count;
    const baseArea = 1920 * 1080;
    let particleCount = Math.round(baseCount * (bounds.width * bounds.height) / baseArea);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) particleCount = Math.round(particleCount * 0.6);
    particleCount = Math.max(particleCount, 50);

    // Helpers
    const randomPosition = () => ({ x: Math.random() * bounds.width, y: Math.random() * bounds.height });
    const randomSize = () => CONFIG.particles.minSize + Math.random() * (CONFIG.particles.maxSize - CONFIG.particles.minSize);
    const colors = [
      CONFIG.colors.primary,
      CONFIG.colors.secondary,
      CONFIG.colors.neutral,
      CONFIG.colors.neutral2,
      CONFIG.colors.highlight,
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
        isParticle: true,
      });
      Body.setVelocity(particle, { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 });
      particles.push(particle);
    }
    World.add(engine.world, particles);

    // Spatial grid
    let grid = {};
    const cellSize = CONFIG.physics.connectionDistance;
    const updateGrid = () => {
      grid = {};
      particles.forEach(p => {
        const cx = Math.floor(p.position.x / cellSize);
        const cy = Math.floor(p.position.y / cellSize);
        const key = `${cx},${cy}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(p);
      });
    };

    // Rendering & physics events
    Events.on(render, 'afterRender', () => {
      // Update attractor position
      Body.setPosition(attractor, { x: mouse.position.x, y: mouse.position.y });

      // Apply forces
      const infR = CONFIG.physics.influenceRadius;
      const infRSq = infR * infR;
      particles.forEach(p => {
        const dx = mouse.position.x - p.position.x;
        const dy = mouse.position.y - p.position.y;
        const dsq = dx*dx + dy*dy;
        if (dsq > 0 && dsq < infRSq) {
          const dist = Math.sqrt(dsq);
          const nx = dx / dist, ny = dy / dist;
          const strength = mouse.button === 0
            ? CONFIG.physics.attractionStrength
            : -CONFIG.physics.repulsionStrength;
          const force = strength * (1 - dist / infR);
          Body.applyForce(p, p.position, { x: nx * force, y: ny * force });
        }
      });

      // Update grid & draw connections
      updateGrid();
      const ctx = render.context;
      ctx.lineWidth = 1;
      const cDist = CONFIG.physics.connectionDistance;
      const cDistSq = cDist * cDist;
      particles.forEach(a => {
        const ax = a.position.x, ay = a.position.y;
        const cellX = Math.floor(ax / cellSize);
        const cellY = Math.floor(ay / cellSize);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const key = `${cellX+dx},${cellY+dy}`;
            const bucket = grid[key];
            if (!bucket) continue;
            bucket.forEach(b => {
              if (a.id >= b.id) return;
              const dx2 = ax - b.position.x;
              const dy2 = ay - b.position.y;
              const dsq2 = dx2*dx2 + dy2*dy2;
              if (dsq2 < cDistSq) {
                const dist = Math.sqrt(dsq2);
                const op = (1 - dist / cDist) * CONFIG.physics.connectionOpacity;
                ctx.strokeStyle = imageState === 0
                  ? `rgba(99,133,79,${op})`
                  : `rgba(135,46,27,${op})`;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(b.position.x, b.position.y);
                ctx.stroke();
              }
            });
          }
        }
      });
    });

    // Run engine & renderer
    const runner = Runner.create(); Runner.run(runner, engine);
    Render.run(render);

    // Random impulses
    const interval = setInterval(() => {
      particles.forEach(p => {
        if (Math.random() < 0.1) {
          Body.applyForce(p, p.position, { x: (Math.random() - 0.5) * 0.0005, y: (Math.random() - 0.5) * 0.0005 });
        }
      });
    }, 3000);

    // Cleanup
    return () => {
      clearInterval(interval);
      Events.off(render);
      Render.stop(render);
      Runner.stop(runner);
      engine.events = {};
      World.clear(engine.world, false);
      Engine.clear(engine);
      if (sceneRef.current.firstChild) sceneRef.current.removeChild(sceneRef.current.firstChild);
    };
  }, [bounds, imageState]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <div ref={sceneRef} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1, pointerEvents: 'auto' }}/>
    </div>
  );
};

export default ParticleBackground;
