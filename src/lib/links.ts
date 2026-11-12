import site from '../data/site.json';

export const telHref = `tel:${site.phone.replace(/\s/g, '')}`;

export const waHref = (text?: string) => {
  const base = `https://wa.me/${site.whatsapp.replace(/\D/g, '')}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};

const socialNames = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'],
  ['x', 'X'],
] as const;

export const socialLinks = socialNames
  .map(([name, label]) => ({ name, label, url: site.social[name] }))
  .filter((s) => s.url);
