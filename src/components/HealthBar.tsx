export function HealthBar({
  x,
  y,
  hp,
  maxHp,
  alive,
  color,
}: {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  color: string;
}) {
  if (!alive) return null;

  return (
    <div
      className="health-number"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        textShadow: '0 0 4px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.5)',
        fontFamily: 'monospace',
      }}
    >
      {Math.ceil(hp)}
    </div>
  );
}
