"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

const languages = [
  // Text codes, not flags: a flag names a country, not a language (2026-11-18 UX review).
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'th', name: 'ไทย', short: 'TH' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname as any, { locale: newLocale });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label={`Current language: ${currentLanguage.short} ${currentLanguage.name}. Click to change language`}
        >
          <Globe className="hidden min-[360px]:block h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden font-mono text-xs font-medium">{currentLanguage.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 ${
              locale === language.code ? 'bg-muted' : ''
            }`}
          >
            <span className="w-6 font-mono text-xs text-muted-foreground">{language.short}</span>
            <span>{language.name}</span>
            {locale === language.code && (
              <Check className="ml-auto h-3 w-3 text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}