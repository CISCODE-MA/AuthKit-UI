import { describe, it, expect } from 'vitest';
import { toTailwindColorClasses } from '../../src/utils/colorHelpers';

describe('colorHelpers.toTailwindColorClasses', () => {
  it('returns classes for valid tailwind strings', () => {
    const res = toTailwindColorClasses({
      bg: 'bg-red-500',
      text: 'text-white',
      border: 'border-green-300',
      fill: 'fill-current',
      stroke: 'stroke-current',
    });
    expect(res).toEqual({
      bgClass: 'bg-red-500',
      textClass: 'text-white',
      borderClass: 'border-green-300',
      fillClass: 'fill-current',
      strokeClass: 'stroke-current',
    });
  });

  it('passes through hex colors and uses fallbacks when needed', () => {
    const res = toTailwindColorClasses({ bg: '#FF9900', text: '' }, { text: 'text-gray-800' });
    expect(res.bgClass).toBe('#FF9900');
    expect(res.textClass).toBe('text-gray-800');
  });
});
