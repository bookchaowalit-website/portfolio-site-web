import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { BreadcrumbJsonLd } from '@/components/breadcrumb-json-ld';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const seoTitles = {
    en: "Privacy Policy - Chaowalit Greepoke | Data Protection & Privacy Rights",
    th: "นโยบายความเป็นส่วนตัว - เชาวลิต กรีโภค | การปกป้องข้อมูลและสิทธิด้านความเป็นส่วนตัว"
  };

  const seoDescriptions = {
    en: "Read our comprehensive privacy policy explaining how we collect, use, and protect your personal information. Learn about your privacy rights and data protection measures.",
    th: "อ่านนโยบายความเป็นส่วนตัวที่ครอบคลุมของเรา อธิบายวิธีที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ เรียนรู้เกี่ยวกับสิทธิด้านความเป็นส่วนตัวและมาตรการป้องกันข้อมูล"
  };

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'),
    title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
    description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
    robots: 'index, follow',
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: {
        'en': '/en/privacy',
        'th': '/th/privacy',
        'x-default': '/en/privacy'
      }
    },
    openGraph: {
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      type: 'website',
      locale: locale,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'}/${locale}/privacy`,
      siteName: 'Chaowalit Greepoke Portfolio',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Privacy Policy' }]
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      creator: '@bookchaowalit',
      images: ['/og-image.jpg']
    }
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com';
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Privacy Policy', url: `${baseUrl}/${locale}/privacy` },
  ];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: locale === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy',
            url: `${baseUrl}/${locale}/privacy`,
            description: locale === 'th'
              ? 'นโยบายความเป็นส่วนตัวของเชาวลิต กรีโภค'
              : 'Privacy policy for Chaowalit Greepoke portfolio and applications.',
          }) }}
        />
        <BreadcrumbJsonLd items={breadcrumbItems} />
        <BreadcrumbNav items={[
          { name: locale === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy' },
        ]} />
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('general.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('general.effective_date')}</h3>
              <p className="text-muted-foreground">{t('general.date')}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">{t('general.intro_title')}</h3>
              <p className="text-muted-foreground">{t('general.intro_text')}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">{t('general.data_collection.title')}</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>{t('general.data_collection.website_analytics')}</li>
                <li>{t('general.data_collection.contact_info')}</li>
                <li>{t('general.data_collection.usage_data')}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">{t('general.data_usage.title')}</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>{t('general.data_usage.improve_services')}</li>
                <li>{t('general.data_usage.respond_inquiries')}</li>
                <li>{t('general.data_usage.analytics')}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">{t('general.contact.title')}</h3>
              <p className="text-muted-foreground">
                {t('general.contact.email')}: <a href="mailto:bookchaowalit@gmail.com" className="text-foreground hover:underline break-all">bookchaowalit@gmail.com</a>
              </p>
              <p className="text-muted-foreground">
                {t('general.contact.website')}: <a href="https://bookchaowalit.com" className="text-foreground hover:underline break-all">https://bookchaowalit.com</a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('apps.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{t('apps.description')}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/privacy/messenger-bot" className="block">
                <Button variant="outline" className="w-full h-auto whitespace-normal p-4 flex flex-col items-center gap-2">
                  <div className="text-lg font-semibold">{t('apps.messenger_bot.title')}</div>
                  <div className="text-sm text-muted-foreground text-center">{t('apps.messenger_bot.description')}</div>
                </Button>
              </Link>

              <Link href="/privacy/web-apps" className="block">
                <Button variant="outline" className="w-full h-auto whitespace-normal p-4 flex flex-col items-center gap-2">
                  <div className="text-lg font-semibold">{t('apps.web_apps.title')}</div>
                  <div className="text-sm text-muted-foreground text-center">{t('apps.web_apps.description')}</div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
