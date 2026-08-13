"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check existing subscription
      navigator.serviceWorker.ready.then(async (reg) => {
        try {
          const sub = await reg.pushManager.getSubscription();
          const isToggledOff = localStorage.getItem('push_toggled_off') === 'true';
          
          if (sub && !isToggledOff) {
            setSubscription(sub);
          } else if (sub && isToggledOff) {
            // Silently try to clean up orphaned subscription if browser allows
            sub.unsubscribe().catch(() => {});
          }
        } catch (e) {
          console.error("Error checking subscription:", e);
        }
      });
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) return false;
    
    setLoading(true);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      
      if (permissionResult !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Explicitly register/get the service worker to prevent hanging on .ready
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      // Wait until it's active
      if (registration.installing) {
        await new Promise((resolve) => {
          registration.installing?.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') {
              resolve(true);
            }
          });
        });
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("Missing VAPID key in environment");
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
      
      // Send to our backend
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'omit',
        body: JSON.stringify({ subscription: sub })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to save subscription: ${errorData.details || errorData.error || res.statusText}`);
      }

      setSubscription(sub);
      localStorage.setItem('push_toggled_off', 'false');
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Failed to subscribe:', err);
      alert(`Push Notification Error: ${err.message || "Unknown error"}. Check console for details.`);
      setLoading(false);
      return false;
    }
  };

  const sendTestNotification = async () => {
    if (!subscription) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Auto-sync the subscription to the DB just in case it was lost
      const subRes = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'omit',
        body: JSON.stringify({ subscription })
      });
      if (!subRes.ok) {
         const subErr = await subRes.json().catch(() => ({}));
         throw new Error(`Subscribe failed: ${subErr.details || subErr.error || subRes.statusText}`);
      }

      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'omit',
        body: JSON.stringify({
          title: "Test Notification",
          body: "This is a test notification from EX-it."
        })
      });
      if (!res.ok) {
         const sendErr = await res.json().catch(() => ({}));
         throw new Error(`Send failed: ${sendErr.details || sendErr.error || res.statusText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send test notification.");
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return false;
    
    setLoading(true);
    try {
      // Attempt to unsubscribe from the browser's push manager, but don't block on its success
      // Sometimes Apple/Google return false here, but we still want to wipe it from our DB!
      await subscription.unsubscribe().catch(console.error);
      
      // Force remove from our backend so we stop sending pushes
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'omit',
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      
      // Force clear the local state
      setSubscription(null);
      localStorage.setItem('push_toggled_off', 'true');
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Failed to unsubscribe:', err);
      // Even if there's an error, try to clear the local state to unstick the UI
      setSubscription(null);
      localStorage.setItem('push_toggled_off', 'true');
      setLoading(false);
      return false;
    }
  };

  return {
    isSupported,
    subscription,
    permission,
    loading,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
}
