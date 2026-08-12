import brandConfig from '../config/brand';

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${brandConfig.siteUrl}/#organization`,
    name: brandConfig.brandName,
    alternateName: brandConfig.legalCompanyName,
    url: brandConfig.siteUrl,
    logo: `${brandConfig.siteUrl}${brandConfig.logoPath}`,
    image: `${brandConfig.siteUrl}${brandConfig.logoPath}`,
    description: brandConfig.description,
    telephone: brandConfig.phone,
    email: brandConfig.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ankara',
      addressCountry: 'TR',
      streetAddress: brandConfig.address,
    },
    areaServed: brandConfig.serviceArea,
    sameAs: [brandConfig.instagramUrl],
    priceRange: '$$',
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${brandConfig.siteUrl}/#website`,
    url: brandConfig.siteUrl,
    name: brandConfig.brandName,
    description: brandConfig.description,
    publisher: {
      '@id': `${brandConfig.siteUrl}/#organization`,
    },
    inLanguage: 'tr-TR',
  };
}

export function getServiceSchema(serviceName: string, serviceDescription: string, serviceUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDescription,
    provider: {
      '@id': `${brandConfig.siteUrl}/#organization`,
    },
    url: serviceUrl,
    areaServed: brandConfig.serviceArea,
  };
}

export function getFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${brandConfig.siteUrl}${item.url}`,
    })),
  };
}
