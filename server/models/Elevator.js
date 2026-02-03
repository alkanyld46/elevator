const mongoose = require('mongoose')
const crypto = require('crypto')

const elevatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    qrCodeData: { type: String, unique: true },
    maintenanceSchedules: [
        {
            date: { type: Date, required: true },
        },
    ],
}, { timestamps: true })

// Auto-generate qrCodeData before saving if not provided
elevatorSchema.pre('save', function(next) {
    if (!this.qrCodeData) {
        // Generate a unique QR code data string: ELV-<timestamp>-<random>
        const timestamp = Date.now().toString(36).toUpperCase()
        const random = crypto.randomBytes(4).toString('hex').toUpperCase()
        this.qrCodeData = `ELV-${timestamp}-${random}`
    }
    next()
})

// Static method to generate QR code data (for use in controller)
elevatorSchema.statics.generateQrCodeData = function() {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = crypto.randomBytes(4).toString('hex').toUpperCase()
    return `ELV-${timestamp}-${random}`
}

module.exports = mongoose.model('Elevator', elevatorSchema)
