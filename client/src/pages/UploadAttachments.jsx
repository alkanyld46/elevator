import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

export default function UploadAttachments() {
    const { id } = useParams();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        if (!files.length) {
            return navigate('/tech');
        }
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        setUploading(true);
        try {
            await api.post(`/records/${id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
                    onChange={e => setFiles(Array.from(e.target.files))}
                />
                <button className="btn btn-primary" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading…' : 'Upload'}
                </button>
            </form>
        </div>
    );
}