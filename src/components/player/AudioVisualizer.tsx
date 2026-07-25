import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  barColor?: string;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isPlaying,
  barColor = '#fa2d48',
  className = 'h-8 w-24'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bufferLength = analyser ? analyser.frequencyBinCount : 16;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barWidth = (canvas.width / 16) - 2;
      let x = 0;

      for (let i = 0; i < 16; i++) {
        let barHeight = 4; // minimum height when paused

        if (isPlaying) {
          if (analyser) {
            barHeight = Math.max(4, (dataArray[i * 2] / 255) * canvas.height);
          } else {
            // Simulated bounce if web audio node isn't attached
            const time = Date.now() * 0.005;
            barHeight = Math.max(4, Math.sin(time + i * 0.5) * (canvas.height / 2) + (canvas.height / 2));
          }
        }

        ctx.fillStyle = barColor;
        // Rounded bar tops
        const y = canvas.height - barHeight;
        const radius = Math.min(2, barWidth / 2);

        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, canvas.height);
        ctx.closePath();
        ctx.fill();

        x += barWidth + 2;
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [analyser, isPlaying, barColor]);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={32}
      className={`inline-block ${className}`}
      id="audio-visualizer-canvas"
    />
  );
};
