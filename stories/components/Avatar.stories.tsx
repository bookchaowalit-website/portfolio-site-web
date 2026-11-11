import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const meta = { title: "Components/Avatar", component: Avatar } satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/does-not-exist.png" alt="" />
      <AvatarFallback>BC</AvatarFallback>
    </Avatar>
  ),
};
