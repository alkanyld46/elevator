const mongoose = require('mongoose')
const recordSchema = new mongoose.Schema({
    elevator: { type: mongoose.Schema.Types.ObjectId, ref: 'Elevator', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    needsRepair: { type: Boolean, default: false },
    attachments: [
        {
            file: String,
            description: String
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model('MaintenanceRecord', recordSchema)
