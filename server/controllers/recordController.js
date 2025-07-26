const Record = require('../models/MaintenanceRecord')
const Elevator = require('../models/Elevator');

function dueForMonth(schedule, monthDate) {
    const d = new Date(schedule.date)
    return (
        d.getUTCFullYear() === monthDate.getUTCFullYear() &&
        d.getUTCMonth() === monthDate.getUTCMonth()
    )
}

exports.create = async (req, res) => {
    const { elevatorId } = req.body; // actually qrCodeData
    const elevator = await Elevator.findOne({ qrCodeData: elevatorId });
    if (!elevator) return res.status(404).json({ msg: 'Elevator not found' });
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const scheduled = (elevator.maintenanceSchedules || []).some(s =>
        dueForMonth(s, now)
    )
    if (!scheduled) {
        return res.status(400).json({ msg: 'Elevator not scheduled for maintenance this month' })
    }

    const existing = await Record.findOne({
        elevator: elevator._id,
        timestamp: { $gte: start, $lt: end }
    }).populate('user', 'name');

    if (existing) {
        return res.status(400).json({
            msg: `Elevator already maintained this month by ${existing.user?.name || 'another technician'}`
        });
    }

    const rec = await Record.create({ elevator: elevator._id, user: req.user._id });
    res.status(201).json(rec);
};

// @route GET /api/records
// optional query: ?user=...  ?elevator=... ?month=YYYY-MM
exports.getAll = async (req, res) => {
    const filter = {}
    if (req.query.user) filter.user = req.query.user
    if (req.query.elevator) filter.elevator = req.query.elevator
    if (req.query.month) {
        const m = new Date(req.query.month + '-01')
        const start = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 1))
        const end = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))
        filter.timestamp = { $gte: start, $lt: end }
    }

    const recs = await Record.find(filter)
        .populate('user', 'name')
        .populate('elevator', 'name location')
    res.json(recs)
}

exports.uploadAttachments = async (req, res) => {
    const rec = await Record.findById(req.params.id)
    if (!rec) return res.status(404).json({ msg: 'Record not found' })

    if (!req.files || !req.files.length) {
        req.files = []
    }

    // Normalize descriptions
    let descriptions = req.body.descriptions || []
    if (!Array.isArray(descriptions)) descriptions = [descriptions]

    // Robust needsRepair parsing
    let needsRepair
    if (req.body.needsRepair === 'true' || req.body.needsRepair === true) {
        needsRepair = true
    } else if (req.body.needsRepair === 'false' || req.body.needsRepair === false) {
        needsRepair = false
    } else {
        needsRepair = rec.needsRepair  // leave unchanged if missing/invalid
    }

    // Map uploaded files
    const files = req.files.map((f, idx) => ({
        file: f.filename,
        description: descriptions[idx] || ''
    }))

    // Safely append and save
    rec.attachments = (rec.attachments || []).concat(files)
    rec.needsRepair = needsRepair

    await rec.save()
    return res.json(rec)
}

