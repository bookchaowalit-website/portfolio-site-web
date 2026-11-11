import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const meta = { title: "Components/Form fields" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Fields: Story = {
  render: () => (
    <form className="grid max-w-md gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-2">
        <Label htmlFor="sb-name">ชื่อ</Label>
        <Input id="sb-name" placeholder="สมชาย ใจดี" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sb-email">อีเมล</Label>
        <Input id="sb-email" type="email" placeholder="you@example.com" />
      </div>
      <Separator />
      <div className="grid gap-2">
        <Label htmlFor="sb-msg">ข้อความ</Label>
        <Textarea id="sb-msg" placeholder="เล่าโปรเจกต์ของคุณสั้น ๆ" />
      </div>
    </form>
  ),
};
export const States: Story = {
  render: () => (
    <div className="grid max-w-md gap-4">
      <div className="grid gap-2">
        <Label htmlFor="sb-dis">ปิดใช้งาน</Label>
        <Input id="sb-dis" disabled value="แก้ไขไม่ได้" readOnly />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sb-err">ผิดพลาด</Label>
        <Input id="sb-err" aria-invalid aria-describedby="sb-err-msg" defaultValue="not-an-email" />
        <p id="sb-err-msg" className="text-sm text-destructive">
          รูปแบบอีเมลไม่ถูกต้อง
        </p>
      </div>
    </div>
  ),
};
