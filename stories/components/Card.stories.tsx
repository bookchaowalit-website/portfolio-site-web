import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const meta = { title: "Components/Card", component: Card } satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Project: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>ระบบติดตามงาน</CardTitle>
        <CardDescription>แอพจัดการงานส่วนตัว พร้อมรายงานรายสัปดาห์</CardDescription>
        <CardAction>
          <Badge variant="outline">Live</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Next.js · Tailwind · PostHog</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">เปิดดู</Button>
        <Button size="sm" variant="ghost">
          ซอร์สโค้ด
        </Button>
      </CardFooter>
    </Card>
  ),
};
export const Grid: Story = {
  render: () => (
    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
      {["AI", "Data", "Web", "Mobile", "Game", "Finance"].map((t) => (
        <Card key={t} className="rounded-none border-0">
          <CardHeader>
            <CardTitle>{t}</CardTitle>
            <CardDescription>ตัวอย่างการ์ดในกริด hairline (gap-px bg-border)</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  ),
};
