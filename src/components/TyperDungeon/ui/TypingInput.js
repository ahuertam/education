import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

const shake = keyframes`
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-6px); }
  40%     { transform: translateX(6px); }
  60%     { transform: translateX(-4px); }
  80%     { transform: translateX(4px); }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  font-family: 'Courier New', monospace;
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 3px;
  text-align: center;
  background: #1a1208;
  color: #f0d080;
  border: 2px solid ${props => props.$error ? '#c03020' : '#5a4020'};
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;
  caret-color: #f0d080;
  transition: border-color 0.2s;
  ${props => props.$shaking && css`animation: ${shake} 0.35s ease-in-out;`}

  &::placeholder { color: #5a4020; letter-spacing: 1px; }
  &:focus { border-color: ${props => props.$error ? '#c03020' : '#a08040'}; }
`;

export default function TypingInput({ targetWord, onCorrect, onError, onTypedChange, active = true }) {
  const [typed, setTyped] = useState('');
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const shakeTimerRef = useRef(null);

  // The word pool is stored NFC, but macOS with "use Option as Meta" emits NFD,
  // so "dragón" typed as "dragon" + combining acute would never match.
  const target = targetWord.normalize('NFC').toLowerCase();

  // Reset when target word changes
  useEffect(() => {
    setTyped('');
    setError(false);
  }, [targetWord]);

  // Keep focus during battle, including after the window is re-focused
  // (alt-tab mid-fight otherwise leaves the input blurred and the game looks frozen).
  useEffect(() => {
    if (!active) return undefined;
    const refocus = () => inputRef.current?.focus();
    refocus();
    window.addEventListener('focus', refocus);
    return () => window.removeEventListener('focus', refocus);
  }, [active, targetWord]);

  useEffect(() => () => clearTimeout(shakeTimerRef.current), []);

  const handleChange = (e) => {
    if (!active) return;
    // Ignore the intermediate values an IME/accent sequence produces mid-composition.
    if (e.nativeEvent?.isComposing) return;
    const value = e.target.value.normalize('NFC').toLowerCase();

    // Longer than the target can only come from a paste — onPaste blocks that,
    // but bail out rather than reporting a bogus error if one slips through.
    if (value.length > target.length) {
      triggerError();
      return;
    }

    // Validate character by character against target
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== target[i]) {
        triggerError();
        return;
      }
    }

    setTyped(value);
    setError(false);
    if (onTypedChange) onTypedChange(value);

    if (value === target) {
      setTyped('');
      if (onTypedChange) onTypedChange('');
      onCorrect();
    }
  };

  const triggerError = () => {
    setTyped('');
    if (onTypedChange) onTypedChange('');
    setError(true);
    setShaking(true);
    onError();
    clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => {
      setShaking(false);
      setError(false);
    }, 400);
  };

  const handleKeyDown = (e) => {
    // Prevent cursor movement so it stays in text flow
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Pastes and drops would hand the word over without any typing.
  const blockTransfer = (e) => e.preventDefault();

  return (
    <Input
      ref={inputRef}
      value={typed}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={blockTransfer}
      onDrop={blockTransfer}
      placeholder={active ? 'escribe aquí…' : ''}
      $shaking={shaking}
      $error={error}
      disabled={!active}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      aria-label="Escribe la palabra del monstruo para atacar"
    />
  );
}
