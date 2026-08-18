

async function testWeb3() {
  const accessKey = '4fe03905-e3fa-46e8-a387-364c3763d0ad';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: 'Test Subject',
        from_name: 'FlashBind Notifications',
        email: 'test@example.com',
        message: 'This is a test message to see if Web3Forms JSON API works',
      }),
    });

    const text = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Body:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testWeb3();
