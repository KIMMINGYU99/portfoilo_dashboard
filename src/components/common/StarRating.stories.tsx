import type { Meta, StoryObj } from "@storybook/react";
import StarRating from "./StarRating";

const meta: Meta<typeof StarRating> = {
  title: "Common/StarRating",
  component: StarRating,
  args: {
    value: 3,
    max: 5,
    size: 24,
  },
  argTypes: {
    value: { control: { type: "number", min: 0, max: 5, step: 1 } },
    max: { control: { type: "number", min: 1, max: 10, step: 1 } },
    size: { control: { type: "number", min: 12, max: 48, step: 2 } },
  },
};

export default meta;
type Story = StoryObj<typeof StarRating>;

export const Default: Story = {};

export const FourStars: Story = {
  args: { value: 4 },
};
