const mongoose = require('mongoose')
const elevatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    qrCodeData: { type: String, required: true, unique: true },
    maintenanceSchedules: [
        {
            date: { type: Date, required: true },
        },
    ],
}, { timestamps: true })

module.exports = mongoose.model('Elevator', elevatorSchema)
