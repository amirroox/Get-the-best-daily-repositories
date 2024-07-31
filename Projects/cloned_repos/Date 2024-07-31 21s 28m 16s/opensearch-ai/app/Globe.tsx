'use client'

import createGlobe from 'cobe';

import React, { useEffect, useRef } from 'react';

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef?.current) return;
    const globe = createGlobe(canvasRef?.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // longitude latitude
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      scale: 0.5,
      opacity: 0.5,
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="App">
      <canvas
        ref={canvasRef}
        style={{ width: 600, height: 600, maxWidth: '100%', aspectRatio: 1 }}
      />
    </div>
  );
}

export default Globe;
