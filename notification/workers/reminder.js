const { sendMail } = require('../mailer');

const R = {
  name: process.env.RESTAURANT_NAME || '如如的創意料理',
  phone: process.env.RESTAURANT_PHONE || '',
  address: process.env.RESTAURANT_ADDRESS || '',
};

async function reminderWorker(payload) {
  const { customer_email, customer_name, confirmation_code, date, time_slot, party_size } = payload;

  const subject = `【訂位提醒】明天 ${time_slot} — ${R.name}`;

  const text = [
    `親愛的 ${customer_name} 您好，`,
    '',
    '提醒您明天有一筆訂位即將到來：',
    '',
    `  確認碼：${confirmation_code}`,
    `  日　期：${date}`,
    `  時　段：${time_slot}`,
    `  人　數：${party_size} 位`,
    '',
    '如需變更，請至訂位頁面輸入確認碼操作。',
    '',
    '餐廳聯絡資訊',
    `  名稱：${R.name}`,
    `  電話：${R.phone}`,
    `  地址：${R.address}`,
    '',
    '期待您的光臨！',
  ].join('\n');

  await sendMail({ to: customer_email, subject, text });
}

module.exports = reminderWorker;
