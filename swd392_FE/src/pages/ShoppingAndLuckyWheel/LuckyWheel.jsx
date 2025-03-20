import React, { useState } from 'react';
import { Wheel } from 'react-custom-roulette';

const LuckyWheel = () => {
  const segments = [
    { option: 'better luck next time', style: { backgroundColor: '#EE4040', textColor: 'white' } },
    { option: 'won 70', style: { backgroundColor: '#F0CF50', textColor: 'black' } },
    { option: 'won 10', style: { backgroundColor: '#815CD1', textColor: 'white' } },
    { option: 'better luck next time', style: { backgroundColor: '#3DA5E0', textColor: 'white' } },
    { option: 'won 2', style: { backgroundColor: '#34A24F', textColor: 'white' } },
    { option: 'won uber pass', style: { backgroundColor: '#F9AA1F', textColor: 'black' } },
    { option: 'better luck next time', style: { backgroundColor: '#EC3F3F', textColor: 'white' } },
    { option: 'won a voucher', style: { backgroundColor: '#FF9000', textColor: 'white' } }
  ];

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * segments.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1>LuckyWheel</h1>
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={segments}
          onStopSpinning={() => {
            setMustSpin(false);
            console.log(segments[prizeNumber].option);
          }}
          backgroundColors={['#3e3e3e', '#df3428']}
          textColors={['#ffffff']}
        />
        <button onClick={handleSpinClick} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Spin
        </button>
      </div>
    </div>
  );
};

export default LuckyWheel;