import type { Metadata } from 'next';
import { PricingClient } from '../../components/PricingClient';

export const metadata: Metadata = {
  title: 'Upgrade to Pro | ex-it',
  description: 'Unlock unlimited AI therapy sessions, closure conversations, and emotional insights with ex-it Pro.',
};

export default function PricingPage() {
  return <PricingClient />;
}
