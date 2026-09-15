import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface BlobDef {
  color: string;
  size: number;
  baseX: number;
  baseY: number;
  parallaxStrength: number;
  duration: number;
  delay: number;
}

const BLOBS: BlobDef[] = [
  {
    color: 'radial-gradient(circle at 50% 50%, rgba(134,179,240,0.18) 0%, rgba(184,150,223,0.06) 50%, transparent 78%)',
    size: 900,
    baseX: 0.05, baseY: -0.08,
    parallaxStrength: 60,
    duration: 22,
    delay: 0,
  },
  {
    color: 'radial-gradient(circle at 50% 50%, rgba(250,125,168,0.15) 0%, rgba(184,150,223,0.05) 52%, transparent 78%)',
    size: 720,
    baseX: 0.78, baseY: 0.12,
    parallaxStrength: -45,
    duration: 18,
    delay: 4,
  },
  {
    color: 'radial-gradient(circle at 50% 50%, rgba(184,150,223,0.16) 0%, rgba(134,179,240,0.05) 55%, transparent 80%)',
    size: 820,
    baseX: 0.38, baseY: 0.72,
    parallaxStrength: 50,
    duration: 26,
    delay: 8,
  },
  {
    color: 'radial-gradient(circle at 50% 50%, rgba(225,230,242,0.30) 0%, rgba(200,210,228,0.10) 55%, transparent 80%)',
    size: 560,
    baseX: 0.82, baseY: 0.70,
    parallaxStrength: -35,
    duration: 21,
    delay: 2,
  },
];

export default function MeshBackground() {
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  const mouseX = useSpring(rawX, { stiffness: 16, damping: 50, mass: 2.5 });
  const mouseY = useSpring(rawY, { stiffness: 16, damping: 50, mass: 2.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX / window.innerWidth);
      rawY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawX, rawY]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #F9F9FB 0%, #F3F3F7 100%)',
        pointerEvents: 'none',
      }}
    >
      {BLOBS.map((blob, i) => (
        <Blob key={i} blob={blob} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  );
}

function Blob({
  blob,
  mouseX,
  mouseY,
}: {
  blob: BlobDef;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
}) {
  // Parallax offset: (mouse - 0.5) * strength
  const px = useTransform(mouseX, [0, 1], [-blob.parallaxStrength / 2, blob.parallaxStrength / 2]);
  const py = useTransform(mouseY, [0, 1], [-blob.parallaxStrength / 2, blob.parallaxStrength / 2]);

  const half = blob.size / 2;

  return (
    <motion.div
      animate={{
        x: [0, 30, -18, 14, 0],
        y: [0, -24, 20, -12, 0],
        scale: [1, 1.07, 0.94, 1.04, 1],
      }}
      transition={{
        duration: blob.duration,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: blob.delay,
      }}
      style={{
        position: 'absolute',
        width: blob.size,
        height: blob.size,
        borderRadius: '50%',
        background: blob.color,
        filter: 'blur(70px)',
        left: `calc(${blob.baseX * 100}vw - ${half}px)`,
        top: `calc(${blob.baseY * 100}vh - ${half}px)`,
        x: px,
        y: py,
      }}
    />
  );
}
