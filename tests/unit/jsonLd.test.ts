import { describe, it, expect } from 'vitest';
import { getOrganizationSchema, getFaqSchema, getBreadcrumbSchema } from '../../src/utils/jsonLd';

describe('JSON-LD Schema Generators Unit Tests', () => {
  it('should generate valid Organization schema', () => {
    const schema = getOrganizationSchema();
    expect(schema['@type']).toBe('ProfessionalService');
    expect(schema.name).toBe('Rent Yazılım');
  });

  it('should generate valid FAQPage schema', () => {
    const faqs = [{ question: 'Soru 1', answer: 'Cevap 1' }];
    const schema = getFaqSchema(faqs);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0].name).toBe('Soru 1');
  });

  it('should generate valid BreadcrumbList schema', () => {
    const items = [{ name: 'Test Page', url: '/test' }];
    const schema = getBreadcrumbSchema(items);
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(1);
  });
});
