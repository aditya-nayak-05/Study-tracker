import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function StylishAnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = ((hours + minutes / 60) / 12) * 360;

  const formattedDigital = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="dash-card p-6 flex flex-col items-center justify-between text-center h-full">
      <div className="notebook-header-line w-full text-center">
        <h3 className="text-sm font-bold text-main flex items-center justify-center gap-2 text-center uppercase tracking-wider">
          <Clock className="w-4 h-4 text-accent-primary shrink-0" /> Analog Clock
        </h3>
      </div>

      <div className="flex flex-col items-center justify-center py-3 relative my-auto w-full">
        {/* Analog Clock Dial (Increased Size: 224px / w-56 h-56) */}
        <div
          className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
          style={{
            background: 'var(--neu-card-bg)',
            border: '4px solid var(--neu-border)',
            boxShadow: 'var(--neu-shadow-raised), inset 0 0 20px rgba(0,0,0,0.35)',
          }}
        >
          {/* Hour Tick Marks & Numbers (12 Ticks) */}
          {[...Array(12)].map((_, i) => {
            const hourNum = i === 0 ? 12 : i;
            return (
              <div
                key={i}
                className="absolute w-full h-full flex flex-col items-center pt-2"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <div
                  className={i % 3 === 0 ? "w-1.5 h-3.5 rounded-full" : "w-1 h-2 rounded-full"}
                  style={{
                    background: i % 3 === 0 ? 'var(--accent-orange)' : 'var(--neu-text-muted)',
                    opacity: i % 3 === 0 ? 1 : 0.45,
                  }}
                />
                {i % 3 === 0 && (
                  <span
                    className="text-[10px] font-black text-main opacity-80 mt-1 select-none"
                    style={{ transform: `rotate(-${i * 30}deg)` }}
                  >
                    {hourNum}
                  </span>
                )}
              </div>
            );
          })}

          {/* Hour Hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom rounded-full transition-transform duration-300"
            style={{
              width: '5px',
              height: '54px',
              marginTop: '-54px',
              marginLeft: '-2.5px',
              background: 'var(--neu-text-main)',
              transform: `rotate(${hourDeg}deg)`,
              boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
            }}
          />

          {/* Minute Hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom rounded-full transition-transform duration-300"
            style={{
              width: '3.5px',
              height: '76px',
              marginTop: '-76px',
              marginLeft: '-1.75px',
              background: 'var(--accent-orange)',
              transform: `rotate(${minuteDeg}deg)`,
              boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
            }}
          />

          {/* Second Hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom rounded-full transition-transform duration-100"
            style={{
              width: '2px',
              height: '86px',
              marginTop: '-86px',
              marginLeft: '-1px',
              background: '#e53e3e',
              transform: `rotate(${secondDeg}deg)`,
            }}
          />

          {/* Center Pivot Cap */}
          <div
            className="w-5 h-5 rounded-full z-20 shadow-lg flex items-center justify-center border-2 border-white/50"
            style={{ background: 'var(--accent-orange)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Digital Time Readout */}
        <div className="mt-4 text-center">
          <span className="text-xs font-black tracking-widest text-main uppercase px-4 py-1.5 rounded-full inset-field inline-block">
            {formattedDigital}
          </span>
        </div>
      </div>
    </div>
  );
}
