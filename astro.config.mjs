import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://livinghubhotel.com',
  // The old Dining page was split into Restaurant and Banquet Hall.
  redirects: {
    '/dining': '/restaurant/',
  },
});
