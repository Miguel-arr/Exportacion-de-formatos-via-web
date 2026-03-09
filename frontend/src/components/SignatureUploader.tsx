import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';

export interface SignatureUploaderHandle {
  getFirmaBase64: () => string | null;
  limpiar: () => void;
}

interface SignatureUploaderProps {
  label?: string;
}

const SignatureUploader = forwardRef<SignatureUploaderHandle, SignatureUploaderProps>(
  ({ label = 'Subir firma (Imagen)' }, ref) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    useImperativeHandle(ref, () => ({
      getFirmaBase64: () => preview,
      limpiar: () => {
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }));

    return (
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>{label}</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          ref={fileInputRef}
          style={{ marginBottom: '10px', fontSize: '13px' }}
        />
        {preview && (
          <div style={{ marginTop: '10px', border: '1px solid #ddd', padding: '5px', borderRadius: '4px', maxWidth: '200px' }}>
            <img src={preview} alt="Vista previa firma" style={{ width: '100%', height: 'auto', display: 'block' }} />
            <button 
              type="button" 
              onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              style={{ marginTop: '5px', width: '100%', padding: '4px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              Quitar
            </button>
          </div>
        )}
      </div>
    );
  }
);

SignatureUploader.displayName = 'SignatureUploader';

export default SignatureUploader;
