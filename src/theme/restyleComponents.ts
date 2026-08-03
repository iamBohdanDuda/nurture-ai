import {
  createBox,
  createText,
  createRestyleComponent,
  createVariant,
  VariantProps,
} from '@shopify/restyle';
import { type Theme } from './theme';

// Primitive building blocks
export const Box = createBox<Theme>();
export const Text = createText<Theme>();

// Card with variants
const cardVariant = createVariant<Theme, 'cardVariants'>({
  themeKey: 'cardVariants',
});

export const Card = createRestyleComponent<
  VariantProps<Theme, 'cardVariants'> & React.ComponentProps<typeof Box>,
  Theme
>([cardVariant], Box);

export type BoxProps = React.ComponentProps<typeof Box>;
export type TextProps = React.ComponentProps<typeof Text>;
export type CardProps = React.ComponentProps<typeof Card>;
