import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import useMeasure from 'react-use-measure';

const BouncingShapes = ({ imageState }) => {
  const [containerRef, bounds] = useMeasure();
  const sceneRef = useRef();
  const engineRef = useRef(null);
  const specialShapeRef = useRef(null);
  const shapesRef = useRef([]);
  
  // Configuration
  const CONFIG = {
    colors: {
      primary: '#872e1b',    // Maroon/Red from your theme
      secondary: '#63854f',  // Green from your theme
    },
    count: {
      circles: 10,
      squares: 8,
      triangles: 6
    },
    sizes: {
      minSize: 150,
      maxSize: 200
    },
    physics: {
      restitution: .9,  // Bounciness
      friction: 0.00,
      frictionAir: 0.00,
      velocityMultiplier: 2, // Higher value = faster movement
      clickForce: 3    // Force multiplier when clicking the special shape
    }
  };

  useEffect(() => {
    if (!bounds.width || !bounds.height) return;

    // Create Matter.js instances
    const { Engine, Render, Runner, Bodies, Composite, Body, World, Mouse, Query } = Matter;
    
    // Create engine with zero gravity
    const engine = Engine.create({
      gravity: { x: 0, y: 0 } // Ensure zero gravity
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
        background: 'transparent'
      }
    });

    // Create walls to contain the shapes
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

    // Function to create a random size within range
    const randomSize = () => CONFIG.sizes.minSize + Math.random() * (CONFIG.sizes.maxSize - CONFIG.sizes.minSize);
    
    // Function to create a random position
    const randomPosition = (size) => {
      return {
        x: size + Math.random() * (bounds.width - size * 2),
        y: size + Math.random() * (bounds.height - size * 2),
      };
    };
    
    // Function to generate random velocity
    const randomVelocity = () => {
      const mult = CONFIG.physics.velocityMultiplier;
      return {
        x: (Math.random() - 0.5) * mult,
        y: (Math.random() - 0.5) * mult
      };
    };
    
    // Create all shapes
    const allShapes = [];
    
    // Create circles
    for (let i = 0; i < CONFIG.count.circles; i++) {
      const radius = randomSize()/1.5;
      const pos = randomPosition(radius);
      
      const circle = Bodies.circle(pos.x, pos.y, radius, {
        restitution: CONFIG.physics.restitution,
        friction: CONFIG.physics.friction,
        frictionAir: CONFIG.physics.frictionAir,
        render: {    
          fillStyle: '#333',
          strokeStyle: '#000',
          lineWidth: 1
        },
        isSpecial: false,
        shapeType: 'circle',
        circleRadius: radius  // Store radius for hit detection
      });
      
      // Apply initial velocity
      Body.setVelocity(circle, randomVelocity());
      allShapes.push(circle);
    }
    
    // Create squares
    for (let i = 0; i < CONFIG.count.squares; i++) {
      const size = randomSize();
      const pos = randomPosition(size);
      
      const square = Bodies.rectangle(pos.x, pos.y, size, size, {
        restitution: CONFIG.physics.restitution,
        friction: CONFIG.physics.friction,
        frictionAir: CONFIG.physics.frictionAir,
        render: {
          fillStyle: '#333',
          strokeStyle: '#000',
          lineWidth: 1
        },
        isSpecial: false,
        shapeType: 'square'
      });
      
      // Apply initial velocity
      Body.setVelocity(square, randomVelocity());
      allShapes.push(square);
    }
    
    // Create triangles
    for (let i = 0; i < CONFIG.count.triangles; i++) {
      const size = randomSize()/1.3;
      const pos = randomPosition(size);
      
      const triangle = Bodies.polygon(pos.x, pos.y, 3, size, {
        restitution: CONFIG.physics.restitution,
        friction: CONFIG.physics.friction,
        frictionAir: CONFIG.physics.frictionAir,
        render: {
          fillStyle: '#333',
          strokeStyle: '#000',
          lineWidth: 1
        },
        isSpecial: false,
        shapeType: 'triangle'
      });
      
      // Apply initial velocity
      Body.setVelocity(triangle, randomVelocity());
      allShapes.push(triangle);
    }
    
    // Choose a random shape to be special
    const chooseRandomSpecialShape = () => {
      if (allShapes.length === 0) return null;
      
      // Remove special status from previous special shape
      if (specialShapeRef.current) {
        specialShapeRef.current.isSpecial = false;
        specialShapeRef.current.render.fillStyle = '#333';
        specialShapeRef.current.render.strokeStyle = '#000';
        specialShapeRef.current.render.lineWidth = 1;
      }
      
      // Choose a new special shape randomly
      const randomIndex = Math.floor(Math.random() * allShapes.length);
      const shape = allShapes[randomIndex];
      
      // Make it special
      shape.isSpecial = true;
      
      // Set color based on current image state
      const specialColor = imageState === 0 ? CONFIG.colors.secondary : CONFIG.colors.primary;
      shape.render.fillStyle = specialColor;
      shape.render.strokeStyle = '#000';
      shape.render.lineWidth = 2;
      
      return shape;
    };
    
    // Set up shape references
    shapesRef.current = allShapes;
    specialShapeRef.current = chooseRandomSpecialShape();
    
    // Add all shapes to the world
    World.add(engine.world, allShapes);
    
    // Setup mouse for improved click detection without dragging
    const mouse = Mouse.create(render.canvas);
    
    // Handle direct click events on the canvas with improved detection
    const handleClick = (event) => {
      // Convert screen coordinates to canvas coordinates
      const canvasBounds = render.canvas.getBoundingClientRect();
      const mousePosition = {
        x: (event.clientX - canvasBounds.left) * (render.options.width / canvasBounds.width),
        y: (event.clientY - canvasBounds.top) * (render.options.height / canvasBounds.height)
      };
      
      // Use a slightly larger detection radius for better click experience
      const clickDetectionRadius = 20; // Extra pixels to make clicking easier
      
      // Check each shape manually with expanded hit area
      let clickedSpecial = null;
      
      for (const shape of allShapes) {
        if (shape.isSpecial) {
          // For circles
          if (shape.shapeType === 'circle') {
            const distance = Math.sqrt(
              Math.pow(mousePosition.x - shape.position.x, 2) + 
              Math.pow(mousePosition.y - shape.position.y, 2)
            );
            // Circle radius + extra detection radius
            if (distance <= shape.circleRadius + clickDetectionRadius) {
              clickedSpecial = shape;
              break;
            }
          } 
          // For polygons (squares and triangles)
          else {
            // Check if the point is within the bounds + detection radius
            const bounds = shape.bounds;
            if (
              mousePosition.x >= bounds.min.x - clickDetectionRadius &&
              mousePosition.x <= bounds.max.x + clickDetectionRadius &&
              mousePosition.y >= bounds.min.y - clickDetectionRadius &&
              mousePosition.y <= bounds.max.y + clickDetectionRadius
            ) {
              clickedSpecial = shape;
              break;
            }
          }
        }
      }
      
      if (clickedSpecial) {
        // Apply a strong force in a random direction
        const force = CONFIG.physics.clickForce;
        const angle = Math.random() * Math.PI * 2;
        const forceVector = {
          x: Math.cos(angle) * force,
          y: Math.sin(angle) * force
        };
        
        Body.applyForce(clickedSpecial, clickedSpecial.position, forceVector);
        
        // Add a visual effect - briefly change color
        const originalColor = clickedSpecial.render.fillStyle;
        clickedSpecial.render.fillStyle = '#ffffff';
        
        // Reset color after animation and choose a new special shape
        setTimeout(() => {
          if (clickedSpecial) {
            clickedSpecial.render.fillStyle = originalColor;
            specialShapeRef.current = chooseRandomSpecialShape();
          }
        }, 300);
      }
    };
    
    // Add click event listener to the canvas
    render.canvas.addEventListener('click', handleClick);

    // Update special shape color when imageState changes
    if (specialShapeRef.current) {
      specialShapeRef.current.render.fillStyle = 
        imageState === 0 ? CONFIG.colors.secondary : CONFIG.colors.primary;
    }
    
    // Create and run the runner
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    
    // Optional: Ensure shapes keep moving by adding a small impulse periodically
    const interval = setInterval(() => {
      allShapes.forEach(shape => {
        // If a shape is moving very slowly, give it a small nudge
        const velocity = shape.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        if (speed < 0.5) {
          Body.applyForce(shape, shape.position, {
            x: (Math.random() - 0.5) * 0.001,
            y: (Math.random() - 0.5) * 0.001
          });
        }
      });
    }, 5000);
    
    // Cleanup
    return () => {
      // Remove event listeners
      render.canvas.removeEventListener('click', handleClick);
      
      // Stop the engine and renderer
      clearInterval(interval);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      World.clear(engine.world, false);
      
      // Remove canvas if it exists
      if (sceneRef.current && sceneRef.current.firstChild) {
        sceneRef.current.removeChild(sceneRef.current.firstChild);
      }
    };
  }, [bounds, imageState]);
  
  // Additional effect to update special shape color when imageState changes without redoing the whole canvas
  useEffect(() => {
    if (specialShapeRef.current) {
      const specialColor = imageState === 0 ? CONFIG.colors.secondary : CONFIG.colors.primary;
      specialShapeRef.current.render.fillStyle = specialColor;
    }
  }, [imageState, CONFIG.colors.primary, CONFIG.colors.secondary]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <div ref={sceneRef} style={{ 
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: -1, /* Keep it in background */
        pointerEvents: 'auto' /* Allow clicks on the canvas */
      }} />
    </div>
  );
};

export default BouncingShapes;