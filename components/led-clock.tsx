"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

const patterns: Record<string, number[]> = {
  "0": [0,0,1,1,1,1,1,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,1,1,1,1,1,0,0],
  "1": [0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0],
  "2": [0,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
  "3": [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0,0],
  "4": [0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1],
  "5": [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,0,0,1,1,1,1,1,1,0,0],
  "6": [0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,1,0,0,0,0,1,1,0,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,1,1,1,1,1,0,0],
  "7": [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1],
  "8": [0,0,1,1,1,1,1,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,1,1,1,1,1,0,0],
  "9": [0,0,1,1,1,1,1,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,1,0,0,1,1,0,0,0,1,1,1,1,1,0,0],
};

const vertexShader = "attribute vec4 aVertexPosition; void main() { gl_Position = aVertexPosition; }";

const fragmentShader = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a); float c = cos(a);
  return mat2(c, -s, s, c) * v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv - 0.5;
  p.x *= aspect;
  p *= 2.0;
  float t = uTime * 0.2;

  for(float i=1.0; i<=3.0; i++) {
    float strength = 0.8 / i;
    p.x += strength * snoise(p * 0.5 + t * 0.1 + i * 10.0) * 0.4;
    p.y += strength * snoise(p * 0.5 + t * 0.1 + i * 20.0) * 0.2;
  }

  p = rotate(p, log(length(p) + 0.1) * 0.4);
  vec3 finalColor = vec3(0.0);
  float totalWeight = 0.0;

  for(int i=0; i<5; i++) {
    float fi = float(i);
    vec2 pos = vec2(sin(t * (fi * 0.75)), cos(t * 1.5));
    pos += vec2(sin(fi * 1.5), cos(fi * 2.1));
    float d = length(p - pos);
    float weight = 1.0 / max(0.001, pow(d, 3.5));
    vec3 col = (mod(fi, 2.0) == 0.0) ? uColor1 : uColor2;
    finalColor += col * weight;
    totalWeight += weight;
  }

  finalColor /= totalWeight;
  finalColor = clamp(finalColor * 1.5, 0.0, 1.0);
  finalColor *= finalColor;
  finalColor += (hash21(p + uTime) - 0.5) * 0.08;
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const themes = [
  { hr: 0, c1: [0.36, 0.41, 0.73], c2: [0.03, 0.01, 0.05] },
  { hr: 6, c1: [0.93, 0.42, 0.35], c2: [0.96, 0.95, 0.73] },
  { hr: 12, c1: [0.61, 0.76, 0.74], c2: [0.36, 0.34, 0.42] },
  { hr: 18, c1: [0.93, 0.42, 0.35], c2: [0.36, 0.34, 0.42] },
  { hr: 24, c1: [0.36, 0.41, 0.73], c2: [0.03, 0.01, 0.05] },
];

function getThemeColors(date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60;
  let start = themes[0];
  let end = themes[1];

  for (let index = 0; index < themes.length - 1; index++) {
    if (hour >= themes[index].hr && hour < themes[index + 1].hr) {
      start = themes[index];
      end = themes[index + 1];
      break;
    }
  }

  const mix = (hour - start.hr) / (end.hr - start.hr);

  return {
    c1: start.c1.map((value, index) => value + (end.c1[index] - value) * mix),
    c2: start.c2.map((value, index) => value + (end.c2[index] - value) * mix),
  };
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  return shader;
}

function Digit({ value, offset }: { value: string; offset: number }) {
  const shimmerSpeeds = useMemo(
    () => Array.from({ length: 81 }, (_, index) => `${(0.9 + ((index + offset) % 13) * 0.12).toFixed(2)}s`),
    [offset],
  );

  return (
    <div className="led-digit" aria-label={value}>
      {(patterns[value] ?? Array(81).fill(0)).map((active, index) => (
        <span
          key={index}
          className={`led-dot${active ? " active" : ""}`}
          style={{ "--shimmer-speed": shimmerSpeeds[index] } as CSSProperties}
        />
      ))}
    </div>
  );
}

function Separator() {
  return (
    <div className="led-separator" aria-hidden="true">
      <span className="led-dot active" />
      <span className="led-dot active" />
    </div>
  );
}

export function LedClock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const colorsRef = useRef(getThemeColors());
  const [time, setTime] = useState("0000");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      colorsRef.current = getThemeColors(now);
      setTime(`${hours}${minutes}`);
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) {
      return;
    }

    const gl = canvas.getContext("webgl");

    if (!gl) {
      return;
    }

    const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    const program = gl.createProgram();

    if (!vertex || !fragment || !program) {
      return;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), gl.STATIC_DRAW);

    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const colorOneLocation = gl.getUniformLocation(program, "uColor1");
    const colorTwoLocation = gl.getUniformLocation(program, "uColor2");
    const positionLocation = gl.getAttribLocation(program, "aVertexPosition");

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;

      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = (timestamp: number) => {
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, timestamp * 0.001);
      gl.uniform3fv(colorOneLocation, colorsRef.current.c1);
      gl.uniform3fv(colorTwoLocation, colorsRef.current.c2);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className="led-clock">
      <canvas ref={canvasRef} className="led-bg-canvas" aria-hidden="true" />
      <div className="led-clock-container" aria-label={`Current time ${time.slice(0, 2)}:${time.slice(2)}`}>
        <div className="led-digit-group">
          <Digit value={time[0]} offset={0} />
          <Digit value={time[1]} offset={9} />
        </div>
        <Separator />
        <div className="led-digit-group">
          <Digit value={time[2]} offset={18} />
          <Digit value={time[3]} offset={27} />
        </div>
      </div>
    </div>
  );
}
