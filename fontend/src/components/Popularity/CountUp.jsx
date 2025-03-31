import React, { useState, useEffect } from 'react';

const CountUp = ({ start = 0, end, duration = 2000 }) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime = null;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(progress * (end - start) + start);
      setCount(currentCount);
      
      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };

    window.requestAnimationFrame(animate);
  }, [start, end, duration]);

  return <div>{count}</div>;
};

export default CountUp;
