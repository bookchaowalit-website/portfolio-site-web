import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroSection } from "@/components/lazy/hero-section";
import { AboutSection } from "@/components/lazy/about-section";
import { FeaturedProjects } from "@/components/lazy/featured-projects";
import { SkillsSection } from "@/components/lazy/skills-section";
import { BusinessSection } from "@/components/lazy/business-section";
import { BlogSection } from "@/components/lazy/blog-section";
import { ContactSection } from "@/components/lazy/contact-section";
import { NewsletterCTA } from "@/components/lazy/newsletter-cta";
import { DomainMap } from "@/components/lazy/domain-map";
import { KnowledgeAtlasSection } from "@/components/lazy/knowledge-atlas-section";
import { CareerTimeline } from "@/components/career-timeline";

const meta = { title: "Sections/Home page", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Hero: Story = { render: () => <HeroSection /> };
export const HeroMobile: Story = { render: () => <HeroSection />, globals: { viewport: { value: "w375" } } };
export const About: Story = { render: () => <AboutSection /> };
export const Featured: Story = { name: "Featured projects", render: () => <FeaturedProjects /> };
export const Skills: Story = { render: () => <SkillsSection /> };
export const Business: Story = { render: () => <BusinessSection /> };
export const BlogEmpty: Story = { name: "Blog (empty state)", render: () => <BlogSection blogPosts={[]} /> };
export const Contact: Story = { render: () => <ContactSection /> };
export const Newsletter: Story = { render: () => <NewsletterCTA /> };
export const Domains: Story = { name: "Domain map", render: () => <DomainMap /> };
export const Atlas: Story = { name: "Knowledge atlas", render: () => <KnowledgeAtlasSection /> };
export const Career: Story = { name: "Career timeline", render: () => <CareerTimeline /> };
