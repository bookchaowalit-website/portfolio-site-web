import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Breadcrumb } from "@/components/breadcrumb";

const meta = { title: "Sections/Layout", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = { render: () => <Navigation /> };
export const HeaderMobile: Story = { render: () => <Navigation />, globals: { viewport: { value: "w375" } } };
export const SiteFooter: Story = { name: "Footer", render: () => <Footer /> };
export const Controls: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <ThemeToggle />
      <LanguageSwitcher />
    </div>
  ),
};
export const Breadcrumbs: Story = {
  render: () => (
    <div className="p-4">
      <Breadcrumb items={[{ label: "หน้าแรก", href: "/th" }, { label: "บล็อก", href: "/th/blog" }, { label: "บทความ" }]} />
    </div>
  ),
};
