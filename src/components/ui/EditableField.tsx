// src/components/ui/EditableField.tsx
import { useState, useEffect, useRef } from 'react';
import { Input } from './input';

interface EditableFieldProps {
  initialValue: number;
  onSave: (newValue: number) => void;
  className?: string;
}

export function EditableField({ initialValue, onSave, className }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    setIsEditing(false);
    const numericValue = parseFloat(value.toString());
    if (!isNaN(numericValue) && numericValue !== initialValue) {
      onSave(numericValue);
    } else {
      // Reset to initial value if input is invalid or unchanged
      setValue(initialValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`h-8 p-1 text-right ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-white/10 rounded p-1 transition-colors duration-200 ${className}`}
    >
      {value.toFixed(2)}
    </span>
  );
}
