import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Text } from '@/theme/restyleComponents';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

interface MarkdownMessageProps {
  text: string;
  isUser: boolean;
}

/**
 * Format inline text for bold (**text** or *text*) and code (`code`).
 */
function renderInlineFormattedText(
  text: string,
  baseStyle: object,
  boldStyle: object,
  codeStyle: object
) {
  // Regex to match **bold**, *bold*, or `code`
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

/**
 * Lightweight, beautiful Markdown Renderer for Chat Bubbles.
 * Supports headings, bold/italic, bullet lists, numbered lists, blockquotes, and code snippets.
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

  const boldTextStyle = {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '700' as const,
  };

  const codeTextStyle = {
    backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
    fontFamily: 'Platform', // fallback monospace
    fontSize: 13,
    paddingHorizontal: 4,
    borderRadius: 4,
  };

  const lines = text.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // Empty line -> spacing
        if (!trimmed) {
          return <View key={index} style={{ height: 6 }} />;
        }

        // Headings: ###, ##, #
        if (trimmed.startsWith('#')) {
          const level = (trimmed.match(/^#+/) || ['#'])[0].length;
          const headingText = trimmed.replace(/^#+\s*/, '');
          const fontSize = level === 1 ? 19 : level === 2 ? 17 : 16;

          return (
            <RNText
              key={index}
              style={[
                baseTextStyle,
                boldTextStyle,
                { fontSize, lineHeight: fontSize * 1.35, marginTop: index === 0 ? 0 : 8, marginBottom: 4 },
              ]}
            >
              {renderInlineFormattedText(headingText, baseTextStyle, boldTextStyle, codeTextStyle)}
            </RNText>
          );
        }

        // Bullet lists: - item, * item, • item
        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
        if (bulletMatch) {
          const listContent = bulletMatch[1];
          return (
            <View key={index} style={styles.listRow}>
              <RNText style={[baseTextStyle, styles.bulletSymbol]}>•</RNText>
              <RNText style={[baseTextStyle, styles.listText]}>
                {renderInlineFormattedText(listContent, baseTextStyle, boldTextStyle, codeTextStyle)}
              </RNText>
            </View>
          );
        }

        // Numbered lists: 1. item, 2. item
        const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberMatch) {
          const num = numberMatch[1];
          const listContent = numberMatch[2];
          return (
            <View key={index} style={styles.listRow}>
              <RNText style={[baseTextStyle, styles.numberSymbol]}>{num}.</RNText>
              <RNText style={[baseTextStyle, styles.listText]}>
                {renderInlineFormattedText(listContent, baseTextStyle, boldTextStyle, codeTextStyle)}
              </RNText>
            </View>
          );
        }

        // Standard text line
        return (
          <RNText key={index} style={[baseTextStyle, { marginBottom: index === lines.length - 1 ? 0 : 2 }]}>
            {renderInlineFormattedText(line, baseTextStyle, boldTextStyle, codeTextStyle)}
          </RNText>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 6,
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
});
