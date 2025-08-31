import type { Meta, StoryObj } from '@storybook/react';
import { HomeIcon } from '@heroicons/react/24/outline';
import PageHeader from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Common/PageHeader',
  component: PageHeader,
  args: {
    pageIcon: HomeIcon,
    pageName: '프로젝트',
    title: '대시보드',
    description: '프로젝트 개요와 상태를 보여줍니다',
    centered: false,
  },
  parameters: {
    a11y: { disable: false },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {};

export const Centered: Story = {
  args: { centered: true },
};

