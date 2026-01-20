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

// Compound index for efficient queries on elevator + timestamp (used in duplicate check)
recordSchema.index({ elevator: 1, timestamp: 1 })

// Index for user queries
recordSchema.index({ user: 1 })

// Index for timestamp-based queries (monthly reports)
recordSchema.index({ timestamp: -1 })

module.exports = mongoose.model('MaintenanceRecord', recordSchema)
