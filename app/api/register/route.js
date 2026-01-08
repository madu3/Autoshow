import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, no_hp } = body;

    // --- LOGIKA KIRIM WA (Contoh via Fonnte) ---
    // Pastikan no_hp diformat (misal ganti 08 jadi 628)
    if (process.env.FONNTE_TOKEN) {
        const formattedHp = no_hp.startsWith('0') ? '62' + no_hp.slice(1) : no_hp;
        
        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': process.env.FONNTE_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target: formattedHp,
                message: `Halo ${nama}, Terima kasih! Pendaftaran Anda telah kami terima. Admin kami akan segera memverifikasi bukti pembayaran Anda.`
            })
        });
    }
    // -------------------------------------------

    return NextResponse.json({ success: true, message: "Sukses mendaftar" });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}