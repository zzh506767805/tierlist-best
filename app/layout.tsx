import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Free Tier List Maker - Create Custom Tier Lists Online',
  description:
    'Create beautiful tier lists with our free drag-and-drop tier list maker. Upload images, rank items into S/A/B/C/D/F tiers, and export shareable images.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
