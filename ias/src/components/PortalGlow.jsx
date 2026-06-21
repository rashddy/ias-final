import { useRef, useEffect, useState } from 'react'
import { Renderer, Program, Triangle, Mesh } from 'ogl'
import './PortalGlow.css'

const PORTAL_FRAG = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform float raysSpeed;
uniform float noiseAmount;
uniform float distortion;
uniform float pulsating;
uniform vec2  mousePos;
uniform float mouseInfluence;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

float portalRays(vec2 uv, float time) {
  float x = max(uv.x, 0.001);
  float angle = atan((uv.y - 0.5) * 1.6, x);
  float dist = x;
  float t = time * raysSpeed;

  float rays = 0.0;
  rays += pow(max(cos(angle * 6.0 + t * 0.55 + distortion * sin(t * 0.45) * 0.4), 0.0), 2.2) * exp(-dist * 2.0);
  rays += pow(max(cos(angle * 9.0 - t * 0.38 + 1.2), 0.0), 2.8) * exp(-dist * 2.6) * 0.65;
  rays += pow(max(cos(angle * 4.0 + t * 0.28), 0.0), 2.0) * exp(-dist * 1.6) * 0.45;

  float sweep = sin(angle * 2.0 + t * 0.22) * 0.5 + 0.5;
  sweep = smoothstep(0.0, 1.0, sweep);
  rays *= 0.82 + 0.18 * sweep;

  return rays;
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float x = uv.x;
  float y = uv.y;
  float time = iTime;

  float beamY = 0.5;
  if (mouseInfluence > 0.0) {
    beamY = mix(0.5, mousePos.y, mouseInfluence);
  }

  // Trapezoidal portal — narrow slit left, fans out right
  float slitHalf = mix(0.07, 0.40, smoothstep(0.0, 0.72, x));
  float yDist = abs(y - beamY);
  float trapMask = 1.0 - smoothstep(slitHalf * 0.65, slitHalf, yDist);
  trapMask *= 1.0 - smoothstep(0.58, 0.92, x);

  // Soft edge feather on trapezoid sides
  float edgeFeather = smoothstep(slitHalf, slitHalf * 0.55, yDist);
  trapMask = mix(trapMask, trapMask * (1.0 - edgeFeather * 0.4), 0.6);

  // Bright white vertical slit at source
  float slitCore = exp(-x * 40.0) * (1.0 - smoothstep(0.0, 0.05, yDist));
  float slitLine = exp(-x * 80.0) * exp(-yDist * yDist * 800.0);

  // Color: white → orange → red-orange → fade
  vec3 whiteHot = vec3(1.0, 1.0, 1.0);
  vec3 warmWhite = vec3(1.0, 0.95, 0.85);
  vec3 orange = vec3(1.0, 0.42, 0.04);
  vec3 redOrange = vec3(0.95, 0.22, 0.02);
  vec3 deepRed = vec3(0.55, 0.10, 0.01);

  vec3 baseColor;
  if (x < 0.02) {
    baseColor = whiteHot;
  } else if (x < 0.10) {
    baseColor = mix(warmWhite, orange, smoothstep(0.02, 0.10, x));
  } else if (x < 0.30) {
    baseColor = mix(orange, redOrange, smoothstep(0.10, 0.30, x));
  } else if (x < 0.55) {
    baseColor = mix(redOrange, deepRed, smoothstep(0.30, 0.55, x));
  } else {
    baseColor = mix(deepRed, vec3(0.0), smoothstep(0.55, 0.88, x));
  }

  float pulse = pulsating > 0.5 ? (0.94 + 0.06 * sin(time * 1.1)) : 1.0;

  // Animated light-pillar ray streaks
  float rays = portalRays(uv, time);

  // Volumetric dust / atmosphere
  float dust = fbm(vec2(x * 3.0 + time * 0.018, y * 2.5 - time * 0.012)) * 0.18;
  float dust2 = fbm(vec2(x * 6.0 - time * 0.025, y * 4.0 + time * 0.016)) * 0.1;

  // Film grain
  float grain = noise(gl_FragCoord.xy * 0.8 + time * 0.3);
  float grainMod = 1.0 - noiseAmount * 0.5 + noiseAmount * grain;

  // Gentle wave distortion along beam
  float wave = distortion * sin(y * 8.0 + x * 4.0 - time * 0.7) * 0.022;
  float distortedMask = trapMask * (1.0 + wave);

  float intensity = (distortedMask * 0.9 + rays * 0.55 + dust + dust2) * pulse;
  intensity += slitCore * 1.5 + slitLine * 2.0;
  intensity *= grainMod;
  intensity = clamp(intensity, 0.0, 1.8);

  vec3 finalColor = baseColor * intensity;
  finalColor += whiteHot * (slitCore * 0.9 + slitLine * 1.2) * pulse;
  finalColor = clamp(finalColor, 0.0, 1.0);

  float alpha = clamp(intensity * 0.85, 0.0, 1.0);
  gl_FragColor = vec4(finalColor, alpha);
}`

const PORTAL_VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`

export default function PortalGlow({
  raysSpeed = 0.85,
  noiseAmount = 0.12,
  distortion = 0.45,
  pulsating = true,
  followMouse = true,
  mouseInfluence = 0.08,
  className = '',
}) {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const uniformsRef = useRef(null)
  const meshRef = useRef(null)
  const animationIdRef = useRef(null)
  const cleanupRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new IntersectionObserver(
      ([e]) => setIsVisible(e.isIntersecting),
      { threshold: 0.05 },
    )
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !containerRef.current) return

    cleanupRef.current?.()
    cleanupRef.current = null

    const init = async () => {
      await new Promise((r) => setTimeout(r, 10))
      if (!containerRef.current) return

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true,
      })
      rendererRef.current = renderer

      const { gl } = renderer
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
      containerRef.current.appendChild(gl.canvas)

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        raysSpeed: { value: raysSpeed },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
        pulsating: { value: pulsating ? 1.0 : 0.0 },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence },
      }
      uniformsRef.current = uniforms

      const program = new Program(gl, {
        vertex: PORTAL_VERT,
        fragment: PORTAL_FRAG,
        uniforms,
        transparent: true,
      })
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
      meshRef.current = mesh

      const resize = () => {
        if (!containerRef.current || !renderer) return
        renderer.dpr = Math.min(window.devicePixelRatio, 2)
        const { clientWidth: w, clientHeight: h } = containerRef.current
        renderer.setSize(w, h)
        uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr]
      }

      let startTime = null

      const loop = (t) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return

        if (startTime === null) startTime = t
        uniforms.iTime.value = (t - startTime) * 0.001

        if (followMouse && mouseInfluence > 0) {
          const s = 0.97
          smoothMouseRef.current.x = smoothMouseRef.current.x * s + mouseRef.current.x * (1 - s)
          smoothMouseRef.current.y = smoothMouseRef.current.y * s + mouseRef.current.y * (1 - s)
          uniforms.mousePos.value = [smoothMouseRef.current.x, smoothMouseRef.current.y]
        }

        renderer.render({ scene: mesh })
        animationIdRef.current = requestAnimationFrame(loop)
      }

      window.addEventListener('resize', resize)
      resize()
      animationIdRef.current = requestAnimationFrame(loop)

      cleanupRef.current = () => {
        cancelAnimationFrame(animationIdRef.current)
        window.removeEventListener('resize', resize)
        try {
          const ext = gl.getExtension('WEBGL_lose_context')
          ext?.loseContext()
          gl.canvas?.parentNode?.removeChild(gl.canvas)
        } catch { /* ignore */ }
        rendererRef.current = null
        uniformsRef.current = null
        meshRef.current = null
      }
    }

    init()
    return () => cleanupRef.current?.()
  }, [isVisible, raysSpeed, noiseAmount, distortion, pulsating, followMouse, mouseInfluence])

  useEffect(() => {
    if (!uniformsRef.current) return
    const u = uniformsRef.current
    u.raysSpeed.value = raysSpeed
    u.noiseAmount.value = noiseAmount
    u.distortion.value = distortion
    u.pulsating.value = pulsating ? 1.0 : 0.0
    u.mouseInfluence.value = mouseInfluence
  }, [raysSpeed, noiseAmount, distortion, pulsating, mouseInfluence])

  useEffect(() => {
    if (!followMouse) return
    const onMove = (e) => {
      if (!containerRef.current) return
      const r = containerRef.current.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - r.left) / r.width,
        y: 1.0 - (e.clientY - r.top) / r.height,
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [followMouse])

  return <div ref={containerRef} className={`portal-glow-canvas ${className}`.trim()} />
}
