const BLOCK_SPLIT = /(?<=<\/(?:p|h[1-6]|ul|ol|blockquote|div)>)/i;
const CHARS_PER_LINE = 90;

function approximateLines(htmlBlock: string): number {
  const text = htmlBlock.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  return Math.max(1, Math.ceil(text.length / CHARS_PER_LINE));
}

export interface PaywallSplit {
  freeHtml: string;
  blurredHtml: string;
  lockedHtml: string;
  hasLocked: boolean;
}

/**
 * Splits an article body into a free part, a blurred teaser and a locked part,
 * using the number of preview lines configured on the article.
 */
export function splitHtmlForPaywall(bodyHtml: string, previewLines: number): PaywallSplit {
  const blocks = bodyHtml.split(BLOCK_SPLIT).filter((block) => block.trim().length > 0);
  const freeBlocks: string[] = [];
  let lines = 0;

  let index = 0;
  for (; index < blocks.length; index += 1) {
    if (lines >= previewLines) {
      break;
    }

    freeBlocks.push(blocks[index]);
    lines += approximateLines(blocks[index]);
  }

  const blurredBlocks = blocks.slice(index, index + 1);
  const lockedBlocks = blocks.slice(index + 1);

  return {
    freeHtml: freeBlocks.join(''),
    blurredHtml: blurredBlocks.join(''),
    lockedHtml: lockedBlocks.join(''),
    hasLocked: index < blocks.length,
  };
}
