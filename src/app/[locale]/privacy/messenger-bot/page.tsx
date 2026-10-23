import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/breadcrumb-json-ld';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const seoTitles = {
    en: "Messenger Bot Privacy Policy - Chaowalit Greepoke | Chatbot Data Protection",
    th: "นโยบายความเป็นส่วนตัวสำหรับ Messenger Bot - เชาวลิต กรีโภค | การปกป้องข้อมูล Chatbot"
  };

  const seoDescriptions = {
    en: "Privacy policy for Facebook Messenger bot services. Learn how we handle chatbot interactions, data collection, and user privacy in our automated messaging systems.",
    th: "นโยบายความเป็นส่วนตัวสำหรับบริการ Facebook Messenger bot เรียนรู้วิธีที่เราจัดการกับการโต้ตอบของ chatbot การเก็บข้อมูล และความเป็นส่วนตัวของผู้ใช้ในระบบข้อความอัตโนมัติ"
  };

  return {
    title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
    description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
    robots: 'index, follow',
    alternates: {
      canonical: `/${locale}/privacy/messenger-bot`,
      languages: {
        'en': '/en/privacy/messenger-bot',
        'th': '/th/privacy/messenger-bot',
        'x-default': '/en/privacy/messenger-bot'
      }
    },
  };
}

export default async function MessengerBotPrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy.messenger_bot' });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com';
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Privacy Policy', url: `${baseUrl}/${locale}/privacy` },
    { name: 'Messenger Bot', url: `${baseUrl}/${locale}/privacy/messenger-bot` },
  ];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <BreadcrumbJsonLd items={breadcrumbItems} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'PrivacyPolicy',
              name: 'Messenger Bot Privacy Policy',
              description: t('subtitle'),
              url: `${baseUrl}/${locale}/privacy/messenger-bot`,
              publisher: {
                '@type': 'Person',
                name: 'Chaowalit Greepoke',
                url: 'https://bookchaowalit.com'
              }
            })
          }}
        />
        <BreadcrumbNav items={[
          { name: locale === 'th' ? 'นโยบาย Messenger Bot' : 'Messenger Bot Privacy' },
        ]} />
        <div className="mb-8">
          <Link href="/privacy">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back_to_privacy')}
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{t('effective_date')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('date')}</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('data_collection.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t('data_collection.messages')}</li>
                <li>{t('data_collection.user_id')}</li>
                <li>{t('data_collection.timestamp')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('data_usage.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t('data_usage.responses')}</li>
                <li>{t('data_usage.analysis')}</li>
                <li>{t('data_usage.personalization')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('data_disclosure.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t('data_disclosure.policy')}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t('data_disclosure.legal_requirement')}</li>
                <li>{t('data_disclosure.service_providers')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('data_retention.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('data_retention.policy')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('user_rights.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t('user_rights.intro')}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t('user_rights.access')}</li>
                <li>{t('user_rights.correction')}</li>
                <li>{t('user_rights.deletion')}</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                {t('user_rights.contact')}: <a href="mailto:bookchaowalit@gmail.com" className="text-foreground hover:underline break-all">bookchaowalit@gmail.com</a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('data_security.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('data_security.policy')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('policy_updates.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('policy_updates.policy')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('contact.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                <p>Bookchaowalit</p>
                <p>{t('contact.website')}: <a href="https://bookchaowalit.com" className="text-foreground hover:underline">https://bookchaowalit.com</a></p>
                <p>{t('contact.email')}: <a href="mailto:bookchaowalit@gmail.com" className="text-foreground hover:underline break-all">bookchaowalit@gmail.com</a></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
