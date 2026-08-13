const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

webpush.setVapidDetails(
  'mailto:hello@ex-it.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
);

async function run() {
  console.log("Fetching subscriptions...");
  const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('*');
  if (error) {
    console.error("Error fetching subscriptions:", error);
    return;
  }
  
  if (!subscriptions || subscriptions.length === 0) {
    console.log("No subscriptions found.");
    return;
  }
  
  console.log(`Found ${subscriptions.length} subscriptions. Sending push...`);
  
  const payload = JSON.stringify({
    title: "EX-it: Hey there!",
    body: "Notifications are working perfectly!",
    data: { url: "/dashboard" },
  });

  for (const sub of subscriptions) {
    try {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      await webpush.sendNotification(pushSubscription, payload, { urgency: 'high', TTL: 86400 });
      console.log(`✅ Push sent to ${sub.endpoint.substring(0, 40)}...`);
    } catch (err) {
      console.error(`❌ Failed to send to ${sub.endpoint.substring(0, 40)}...`, err.statusCode || err);
    }
  }
}

run();
