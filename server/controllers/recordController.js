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
    try {
        // 1. Find the record
        const rec = await Record.findById(req.params.id);
        if (!rec) return res.status(404).json({ msg: 'Record not found' });

        // 2. Ensure req.files is always an array
        const filesArr = Array.isArray(req.files) ? req.files : [];

        // 3. Normalize descriptions into an array
        let descriptions = req.body.descriptions || [];
        if (!Array.isArray(descriptions)) descriptions = [descriptions];

        // 4. Parse the incoming "true"/"false" string into a boolean
        rec.needsRepair = (req.body.needsRepair === 'true');

        // 5. Map uploaded files to your schema
        const newFiles = filesArr.map((f, idx) => ({
            file: f.filename,
            description: descriptions[idx] || ''
        }));

        // 6. Append attachments and save
        rec.attachments = (rec.attachments || []).concat(newFiles);
        await rec.save();

        // 7. Return the updated record
        return res.json(rec);
    } catch (err) {
        console.error('❌ uploadAttachments Error:', err);
        return res
            .status(500)
            .json({ msg: 'Failed to upload attachments', error: err.message });
    }
};
