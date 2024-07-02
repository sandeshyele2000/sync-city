import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const CircularProgressBar = ({ value, maxValue }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div style={{ width: '100%', maxWidth: '160px',}}>
      <CircularProgressbar
        value={percentage}
        text={`${value}/${maxValue}`}
        styles={buildStyles({
          textColor: '#00D1FF',
          pathColor: '#00D1FF',
          fontFamily: 'Poppins, sans-serif',
          textSize: '1rem',
          trailColor: '#0e575769',
        })}
      />
    </div>
  );
};

export default CircularProgressBar;
