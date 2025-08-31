import type { Meta, StoryObj } from '@storybook/react';
import ApiDoc from './ApiDoc';
import { apiServices } from './api.schemas';

const meta: Meta<typeof ApiDoc> = {
  title: 'API/Overview',
  component: ApiDoc,
  args: { services: apiServices },
  parameters: {
    docs: {
      page: () => <ApiDoc services={apiServices} />,
    },
  },
};

export default meta;

export const Overview: StoryObj<typeof ApiDoc> = {
  args: { services: apiServices },
};
