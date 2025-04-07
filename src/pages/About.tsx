import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/contexts/LanguageContext';

interface AboutProps {
  onTabChange: (tab: string) => void;
}

const About: React.FC<AboutProps> = ({ onTabChange }) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('about')}</h2>
        <p className="text-muted-foreground">
          {t('about-description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('about-title')}</CardTitle>
          <CardDescription>
            {t('about-subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{t('about-features')}</h3>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>{t('about-feature-1')}</li>
                <li>{t('about-feature-2')}</li>
                <li>{t('about-feature-3')}</li>
                <li>{t('about-feature-4')}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t('about-privacy')}</h3>
              <p className="mt-2">
                {t('about-privacy-description')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t('about-contact')}</h3>
              <p className="mt-2">
                {t('about-contact-description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default About; 