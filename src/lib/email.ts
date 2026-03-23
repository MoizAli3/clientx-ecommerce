import { Resend } from "resend";
import type { Order } from "@/types";

const FROM = process.env.RESEND_FROM_EMAIL || "noreply@maxwatches.pk";

export async function sendOrderConfirmationEmail(order: Order, email: string) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px">${item.product?.name ?? "Product"}</td>
          <td style="padding:8px;text-align:center">${item.quantity}</td>
          <td style="padding:8px;text-align:right">PKR ${item.total_price.toLocaleString()}</td>
        </tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Order Confirmed — ${order.order_number}`,
    html: `
      <h2>Shukriya! Aapka order receive ho gaya.</h2>
      <p><strong>Order #:</strong> ${order.order_number}</p>
      <table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">
        <thead>
          <tr>
            <th style="padding:8px;text-align:left">Product</th>
            <th style="padding:8px">Qty</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:8px;text-align:right"><strong>Total:</strong></td>
            <td style="padding:8px;text-align:right"><strong>PKR ${order.total.toLocaleString()}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p>Delivery address: ${order.shipping_address.address_line1}, ${order.shipping_address.city}</p>
      <p>Hum aapko update karte rahenge. Shukriya!</p>
    `,
  });
}
