'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nama: '', no_hp: '' });
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Mohon upload bukti transfer!');
    setLoading(true);

    try {
      // 1. Upload Gambar ke Supabase Storage
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '')}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('bukti-transfer')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Ambil Public URL gambar
      const { data: urlData } = supabase
        .storage
        .from('bukti-transfer')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;

      // 2. Simpan Data ke Tabel Supabase
      const { error: dbError } = await supabase
        .from('pendaftar')
        .insert([
          { 
            nama: formData.nama, 
            no_hp: formData.no_hp, 
            bukti_url: publicUrl 
          }
        ]);

      if (dbError) throw dbError;

      // 3. Panggil API Internal untuk Notifikasi WA
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: formData.nama, no_hp: formData.no_hp })
      });

      alert('Pendaftaran Berhasil! Cek WhatsApp Anda.');
      // Reset form
      setFormData({ nama: '', no_hp: '' });
      setFile(null);

    } catch (error) {
      console.error(error);
      alert('Gagal mendaftar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Form Pendaftaran</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nama Lengkap</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded text-black"
            value={formData.nama}
            onChange={(e) => setFormData({...formData, nama: e.target.value})}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">No WhatsApp (08xxx)</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded text-black"
            value={formData.no_hp}
            onChange={(e) => setFormData({...formData, no_hp: e.target.value})}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Bukti Transfer (DANA)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-black"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Format: JPG/PNG, Max 2MB</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Sedang Mengirim...' : 'Daftar Sekarang'}
        </button>
      </form>
    </div>
  );
}