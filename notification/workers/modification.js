const { sendMail } = require('../mailer');

const R = {
  name: process.env.RESTAURANT_NAME || '如如的創意料理',
  phone: process.env.RESTAURANT_PHONE || '',
};

async function modificationWorker(payload) {
  const { customer_email, customer_name, confirmation_code, date, time_slot, party_size } = payload;

  const subject = `【訂位修改確認】${confirmation_code} — ${R.name}`;

  const text = [
    `親愛的 ${customer_name} 您好，`,
    '',
    '您的訂位已成功修改，以下是更新後的訂位資訊：',
    '',
    `  確認碼：${confirmation_code}`,
    `  日　期：${date}`,
    `  時　段：${time_slot}`,
    `  人　數：${party_size} 位`,
    '',
    '如需進一步變更，請至訂位頁面輸入確認碼操作。',
    '',
    `${R.name}`,
    `  電話：${R.phone}`,
  ].join('\n');

  await sendMail({ to: customer_email, subject, text });
}

module.exports = modificationWorker;
