const mongoose = require('mongoose')
const elevatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    qrCodeData: { type: String, required: true, unique: true },
    maintenanceSchedules: [
        {
            date: { type: Date, required: true },
            repeat: { type: Number, default: 0 }, // repeat in months, 0 = no repeat
        },
    ],
}, { timestamps: true })

module.exports = mongoose.model('Elevator', elevatorSchema)
