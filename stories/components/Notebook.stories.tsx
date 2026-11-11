import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  HandDrawnBracket,
  HandDrawnHighlight,
  NotebookPaper,
  SketchArrow,
  SketchyFrame,
  StickyNote,
} from "@/components/ui/notebook-elements";
import { MixedTypographyTitle, NotebookSectionHeader, StudyGuideBox } from "@/components/ui/mixed-typography";

const meta = { title: "Components/Notebook elements" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Highlight: Story = {
  render: () => (
    <p className="text-2xl">
      สร้าง <HandDrawnHighlight>ระบบที่ใช้งานได้จริง</HandDrawnHighlight> ไม่ใช่แค่เดโม
    </p>
  ),
};
export const PaperVariants: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["default", "yellow", "pink", "green", "blue"] as const).map((c) => (
        <NotebookPaper key={c} color={c} className="p-6">
          <p>NotebookPaper color=&quot;{c}&quot;</p>
        </NotebookPaper>
      ))}
    </div>
  ),
};
export const StickyNotes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 p-6">
      <StickyNote rotation={-3}>จดไว้: ส่งงานศุกร์นี้</StickyNote>
      <StickyNote rotation={2} color="pink">
        ไอเดียใหม่
      </StickyNote>
      <StickyNote rotation={-1} color="blue">
        Todo
      </StickyNote>
    </div>
  ),
};
export const Arrows: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      {(["straight", "curved", "zigzag"] as const).map((s) => (
        <SketchArrow key={s} style={s} label={s} />
      ))}
      <SketchArrow direction="down" />
    </div>
  ),
};
export const Frames: Story = {
  render: () => (
    <div className="grid gap-6 sm:grid-cols-3">
      {(["dashed", "double", "wavy"] as const).map((v) => (
        <SketchyFrame key={v} variant={v} className="p-6">
          {v}
        </SketchyFrame>
      ))}
    </div>
  ),
};
export const Bracket: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <HandDrawnBracket side="left" height={80} />
      <span>เนื้อหาในวงเล็บ</span>
      <HandDrawnBracket side="right" height={80} />
    </div>
  ),
};
export const Titles: Story = {
  render: () => (
    <div className="grid gap-8">
      <MixedTypographyTitle
        as="h2"
        words={[
          { text: "Build", style: "block", size: "xl" },
          { text: "real", style: "cursive", size: "xl" },
          { text: "systems", style: "outlined", size: "xl" },
        ]}
      />
      <NotebookSectionHeader title="ผลงานล่าสุด" subtitle="โปรเจกต์ที่ใช้งานจริง" />
      <div className="grid gap-4 sm:grid-cols-2">
        {(["tip", "note", "warning", "important"] as const).map((t) => (
          <StudyGuideBox key={t} title={t} type={t}>
            กล่องข้อมูลแบบสมุดจด ({t})
          </StudyGuideBox>
        ))}
      </div>
    </div>
  ),
};
