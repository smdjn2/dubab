'use client';

export default function Toggle({ on, onToggle, label, status }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span>{label}</span>
        <span className="text-xs text-gray-400">{status}</span>
      </div>
      <div className={`toggle-switch ${on ? 'on' : ''}`} onClick={onToggle}>
        <div className="toggle-knob" />
      </div>
    </div>
  );
}