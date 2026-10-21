"use client";

import dynamic from "next/dynamic";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import { NavigationBrand } from './navigation-brand';
import { ThemeToggle } from './theme-toggle';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const CommandPalette = dynamic(
  () => import('./command-palette').then((mod) => ({ default: mod.CommandPalette })),
  { ssr: false, loading: () => null },
);

const HelpDialog = dynamic(
  () => import('./help-dialog').then((mod) => ({ default: mod.HelpDialog })),
  { ssr: false, loading: () => null },
);


type RouteHref = Parameters<typeof Link>[0]['href'];

export function Navigation() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const navItems: { name: string; href: RouteHref; key: string }[] = [
    { name: t('home'), href: "/", key: "home" },
    { name: t('portfolio'), href: "/projects", key: "portfolio" },
    { name: t('about'), href: "/about", key: "about" },
    { name: t('blog'), href: "/blog", key: "blog" },
    { name: t('contact'), href: "/contact", key: "contact" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 sticky top-0 z-50" aria-label="Main navigation">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NavigationBrand />

          <NavigationMenu className="hidden lg:flex" viewport={false}>
            <NavigationMenuList className="flex space-x-4">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.key}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        "px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                        pathname === item.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            <HelpDialog />
            <CommandPalette />
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? t('closeMobileMenu') || 'Close menu' : t('openMobileMenu') || 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-navigation" className="lg:hidden border-t bg-background">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "block px-3 py-2 text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
