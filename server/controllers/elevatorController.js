const Elevator = require('../models/Elevator')

// @route  GET /api/elevators
exports.getAll = async (req, res) => {
    const list = await Elevator.find()
    res.json(list)
}

// @route  POST /api/elevators
exports.create = async (req, res) => {
    const elevator = await Elevator.create(req.body)
    res.status(201).json(elevator)
}

// @route  PUT /api/elevators/:id
exports.update = async (req, res) => {
    const updated = await Elevator.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
}

// @route  DELETE /api/elevators/:id
exports.remove = async (req, res) => {
    await Elevator.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Deleted' })
}
// Utility to check if schedule matches month
function dueForMonth(schedule, monthDate) {
    const d = new Date(schedule.date)
    return (
        d.getUTCFullYear() === monthDate.getUTCFullYear() &&
        d.getUTCMonth() === monthDate.getUTCMonth()
    )
}

// @route GET /api/elevators/current?month=YYYY-MM
exports.getCurrent = async (req, res) => {
    const monthParam = req.query.month
    const monthDate = monthParam ? new Date(monthParam + '-01') : new Date()
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
}