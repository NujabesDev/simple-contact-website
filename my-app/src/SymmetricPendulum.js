import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import useMeasure from 'react-use-measure';

const SymmetricPendulum = () => {
  const [containerRef, bounds] = useMeasure();
  const sceneRef = useRef();
  const engine = useRef(Matter.Engine.create());
  
  // Configuration
  const CONFIG = {
    colors: {
      primary: '#872e1b',    // Maroon from your theme
      secondary: '#63854f',  // Green from your theme
      accent: '#a8b4bc'      // Gray from your theme
    },
    sizes: {
      rodWidth: 4,
      bobRadius: 12,
      segmentLength: 80
    },
    physics: {
      stiffness: 0.9,
      damping: 0.01,
      gravity: 0.5
    }
  };

  useEffect(() => {
    if (!bounds.width || !bounds.height) return;

    const { Engine, Render, Runner, Bodies, Composite, Constraint, Mouse, MouseConstraint } = Matter;
    const canvas = document.createElement('canvas');
    sceneRef.current.appendChild(canvas);

    // Setup engine
    const engine = Engine.create();
    engine.world.gravity.y = CONFIG.physics.gravity;

    // Setup renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      canvas: canvas,
      options: {
        width: bounds.width,
        height: bounds.height,
        wireframes: false,
        background: 'transparent'
      }
    });

    // Create symmetrical pendulum system
    const createSymmetricalPendulum = (x, y) => {
      // Common materials
      const rodMaterial = { 
        render: { lineWidth: CONFIG.sizes.rodWidth, strokeStyle: CONFIG.colors.accent }
      };
      
      const bobMaterial = (color) => ({
        render: { fillStyle: color, strokeStyle: CONFIG.colors.primary, lineWidth: 2 }
      });

      // Central anchor point
      const anchor = Bodies.circle(x, y, 5, { 
        isStatic: true,
        render: { fillStyle: CONFIG.colors.primary }
      });

      // Create three symmetrical arms
      const arms = [];
      for (let i = 0; i < 3; i++) {
        const angle = (i * 120 * Math.PI) / 180;
        const armGroup = [];

        // First segment
        const bob1 = Bodies.circle(
          x + Math.cos(angle) * CONFIG.sizes.segmentLength,
          y + Math.sin(angle) * CONFIG.sizes.segmentLength,
          CONFIG.sizes.bobRadius,
          { render: bobMaterial(CONFIG.colors.secondary) }
        );

        const constraint1 = Constraint.create({
          pointA: { x, y },
          bodyB: bob1,
          length: CONFIG.sizes.segmentLength,
          stiffness: CONFIG.physics.stiffness,
          render: rodMaterial
        });

        // Second segment
        const bob2 = Bodies.circle(
          bob1.position.x + Math.cos(angle) * CONFIG.sizes.segmentLength,
          bob1.position.y + Math.sin(angle) * CONFIG.sizes.segmentLength,
          CONFIG.sizes.bobRadius * 0.8,
          { render: bobMaterial(CONFIG.colors.primary) }
        );

        const constraint2 = Constraint.create({
          bodyA: bob1,
          bodyB: bob2,
          length: CONFIG.sizes.segmentLength,
          stiffness: CONFIG.physics.stiffness,
          render: rodMaterial
        });

        // Third segment
        const bob3 = Bodies.circle(
          bob2.position.x + Math.cos(angle) * CONFIG.sizes.segmentLength,
          bob2.position.y + Math.sin(angle) * CONFIG.sizes.segmentLength,
          CONFIG.sizes.bobRadius * 0.6,
          { render: bobMaterial(CONFIG.colors.accent) }
        );

        const constraint3 = Constraint.create({
          bodyA: bob2,
          bodyB: bob3,
          length: CONFIG.sizes.segmentLength,
          stiffness: CONFIG.physics.stiffness,
          render: rodMaterial
        });

        armGroup.push(anchor, bob1, bob2, bob3, constraint1, constraint2, constraint3);
        arms.push(...armGroup);
      }

      return arms;
    };

    // Add pendulum system to world
    const system = createSymmetricalPendulum(bounds.width/2, bounds.height/4);
    Composite.add(engine.world, system);

    // Add mouse interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.1, render: { visible: false } }
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Add damping for fluid motion
    Matter.Events.on(engine, 'beforeUpdate', () => {
      engine.world.bodies.forEach(body => {
        if (body.velocity) {
          body.velocity.x *= 1 - CONFIG.physics.damping;
          body.velocity.y *= 1 - CONFIG.physics.damping;
        }
      });
    });

    // Start the engine
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Cleanup
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      sceneRef.current.removeChild(render.canvas);
    };
  }, [bounds]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '60vh' }}>
      <div ref={sceneRef} style={{ 
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default SymmetricPendulum;