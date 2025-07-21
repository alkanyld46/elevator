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
