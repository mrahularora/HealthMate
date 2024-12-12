import React from 'react';
import '../../css/font-size-control.css';

function FontSizeControl({ setFontSize }) {
  // Function to increase the font size
  const increaseFontSize = () => {
    setFontSize((prevSize) => prevSize + 2); // Increase by 2px
  };

  // Function to decrease the font size
  const decreaseFontSize = () => {
    setFontSize((prevSize) => Math.max(12, prevSize - 2)); // Decrease but don't go below 12px
  };

  return (
    <div className="font-size-control">
      <button onClick={increaseFontSize}>+</button>
      <button onClick={decreaseFontSize}>-</button>
    </div>
  );
}

export default FontSizeControl;
