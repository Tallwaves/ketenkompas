const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400, headers: CORS });
  }

  const { naam, organisatie, email } = body;
  if (!naam || !email) {
    return new Response('Naam en email zijn verplicht', { status: 400, headers: CORS });
  }

  try {
    const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: 'gizanezra@gmail.com' }] }],
        from: { email: 'noreply@ketenkompas.nl', name: 'KetenKompas' },
        subject: 'Toegangsverzoek KetenKompas',
        content: [{
          type: 'text/plain',
          value: `Naam: ${naam}\nOrganisatie: ${organisatie || '—'}\nEmail: ${email}`,
        }],
      }),
    });

    if (res.status === 202) {
      return new Response('OK', { status: 200, headers: CORS });
    }
    const errText = await res.text();
    return new Response('Mail error: ' + errText, { status: 500, headers: CORS });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500, headers: CORS });
  }
}
