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
      primary: '#872e1b',    // Maroon/Red from your theme
      secondary: '#63854f',  // Green from your theme
      neutral: '#333333',    // Dark gray
      neutral2: '#555555',   // Medium gray
      highlight: '#a8b4bc',  // Light blue-gray
    },
    particles: {
      count: 300,             // Number of particles
      minSize: 2,            // Minimum particle size
      maxSize: 10,            // Maximum particle size
      opacity: 0.5,          // Base opacity
    },
    physics: {
      frictionAir: 0.02,     // Air resistance
      restitution: 0.4,      // Bounciness
      influenceRadius: 200,  // Mouse influence radius
      attractionStrength: 0.0001, // Strength of attraction
      repulsionStrength: 0.0003,  // Strength of repulsion
      connectionDistance: 150, // Distance to show connections
      connectionOpacity: 0.15, // Connection line opacity
    }
  };

  useEffect(() => {
    if (!bounds.width || !bounds.height) return;

    // Create Matter.js instances
    const { Engine, Render, Runner, Bodies, Body, World, Mouse, Events, Query } = Matter;
    
    // Create engine
    const engine = Engine.create({
      gravity: { x: 0, y: 0 } // Zero gravity
    });
    engineRef.current = engine;
    
    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: bounds.width,
        height: bounds.height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });

    // Setup mouse tracking
    const mouse = Mouse.create(render.canvas);
    mouseRef.current = mouse;
    
    // Create invisible attractor body that follows the mouse
    const attractor = Bodies.circle(0, 0, 20, {
      isStatic: false,
      render: { visible: false },
    });
    attractorRef.current = attractor;
    World.add(engine.world, attractor);

    // Create walls to contain the particles
    const wallThickness = 50;
    const walls = [
      // Top wall
      Bodies.rectangle(bounds.width / 2, -wallThickness / 2, bounds.width, wallThickness, { 
        isStatic: true,
        render: { visible: false }
      }),
      // Bottom wall
      Bodies.rectangle(bounds.width / 2, bounds.height + wallThickness / 2, bounds.width, wallThickness, { 
        isStatic: true,
        render: { visible: false }
      }),
      // Left wall
      Bodies.rectangle(-wallThickness / 2, bounds.height / 2, wallThickness, bounds.height, { 
        isStatic: true,
        render: { visible: false }
      }),
      // Right wall
      Bodies.rectangle(bounds.width + wallThickness / 2, bounds.height / 2, wallThickness, bounds.height, { 
        isStatic: true,
        render: { visible: false }
      })
    ];
    
    World.add(engine.world, walls);

    // Function for random position
    const randomPosition = () => ({
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height
    });
    
    // Function for random size
    const randomSize = () => CONFIG.particles.minSize + 
      Math.random() * (CONFIG.particles.maxSize - CONFIG.particles.minSize);
    
    // Function for random color
    const getRandomColor = () => {
      const colors = [
        CONFIG.colors.primary,
        CONFIG.colors.secondary,
        CONFIG.colors.neutral,
        CONFIG.colors.neutral2,
        CONFIG.colors.highlight
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    
    // Create particles
    const particles = [];
    
    for (let i = 0; i < CONFIG.particles.count; i++) {
      const pos = randomPosition();
      const size = randomSize();
      
      const particle = Bodies.circle(pos.x, pos.y, size, {
        restitution: CONFIG.physics.restitution,
        frictionAir: CONFIG.physics.frictionAir + (Math.random() * 0.02), // Slight variation in air friction
        render: {
          fillStyle: getRandomColor(),
          opacity: CONFIG.particles.opacity,
        },
        isParticle: true,
      });
      
      // Apply initial velocity
      Body.setVelocity(particle, {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5
      });
      
      particles.push(particle);
    }
    
    World.add(engine.world, particles);
    
    // Update attractor position with mouse
    Events.on(render, 'afterRender', () => {
      if (!mouseRef.current) return;
      
      Body.setPosition(attractor, {
        x: mouse.position.x,
        y: mouse.position.y
      });
      
      // Change attraction behavior based on mouse position
      particles.forEach(particle => {
        const distance = Matter.Vector.magnitude(
          Matter.Vector.sub(particle.position, mouse.position)
        );
        
        if (distance < CONFIG.physics.influenceRadius) {
          // Calculate force direction
          const forceDirection = Matter.Vector.sub(
            mouse.position,
            particle.position
          );
          
          // Normalize direction vector
          const normalizedDirection = Matter.Vector.normalise(forceDirection);
          
          // Determine attraction or repulsion based on mouse
          let forceMagnitude;
          if (mouse.button === 0) { // No button pressed - gentle attraction
            forceMagnitude = CONFIG.physics.attractionStrength;
          } else { // Button pressed - stronger repulsion
            forceMagnitude = -CONFIG.physics.repulsionStrength;
          }
          
          // Scale force with distance (closer = stronger)
          const distanceFactor = 1 - (distance / CONFIG.physics.influenceRadius);
          const scaledForce = Matter.Vector.mult(
            normalizedDirection, 
            forceMagnitude * distanceFactor
          );
          
          // Apply force to particle
          Body.applyForce(particle, particle.position, scaledForce);
        }
      });
      
      // Draw connections between nearby particles
      const ctx = render.context;
      ctx.strokeStyle = imageState === 0 
        ? `rgba(99, 133, 79, ${CONFIG.physics.connectionOpacity})` // Green
        : `rgba(135, 46, 27, ${CONFIG.physics.connectionOpacity})`; // Red
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const particleA = particles[i];
          const particleB = particles[j];
          
          const distance = Matter.Vector.magnitude(
            Matter.Vector.sub(particleA.position, particleB.position)
          );
          
          if (distance < CONFIG.physics.connectionDistance) {
            // Opacity based on distance
            const opacity = (1 - distance / CONFIG.physics.connectionDistance) * 
              CONFIG.physics.connectionOpacity;
            
            ctx.strokeStyle = imageState === 0 
              ? `rgba(99, 133, 79, ${opacity})` // Green
              : `rgba(135, 46, 27, ${opacity})`; // Red
              
            ctx.beginPath();
            ctx.moveTo(particleA.position.x, particleA.position.y);
            ctx.lineTo(particleB.position.x, particleB.position.y);
            ctx.stroke();
          }
        }
      }
    });
    
    // Move attractor to follow mouse
    Events.on(mouse, 'mousemove', () => {
      Body.setPosition(attractor, {
        x: mouse.position.x,
        y: mouse.position.y
      });
    });

    // Start the engine and renderer
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    
    // Add a small random impulse to particles occasionally to keep them moving
    const randomImpulseInterval = setInterval(() => {
      particles.forEach(particle => {
        if (Math.random() < 0.1) { // Only apply to 10% of particles each time
          Body.applyForce(particle, particle.position, {
            x: (Math.random() - 0.5) * 0.0005,
            y: (Math.random() - 0.5) * 0.0005
          });
        }
      });
    }, 3000);
    
    // Cleanup
    return () => {
      clearInterval(randomImpulseInterval);
      Events.off(render);
      Events.off(mouse);
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
    <div ref={containerRef} style={{ 
      width: '100%', 
      height: '100vh', 
      position: 'fixed', 
      top: 0, 
      left: 0,
      overflow: 'hidden' // Prevent overflow
    }}>
      <div ref={sceneRef} style={{ 
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'auto',
        overflow: 'hidden' // Prevent overflow
      }} />
    </div>
  );
};

export default ParticleBackground;