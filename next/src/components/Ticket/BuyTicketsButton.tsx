import { Dictionary } from '@/models/locale';
import { useRef } from 'react';

interface BuyTicketsButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  dictionary: Dictionary;
  isFreeTicket?: boolean;
}

export function BuyTicketsButton({
  onClick,
  disabled = false,
  dictionary,
  isFreeTicket,
  loading = false,
}: BuyTicketsButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Get the canvas element and its 2D rendering context
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    // Array to hold the confetti particle objects
    let confettiParticles: any[] = [];

    // Array of colors for the confetti particles
    const colors = [
      '#ff0a54',
      '#ff477e',
      '#ff85a1',
      '#fbb1bd',
      '#f9bec7',
      '#f4a261',
      '#2a9d8f',
      '#e9c46a',
      '#e76f51',
      '#264653',
    ];

    // Total number of confetti particles to be created
    const confettiCount = 70; // Increased number of particles

    // The position on the canvas where the explosion starts (click position)
    const explosionOrigin = {
      x: event.clientX, // X-coordinate of the click event
      y: event.clientY, // Y-coordinate of the click event
    };

    // Set the canvas size to the window dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create confetti particles with initial properties
    for (let i = 0; i < confettiCount; i++) {
      confettiParticles.push({
        x: explosionOrigin.x, // Starting X position
        y: explosionOrigin.y, // Starting Y position
        r: Math.random() * 10 + 8, // Particle radius (size)
        color: colors[Math.floor(Math.random() * colors.length)], // Random color from the colors array
        angle: Math.random() * 360, // Direction of movement (in degrees)
        speed: Math.random() * 5 + 3, // Movement speed of the particle
        tilt: Math.random() * 15 - 7.5, // Tilt amount of the particle
        tiltAngleIncremental: Math.random() * 0.07 + 0.05, // Rate at which tilt angle changes
        tiltAngle: 0, // Current tilt angle
        alpha: 1, // Opacity of the particle (1 is fully opaque)
      });
    }

    // Convert degrees to radians for trigonometric functions
    const radians = (degrees: number) => (degrees * Math.PI) / 180;

    // Function to draw the confetti particles
    (function draw() {
      // Clear the entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw each particle
      confettiParticles = confettiParticles.filter((particle) => {
        // Update the tilt angle for the particle
        particle.tiltAngle += particle.tiltAngleIncremental;

        // Update the particle's position based on its speed and angle
        particle.x += particle.speed * Math.cos(radians(particle.angle));
        particle.y += particle.speed * Math.sin(radians(particle.angle));

        // Update the particle's tilt based on its tilt angle
        particle.tilt = Math.sin(particle.tiltAngle) * 15;

        // Gradually reduce the particle's opacity to create a fade-out effect
        particle.alpha -= 0.01; // Slower fade-out for larger particles

        // Remove the particle if it has fully faded out
        if (particle.alpha <= 0) {
          return false;
        }

        // Draw the particle
        ctx.beginPath();
        ctx.fillStyle = particle.color; // Set the fill color of the particle
        ctx.globalAlpha = particle.alpha; // Apply the particle's opacity
        ctx.moveTo(particle.x + particle.tilt + particle.r / 2, particle.y);
        ctx.lineTo(
          particle.x + particle.tilt,
          particle.y + particle.tilt + particle.r / 2,
        );
        ctx.lineTo(particle.x + particle.tilt, particle.y + particle.r / 2);
        ctx.fill();
        ctx.globalAlpha = 1; // Reset global alpha to default

        // Keep the particle if it is still within the canvas bounds
        return (
          particle.x <= canvas.width &&
          particle.x >= 0 &&
          particle.y <= canvas.height &&
          particle.y >= 0
        );
      });

      // Continue animating as long as there are particles left
      if (confettiParticles.length > 0) {
        requestAnimationFrame(draw);
      }
    })();

    // Wait for our based animation to finish before calling the onClick function
    setTimeout(() => {
      onClick();
    }, 250);
  };

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" />
      <button
        className="btn btn-primary btn-sm whitespace-nowrap max-md:btn-xs"
        disabled={disabled || loading}
        onClick={handleClick}
      >
        {loading ? (
          <div className="min-w-16">
            <span className="loading loading-spinner loading-md" />
          </div>
        ) : (
          dictionary.pages_events[
            isFreeTicket ? 'redeem_tickets' : 'buy_tickets'
          ]
        )}
      </button>
    </div>
  );
}
