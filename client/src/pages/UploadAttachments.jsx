import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

export default function UploadAttachments() {
    const { id } = useParams();
    const [items, setItems] = useState([]);
    const [uploading, setUploading] = useState(false);
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
                    type="file"
                    accept="image/*"
                    multiple
                    className="form-control mb-3"
                    onChange={e => {
                        const fs = Array.from(e.target.files);
                        setItems(fs.map(f => ({ file: f, description: '' })));
                    }}
                />
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
                    </div>
                ))}
                <button className="btn btn-primary" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading…' : 'Upload'}
                </button>
            </form>
        </div>
    );
}