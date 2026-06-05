import { SITE_CONFIG } from '../config';

const BACKEND_URLS = [SITE_CONFIG.backendUrl, SITE_CONFIG.localBackendUrl];

async function sendViaBackend(to: string, message: string): Promise<boolean> {
  for (const url of BACKEND_URLS) {
    try {
      const res = await fetch(`${url}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message }),
      });
      if (res.ok) return true;
    } catch {}
  }
  return false;
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  const ok = await sendViaBackend(to, message);
  return { sent: ok, method: ok ? 'backend' : 'queued' };
}

export async function notifyBusinessOrder(order: {
  id: string;
  items: string;
  total: string;
  payment: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  pincode: string;
  location: string;
}): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  const message =
    `🛒 *NEW ORDER - ${SITE_CONFIG.siteName}* 🛒\n\n` +
    `Order: ${order.id}\n` +
    `Date: ${new Date().toLocaleString('en-IN')}\n\n` +
    `*Items:*\n${order.items}\n\n` +
    `*Total: ${order.total}*\n` +
    `*Payment: ${order.payment}*\n\n` +
    `*Deliver to:*\n${order.customerName}\n${order.customerPhone}\n${order.address}\n${order.city} — ${order.pincode}\n\n` +
    `*User Location:* ${order.location}\n\n` +
    `Website: ${SITE_CONFIG.siteUrl}`;

  return sendWhatsAppMessage(SITE_CONFIG.businessWhatsApp, message);
}

export async function sendOrderConfirmationToCustomer(customerPhone: string, order: {
  id: string;
  items: string;
  total: string;
  payment: string;
  customerName: string;
}): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  const message =
    `🎉 *Order Confirmed - ${SITE_CONFIG.siteName}* 🎉\n\n` +
    `Hi ${order.customerName},\n\n` +
    `Your order has been placed successfully! ✅\n\n` +
    `📋 *Order ID:* ${order.id}\n` +
    `📦 *Items:*\n${order.items}\n\n` +
    `💰 *Total: ${order.total}*\n` +
    `💳 *Payment: ${order.payment}*\n\n` +
    `We'll notify you when your order is on the way! 🚚\n\n` +
    `Track your order: ${SITE_CONFIG.siteUrl}/orders?order=${order.id}\n\n` +
    `Thank you for shopping with us! 🙏`;

  return sendWhatsAppMessage(customerPhone, message);
}

export async function sendTrackingToBusiness(orderId: string, trackingInfo: string): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  const message =
    `📦 *Track Order - ${SITE_CONFIG.siteName}*\n\n` +
    `Order: ${orderId}\n\n` +
    `*Timeline:*\n${trackingInfo}\n\n` +
    `Need help? Reply to this message.`;

  return sendWhatsAppMessage(SITE_CONFIG.businessWhatsApp, message);
}

export async function sendCustomerQueryToBusiness(customerPhone: string, query: string): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  const message =
    `📩 *Customer Query - ${SITE_CONFIG.siteName}*\n\n` +
    `From: +${customerPhone.replace(/\D/g, '')}\n` +
    `Message: "${query}"\n\n` +
    `Reply to this message to respond to the customer.`;

  return sendWhatsAppMessage(SITE_CONFIG.businessWhatsApp, message);
}
