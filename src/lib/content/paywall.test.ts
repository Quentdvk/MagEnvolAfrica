import { describe, expect, it } from 'vitest';
import { splitHtmlForPaywall } from './paywall';

const body = [
  '<p>Paragraphe un.</p>',
  '<p>Paragraphe deux.</p>',
  '<p>Paragraphe trois.</p>',
  '<p>Paragraphe quatre.</p>',
].join('');

describe('splitHtmlForPaywall', () => {
  it('keeps only the configured preview lines in the free part', () => {
    const { freeHtml, blurredHtml, hasLocked } = splitHtmlForPaywall(body, 2);

    expect(freeHtml).toBe('<p>Paragraphe un.</p><p>Paragraphe deux.</p>');
    expect(blurredHtml).toBe('<p>Paragraphe trois.</p>');
    expect(hasLocked).toBe(true);
  });

  it('locks nothing when the body fits in the preview', () => {
    const { freeHtml, hasLocked } = splitHtmlForPaywall('<p>Court.</p>', 12);

    expect(freeHtml).toBe('<p>Court.</p>');
    expect(hasLocked).toBe(false);
  });
});
