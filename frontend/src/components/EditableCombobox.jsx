import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Sparkles, Search } from 'lucide-react';

function cleanText(str) {
  if (!str || typeof str !== 'string') return str || '';
  let text = str;
  while (text.includes('&amp;')) {
    text = text.replace(/&amp;/g, '&');
  }
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export default function EditableCombobox({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select or type custom...',
  name,
  required = false,
  className = '',
  icon: Icon,
  disabled = false,
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Clean value from any HTML entities
  const displayValue = useMemo(() => cleanText(value), [value]);

  // Normalize options into { value, detail, category }
  const normalizedOptions = useMemo(() => {
    return options
      .map((opt) => {
        if (typeof opt === 'string') {
          const val = cleanText(opt);
          return { value: val, detail: '', category: '' };
        }
        const val = cleanText(opt.value || '');
        return {
          value: val,
          detail: cleanText(opt.detail || ''),
          category: cleanText(opt.category || '')
        };
      })
      .filter((opt) => opt.value.trim() !== '');
  }, [options]);

  // Filter options based on input value
  const filteredOptions = useMemo(() => {
    const search = (displayValue || '').toLowerCase().trim();
    if (!search) return normalizedOptions;
    return normalizedOptions.filter(
      (opt) =>
        opt.value.toLowerCase().includes(search) ||
        opt.detail.toLowerCase().includes(search) ||
        opt.category.toLowerCase().includes(search)
    );
  }, [normalizedOptions, displayValue]);

  // Check if current typed value exactly matches an existing option
  const exactMatchExists = useMemo(() => {
    const trimmed = (displayValue || '').trim().toLowerCase();
    return normalizedOptions.some((opt) => opt.value.toLowerCase() === trimmed);
  }, [normalizedOptions, displayValue]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight index when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  const handleSelectOption = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault();
        handleSelectOption(filteredOptions[highlightedIndex].value);
      } else if (isOpen) {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`.trim()}
      style={style}
    >
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3 z-10 pointer-events-none text-slate-400 dark:text-slate-500 flex items-center justify-center h-full">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          name={name}
          value={displayValue}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            paddingLeft: Icon ? '38px' : '12px',
            paddingRight: '32px',
            height: '38px'
          }}
          className="w-full text-[13px] font-medium leading-normal rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-150"
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 z-10 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-md flex items-center justify-center"
          title="Toggle options"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
            }`}
          />
        </button>
      </div>

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl py-1 text-xs divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in zoom-in-95 duration-100">
          {/* Custom Typed Notice if user typed custom text */}
          {displayValue.trim() !== '' && !exactMatchExists && (
            <div className="px-3 py-2 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5 truncate text-[12px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Custom: <strong className="font-bold underline decoration-blue-400">{displayValue}</strong></span>
              </span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">Editable</span>
            </div>
          )}

          {/* Filtered Options List */}
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((opt, idx) => {
                const isSelected = (displayValue || '').trim().toLowerCase() === opt.value.toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="truncate text-[13px] font-medium">
                        {opt.value}
                      </span>
                      {opt.detail && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                          {opt.detail}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                          {opt.category}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-4 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <span className="text-[12px]">No preset match found.</span>
              <span className="text-[11px] text-slate-500 font-medium">Your typed text "<strong>{displayValue}</strong>" will be saved as is.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
