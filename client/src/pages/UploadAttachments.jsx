import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

export default function UploadAttachments() {
    const { id } = useParams();
    const [items, setItems] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        if (!items.length) {
            return navigate('/tech');
        }
        const formData = new FormData();
        items.forEach(item => {
            formData.append('files', item.file);
            formData.append('descriptions', item.description);
        });
        setUploading(true);
        try {
            await api.post(`/records/${id}/attachments`, formData);

            alert('Images uploaded');
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploading(false);
            navigate('/tech');
        }
    };

    return (
        <div className="container my-4">
            <h2>Upload Maintenance Photos</h2>
            <form onSubmit={handleSubmit}>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="form-control mb-3"
                    style={{ display: 'none' }}
                    onChange={e => {
                        const fs = Array.from(e.target.files);
                        if (fs.length > 0) {
                            setItems(itms => [
                                ...itms,
                                ...fs.map(f => ({ file: f, description: '' }))
                            ]);
                        }
                        e.target.value = '';
                    }}
                />
                <button
                    type="button"
                    className="btn btn-secondary mb-3"
                    onClick={() => fileRef.current?.click()}
                >
                    Add Photos
                </button>
                {items.map((item, idx) => (
                    <div className="mb-3" key={idx}>
                        <label className="form-label">{item.file.name}</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Description"
                            value={item.description}
                            onChange={e => {
                                const val = e.target.value;
                                setItems(itms =>
                                    itms.map((it, i) =>
                                        i === idx ? { ...it, description: val } : it
                                    )
                                );
                            }}
                        />
                        <button
                            type="button"
                            className="btn btn-link"
                            onClick={() =>
                                setItems(itms =>
                                    itms.filter((_, i) => i !== idx)
                                )
                            }
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button className="btn btn-primary" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading…' : 'Upload'}
                </button>
            </form>
        </div>
    );
}