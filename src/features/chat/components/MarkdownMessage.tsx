import React, { useMemo } from 'react';
import { View, StyleSheet, Text as RNText, ScrollView } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface MarkdownMessageProps {
  text: string;
  isUser: boolean;
}

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'table'; headers: string[]; alignments: ('left' | 'center' | 'right')[]; rows: string[][] }
  | { type: 'code_block'; lang?: string; code: string }
  | { type: 'blockquote'; text: string }
  | { type: 'divider' }
  | { type: 'list_item'; listType: 'bullet' | 'number'; marker?: string; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'spacer' };

/**
 * Format inline text for bold (***bold italic***, **bold**, *italic*) and code (`code`).
 */
function renderInlineFormattedText(
  text: string,
  baseStyle: object,
  boldStyle: object,
  codeStyle: object
) {
  // Regex to match ***bold italic***, **bold**, *italic*, `code`
  const regex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('***') && part.endsWith('***')) {
      const content = part.slice(3, -3);
      return (
        <RNText key={index} style={[baseStyle, boldStyle, { fontStyle: 'italic' }]}>
          {content}
        </RNText>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return (
        <RNText key={index} style={[baseStyle, boldStyle]}>
          {content}
        </RNText>
      );
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      const content = part.slice(1, -1);
      return (
        <RNText key={index} style={[baseStyle, { fontStyle: 'italic' }]}>
          {content}
        </RNText>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      const content = part.slice(1, -1);
      return (
        <RNText key={index} style={[baseStyle, codeStyle]}>
          {content}
        </RNText>
      );
    }

    return (
      <RNText key={index} style={baseStyle}>
        {part}
      </RNText>
    );
  });
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('-')) return false;
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(trimmed);
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes('|') && !trimmed.startsWith('#') && !trimmed.startsWith('```');
}

function parseRowCells(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map(c => c.trim());
}

function parseAlignments(line: string): ('left' | 'center' | 'right')[] {
  return parseRowCells(line).map(cell => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
}

function parseMarkdownBlocks(rawText: string): Block[] {
  const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code_block', lang, code: codeLines.join('\n') });
      i++;
      continue;
    }

    // Table block: row followed by separator
    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = parseRowCells(line);
      const alignments = parseAlignments(lines[i + 1]);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && isTableRow(lines[i]) && !isTableSeparator(lines[i])) {
        const cells = parseRowCells(lines[i]);
        while (cells.length < headers.length) cells.push('');
        rows.push(cells.slice(0, headers.length));
        i++;
      }
      blocks.push({ type: 'table', headers, alignments, rows });
      continue;
    }

    // Headings (#, ##, ###, ####)
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#+)\s*(.*)/);
      if (match) {
        blocks.push({
          type: 'heading',
          level: match[1].length,
          text: match[2],
        });
        i++;
        continue;
      }
    }

    // Blockquote (> text)
    if (trimmed.startsWith('>')) {
      blocks.push({
        type: 'blockquote',
        text: trimmed.replace(/^>\s*/, ''),
      });
      i++;
      continue;
    }

    // Horizontal divider (---, ***, ___)
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'divider' });
      i++;
      continue;
    }

    // Bullet list items (-, *, •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      blocks.push({
        type: 'list_item',
        listType: 'bullet',
        text: bulletMatch[1],
      });
      i++;
      continue;
    }

    // Numbered list items (1., 2., etc.)
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberMatch) {
      blocks.push({
        type: 'list_item',
        listType: 'number',
        marker: numberMatch[1],
        text: numberMatch[2],
      });
      i++;
      continue;
    }

    // Empty line -> spacing
    if (!trimmed) {
      blocks.push({ type: 'spacer' });
      i++;
      continue;
    }

    // Paragraph line
    blocks.push({
      type: 'paragraph',
      text: line,
    });
    i++;
  }

  return blocks;
}

function computeColumnWidths(headers: string[], rows: string[][], containerWidth: number = 320): number[] {
  const colCount = headers.length;
  if (colCount === 0) return [];

  const maxLens = headers.map((h, i) => {
    let len = (h || '').length;
    for (const row of rows) {
      if (row[i]) {
        const clean = row[i].replace(/<[^>]+>/g, ' ');
        len = Math.max(len, clean.length);
      }
    }
    return len;
  });

  const rawWidths = maxLens.map((len, idx) => {
    // If it's the first column and content is concise (e.g. food group / category name)
    if (idx === 0 && len <= 16) return 85;
    if (len <= 14) return 90;
    if (len <= 30) return 120;
    if (len <= 70) return 155;
    return 180;
  });

  const totalRaw = rawWidths.reduce((a, b) => a + b, 0);

  if (totalRaw < containerWidth) {
    const scale = containerWidth / totalRaw;
    return rawWidths.map(w => Math.round(w * scale));
  }

  return rawWidths;
}

function renderTableCellContent(
  cellText: string,
  baseStyle: any,
  boldStyle: any,
  codeStyle: any,
  alignment: 'left' | 'center' | 'right',
  isFirstColumn: boolean
) {
  // Strip <br>, <br/>, <br /> and split into lines
  const lines = cellText
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return (
      <RNText style={[baseStyle, { textAlign: alignment }]}>
        -
      </RNText>
    );
  }

  return (
    <View style={{ gap: 5 }}>
      {lines.map((line, idx) => {
        const bulletMatch = line.match(/^[-*•]\s+(.*)/);
        if (bulletMatch) {
          return (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <RNText style={[baseStyle, { marginRight: 4, color: '#D53F8C', fontSize: 13, lineHeight: baseStyle.lineHeight }]}>
                •
              </RNText>
              <RNText style={[baseStyle, { flex: 1, textAlign: alignment }]}>
                {renderInlineFormattedText(bulletMatch[1], baseStyle, boldStyle, codeStyle)}
              </RNText>
            </View>
          );
        }

        const numberMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (numberMatch) {
          return (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <RNText style={[baseStyle, boldStyle, { marginRight: 4, opacity: 0.75 }]}>
                {numberMatch[1]}.
              </RNText>
              <RNText style={[baseStyle, { flex: 1, textAlign: alignment }]}>
                {renderInlineFormattedText(numberMatch[2], baseStyle, boldStyle, codeStyle)}
              </RNText>
            </View>
          );
        }

        return (
          <RNText
            key={idx}
            style={[
              baseStyle,
              isFirstColumn && boldStyle,
              { textAlign: alignment },
            ]}
          >
            {renderInlineFormattedText(line, baseStyle, boldStyle, codeStyle)}
          </RNText>
        );
      })}
    </View>
  );
}

/**
 * Lightweight, beautiful Markdown Renderer for Chat Bubbles.
 * Supports tables, headings, bold/italic, bullet/numbered lists, blockquotes, dividers, and code blocks.
 */
export function MarkdownMessage({ text, isUser }: MarkdownMessageProps) {
  const theme = useTheme<Theme>();

  const textColor = isUser
    ? theme.colors.chatBubbleUserText
    : theme.colors.chatBubbleAIText;

  const baseTextStyle = {
    color: textColor,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  };

  const cellTextStyle = {
    color: textColor,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  };

  const boldTextStyle = {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '700' as const,
  };

  const codeTextStyle = {
    backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
    fontFamily: 'Platform',
    fontSize: 13,
    paddingHorizontal: 4,
    borderRadius: 4,
  };

  const blocks = useMemo(() => parseMarkdownBlocks(text), [text]);

  return (
    <View style={styles.container}>
      {blocks.map((block, bIdx) => {
        switch (block.type) {
          case 'spacer':
            return <View key={bIdx} style={{ height: 6 }} />;

          case 'heading': {
            const fontSize = block.level === 1 ? 19 : block.level === 2 ? 17 : 16;
            return (
              <RNText
                key={bIdx}
                style={[
                  baseTextStyle,
                  boldTextStyle,
                  { fontSize, lineHeight: fontSize * 1.35, marginTop: bIdx === 0 ? 0 : 8, marginBottom: 4 },
                ]}
              >
                {renderInlineFormattedText(block.text, baseTextStyle, boldTextStyle, codeTextStyle)}
              </RNText>
            );
          }

          case 'table': {
            const totalCols = block.headers.length;
            const getFlex = (colIdx: number) => {
              if (totalCols === 2) return 1;
              if (totalCols === 3) return colIdx === 0 ? 0.95 : 1.45;
              return 1;
            };

            return (
              <View key={bIdx} style={styles.tableWrapper}>
                <View style={[styles.tableContainer, { borderColor: theme.colors.border }]}>
                  {/* Header Row */}
                  <View
                    style={[
                      styles.tableHeaderRow,
                      {
                        backgroundColor: isUser ? 'rgba(255,255,255,0.25)' : theme.colors.warmSurfaceSoft,
                        borderBottomColor: theme.colors.border,
                      },
                    ]}
                  >
                    {block.headers.map((h, colIdx) => (
                      <View
                        key={colIdx}
                        style={[
                          styles.tableHeaderCell,
                          { flex: getFlex(colIdx) },
                          colIdx < totalCols - 1 && {
                            borderRightWidth: StyleSheet.hairlineWidth,
                            borderRightColor: theme.colors.border,
                          },
                        ]}
                      >
                        <RNText
                          style={[
                            baseTextStyle,
                            boldTextStyle,
                            styles.tableHeaderText,
                            { textAlign: block.alignments[colIdx] || 'left' },
                          ]}
                        >
                          {renderInlineFormattedText(h, baseTextStyle, boldTextStyle, codeTextStyle)}
                        </RNText>
                      </View>
                    ))}
                  </View>

                  {/* Data Rows */}
                  {block.rows.map((row, rowIdx) => {
                    const isEven = rowIdx % 2 === 1;
                    const isLastRow = rowIdx === block.rows.length - 1;
                    return (
                      <View
                        key={rowIdx}
                        style={[
                          styles.tableRow,
                          isEven && {
                            backgroundColor: isUser ? 'rgba(255,255,255,0.08)' : 'rgba(0, 0, 0, 0.015)',
                          },
                          !isLastRow && {
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: theme.colors.border,
                          },
                        ]}
                      >
                        {row.map((cellText, colIdx) => (
                          <View
                            key={colIdx}
                            style={[
                              styles.tableCell,
                              { flex: getFlex(colIdx) },
                              colIdx < totalCols - 1 && {
                                borderRightWidth: StyleSheet.hairlineWidth,
                                borderRightColor: theme.colors.border,
                              },
                            ]}
                          >
                            {renderTableCellContent(
                              cellText,
                              cellTextStyle,
                              boldTextStyle,
                              codeTextStyle,
                              block.alignments[colIdx] || 'left',
                              colIdx === 0
                            )}
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          }

          case 'list_item': {
            if (block.listType === 'number') {
              return (
                <View key={bIdx} style={styles.listRow}>
                  <RNText style={[baseTextStyle, styles.numberSymbol]}>{block.marker}.</RNText>
                  <RNText style={[baseTextStyle, styles.listText]}>
                    {renderInlineFormattedText(block.text, baseTextStyle, boldTextStyle, codeTextStyle)}
                  </RNText>
                </View>
              );
            }

            return (
              <View key={bIdx} style={styles.listRow}>
                <RNText style={[baseTextStyle, styles.bulletSymbol, { color: '#D53F8C' }]}>•</RNText>
                <RNText style={[baseTextStyle, styles.listText]}>
                  {renderInlineFormattedText(block.text, baseTextStyle, boldTextStyle, codeTextStyle)}
                </RNText>
              </View>
            );
          }

          case 'blockquote':
            return (
              <View
                key={bIdx}
                style={[
                  styles.blockquoteContainer,
                  {
                    borderLeftColor: theme.colors.primary,
                    backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : theme.colors.warmSurfaceSoft,
                  },
                ]}
              >
                <RNText style={[baseTextStyle, { fontStyle: 'italic' }]}>
                  {renderInlineFormattedText(block.text, baseTextStyle, boldTextStyle, codeTextStyle)}
                </RNText>
              </View>
            );

          case 'divider':
            return (
              <View key={bIdx} style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            );

          case 'code_block':
            return (
              <View
                key={bIdx}
                style={[
                  styles.codeBlockContainer,
                  {
                    backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.04)',
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                {!!block.lang && (
                  <RNText style={[styles.codeBlockLang, { color: theme.colors.textMuted }]}>
                    {block.lang}
                  </RNText>
                )}
                <RNText style={[styles.codeBlockText, { color: textColor }]}>
                  {block.code}
                </RNText>
              </View>
            );

          case 'paragraph': {
            const paragraphLines = block.text.replace(/<br\s*\/?>/gi, '\n').split('\n');
            return (
              <View key={bIdx} style={{ marginBottom: bIdx === blocks.length - 1 ? 0 : 2 }}>
                {paragraphLines.map((pLine, pIdx) => (
                  <RNText key={pIdx} style={baseTextStyle}>
                    {renderInlineFormattedText(pLine, baseTextStyle, boldTextStyle, codeTextStyle)}
                  </RNText>
                ))}
              </View>
            );
          }

          default:
            return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 4,
  },
  bulletSymbol: {
    marginRight: 6,
    fontSize: 16,
    lineHeight: 22,
  },
  numberSymbol: {
    marginRight: 6,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
  },
  listText: {
    flex: 1,
  },
  tableWrapper: {
    marginVertical: 8,
  },
  tableTopBar: {
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  tableScrollView: {
    borderRadius: 12,
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
  },
  tableHeaderCell: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    justifyContent: 'flex-start',
  },
  tableHeaderText: {
    fontSize: 13,
    lineHeight: 18,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    justifyContent: 'flex-start',
  },
  scrollHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scrollHintText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  codeBlockContainer: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 6,
  },
  codeBlockLang: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  codeBlockText: {
    fontFamily: 'Platform',
    fontSize: 13,
    lineHeight: 18,
  },
  blockquoteContainer: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 6,
    paddingRight: 8,
    borderRadius: 6,
    marginVertical: 6,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
