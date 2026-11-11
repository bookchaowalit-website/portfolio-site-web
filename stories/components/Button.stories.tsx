import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "ติดต่อเรา", variant: "default", size: "default", disabled: false },
  argTypes: {
    variant: { control: "select", options: ["default", "destructive", "outline", "secondary", "ghost", "link"] },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(["default", "destructive", "outline", "secondary", "ghost", "link"] as const).map((v) => (
        <Button key={v} {...args} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
};
export const WithIcon: Story = {
  render: (args) => (
    <div className="flex gap-3">
      <Button {...args}>
        <Mail /> ส่งอีเมล
      </Button>
      <Button {...args} variant="outline">
        ดูผลงาน <ArrowRight />
      </Button>
      <Button {...args} size="icon" aria-label="ส่งอีเมล">
        <Mail />
      </Button>
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true } };
export const AsLink: Story = { render: (args) => <Button {...args} asChild><a href="#contact">ไปที่ฟอร์มติดต่อ</a></Button> };
