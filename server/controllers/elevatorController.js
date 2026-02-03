const Elevator = require('../models/Elevator')

// Allowed fields for elevator creation/update (prevents mass assignment)
const ALLOWED_FIELDS = ['name', 'location', 'qrCodeData', 'maintenanceSchedules']

// Helper to pick only allowed fields from request body
const pickAllowedFields = (body) => {
    const picked = {}
    ALLOWED_FIELDS.forEach(field => {
        if (body[field] !== undefined) {
            picked[field] = body[field]
        }
    })
    return picked
}

// Utility to check if schedule matches month
function dueForMonth(schedule, monthDate) {
    const d = new Date(schedule.date)
    return (
        d.getUTCFullYear() === monthDate.getUTCFullYear() &&
        d.getUTCMonth() === monthDate.getUTCMonth()
    )
}

// @route  GET /api/elevators
exports.getAll = async (req, res) => {
    try {
        const list = await Elevator.find()
        res.json(list)
    } catch (err) {
        console.error('GetAll Elevators Error:', err)
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}

// @route  POST /api/elevators
exports.create = async (req, res) => {
    try {
        // Only allow specific fields (prevents mass assignment)
        const data = pickAllowedFields(req.body)
        
        // Validate required fields (qrCodeData is now auto-generated if not provided)
        if (!data.name || !data.location) {
            return res.status(400).json({ msg: 'Name and location are required' })
        }

        // Auto-generate qrCodeData if not provided
        if (!data.qrCodeData) {
            data.qrCodeData = Elevator.generateQrCodeData()
        }

        const elevator = await Elevator.create(data)
        res.status(201).json(elevator)
    } catch (err) {
        console.error('Create Elevator Error:', err)
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'An elevator with this QR code already exists' })
        }
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}

// @route  PUT /api/elevators/:id
exports.update = async (req, res) => {
    try {
        // Only allow specific fields (prevents mass assignment)
        const data = pickAllowedFields(req.body)
        
        const updated = await Elevator.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
        if (!updated) {
            return res.status(404).json({ msg: 'Elevator not found' })
        }
        res.json(updated)
    } catch (err) {
        console.error('Update Elevator Error:', err)
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'An elevator with this QR code already exists' })
        }
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}

// @route  DELETE /api/elevators/:id
exports.remove = async (req, res) => {
    try {
        const deleted = await Elevator.findByIdAndDelete(req.params.id)
        if (!deleted) {
            return res.status(404).json({ msg: 'Elevator not found' })
        }
        res.json({ msg: 'Deleted' })
    } catch (err) {
        console.error('Delete Elevator Error:', err)
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}

// @route GET /api/elevators/current?month=YYYY-MM
exports.getCurrent = async (req, res) => {
    try {
        const monthParam = req.query.month
        const monthDate = monthParam ? new Date(monthParam + '-01') : new Date()
        
        // Validate date
        if (isNaN(monthDate.getTime())) {
            return res.status(400).json({ msg: 'Invalid month format. Use YYYY-MM' })
        }

        const all = await Elevator.find()
        const due = []
        all.forEach(e => {
            const match = (e.maintenanceSchedules || []).find(s =>
                dueForMonth(s, monthDate)
            )
            if (match) {
                const obj = e.toObject()
                obj.assignedMonth = match.date
                due.push(obj)
            }
        })
        res.json(due)
    } catch (err) {
        console.error('GetCurrent Elevators Error:', err)
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}

// @route POST /api/elevators/:id/regenerate-qr
// Regenerates the QR code data for an elevator
exports.regenerateQrCode = async (req, res) => {
    try {
        const elevator = await Elevator.findById(req.params.id)
        if (!elevator) {
            return res.status(404).json({ msg: 'Elevator not found' })
        }

        // Generate new QR code data
        elevator.qrCodeData = Elevator.generateQrCodeData()
        await elevator.save()

        res.json(elevator)
    } catch (err) {
        console.error('Regenerate QR Error:', err)
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}
