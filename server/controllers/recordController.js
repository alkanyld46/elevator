const Record = require('../models/MaintenanceRecord')

const Elevator = require('../models/Elevator');
exports.create = async (req, res) => {
    const { elevatorId } = req.body; // actually qrCodeData
    const elevator = await Elevator.findOne({ qrCodeData: elevatorId });
    if (!elevator) return res.status(404).json({ msg: 'Elevator not found' });
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

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
// optional query: ?user=...  ?elevator=...
exports.getAll = async (req, res) => {
    const filter = {}
    if (req.query.user) filter.user = req.query.user
    if (req.query.elevator) filter.elevator = req.query.elevator

    const recs = await Record.find(filter)
        .populate('user', 'name')
        .populate('elevator', 'name location')
    res.json(recs)
}
