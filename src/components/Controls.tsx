import React from 'react';

interface ControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onReset,
  speed,
  onSpeedChange,
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
      <div className="flex gap-2">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className={`px-4 py-2 rounded ${
            isPlaying
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={onStop}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Stop
        </button>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Reset
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Speed:</label>
        <select
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
        </select>
      </div>

      <div className="text-sm text-gray-600">
        Status: {isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Stopped'}
      </div>
    </div>
  );
};