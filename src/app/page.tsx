'use client';

import { useEffect, useRef } from "react";
import REGL from 'regl';

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      const regl = REGL();
      const drawTriangle = regl({
        vert: `
          precision highp float;

          attribute vec2 xy;
          attribute vec3 color;
          varying vec3 vColor;

          void main () {
            // Interpolate the color and send it to all rasterized fragments (pixels)
            vColor = color;

            // This is the main output of the vertex shader: where are the vertices?
            gl_Position = vec4(xy, 0, 1);
          }`,
        frag: `
          precision lowp float;

          varying vec3 vColor;

          void main () {
            gl_FragColor = vec4(
              // We can return values in the range [0, 1], it's good to get used to the
              // fact that we generally do math on colors in a *linear* color space but
              // then need (approximate) gamma correction to output colors in the *sRGB*
              // color space.
              pow(vColor, vec3(1.0 / 2.2)),
              1
            );
          }`,
        attributes: {
          // These are the 2D coordinates of our triangle. The x- and y-coordinates of the
          // canvas live in the range [-1, 1] x [-1, 1].
          xy: [
            [-0.5, -0.5],
            [0.5, -0.5],
            [0, 0.5]
          ],
          // Similarly, we pass a color for each vertex.
          color: [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
          ]
        },
        primitive: "triangles",
        count: 3,

        // We're drawing in 2D so we won't use depth testing.
        depth: { enable: false }
      })

      var tick = regl.frame(function (context) {
        regl.clear({ color: [0, 0, 0, 0] });
        drawTriangle();
      })

      return () => tick.cancel()
    }

  }, [canvasRef]);

  return <canvas ref={canvasRef}></canvas>;
}
