const { sendMail } = require('../mailer');

async function cancellationWorker(payload) {
  const { customer_email, customer_name, confirmation_code, date, time_slot } = payload;

  const restaurantName = process.env.RESTAURANT_NAME || '如如的創意料理';
  const subject = `【訂位取消】${confirmation_code} — ${restaurantName}`;

  const text = [
    `親愛的 ${customer_name} 您好，`,
    '',
    '您的以下訂位已取消：',
    '',
    `  確認碼：${confirmation_code}`,
    `  日　期：${date}`,
    `  時　段：${time_slot}`,
    '',
    '若有任何疑問，歡迎直接聯繫餐廳。',
    '',
    `${restaurantName}`,
    `  電話：${process.env.RESTAURANT_PHONE || ''}`,
  ].join('\n');

  await sendMail({ to: customer_email, subject, text });
}

module.exports = cancellationWorker;
