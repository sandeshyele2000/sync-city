import { useState, useEffect } from 'react';

const CursorBall = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updatePosition);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0,256,256,0.5)',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.1s ease-out',
      }}
    />
  );
};

export default CursorBall;