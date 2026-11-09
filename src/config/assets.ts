/**
 * Central image configuration.
 *
 * Add the supplied KOMS logo to public/assets/koms-logo.png, or replace the
 * value below with a URL/reference returned by the future image service.
 * Page components should never hardcode production image URLs.
 */
export const assetConfig = {
  logo: '/assets/koms-logo.png',
  studentAvatar: '/assets/students/KOMS-2026-001.jpeg',
  dojoLogo: '/assets/koms-logo.png',
  dashboardBanner:
    'https://images.unsplash.com/photo-1514050566906-8d077bae7046?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1600',
  dojoBanner:
    'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1600',
} as const

export type AssetKey = keyof typeof assetConfig
