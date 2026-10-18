const Agent = require('../models/Agent');
const { getIsConnected, memoryStore } = require('../config/db');

// @desc    Get all agents
// @route   GET /api/agents
exports.getAgents = async (req, res) => {
  try {
    const isConnected = getIsConnected();

    if (isConnected) {
      const agents = await Agent.find().sort({ rating: -1, closedDeals: -1 });
      return res.json({ success: true, count: agents.length, data: agents });
    } else {
      return res.json({ success: true, count: memoryStore.agents.length, data: memoryStore.agents });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new agent
// @route   POST /api/agents
exports.createAgent = async (req, res) => {
  try {
    const { name, company, phone, whatsapp, email, speaks, specialties, photo, isSuperAgent } = req.body;
    if (!name || !phone || !email) {
      return res.status(400).json({ success: false, message: 'Name, phone, and email are required' });
    }

    const agentData = {
      name,
      company: company || 'RentelHome Verified Partner',
      photo: photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      phone,
      whatsapp: whatsapp || phone.replace(/[^0-9]/g, ''),
      email,
      speaks: speaks || ['English', 'Arabic'],
      specialties: specialties || ['Rentals', 'Apartments'],
      closedDeals: 10,
      rating: 4.9,
      isSuperAgent: !!isSuperAgent,
    };

    const isConnected = getIsConnected();
    if (isConnected) {
      const agent = await Agent.create(agentData);
      return res.status(201).json({ success: true, data: agent });
    } else {
      const newAgent = { _id: 'agent_' + Date.now(), ...agentData };
      memoryStore.agents.push(newAgent);
      return res.status(201).json({ success: true, data: newAgent });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const isConnected = getIsConnected();
    const Property = require('../models/Property');

    if (isConnected) {
      const existingAgent = await Agent.findById(id);
      if (!existingAgent) return res.status(404).json({ success: false, message: 'Agent not found' });

      const oldName = existingAgent.name;
      const oldEmail = existingAgent.email;

      const agent = await Agent.findByIdAndUpdate(id, updateData, { new: true });

      // Synchronize all properties assigned to this agent in MongoDB
      const agentPropertyUpdates = {
        'agent._id': String(agent._id),
        'agent.name': agent.name,
        'agent.company': agent.company,
        'agent.photo': agent.photo,
        'agent.phone': agent.phone,
        'agent.whatsapp': agent.whatsapp || agent.phone?.replace(/[^0-9]/g, ''),
        'agent.email': agent.email,
        'agent.closedDeals': agent.closedDeals,
        'agent.rating': agent.rating,
        'agent.isSuperAgent': !!agent.isSuperAgent,
        isSuperAgent: !!agent.isSuperAgent,
      };

      if (agent.specialties) {
        agentPropertyUpdates['agent.specialties'] = Array.isArray(agent.specialties)
          ? agent.specialties
          : [agent.specialties];
      }

      await Property.updateMany(
        {
          $or: [
            { 'agent._id': String(id) },
            { 'agent.id': String(id) },
            { 'agent.email': oldEmail },
            { 'agent.email': agent.email },
            { 'agent.name': oldName },
            { 'agent.name': agent.name },
          ],
        },
        { $set: agentPropertyUpdates }
      );

      return res.json({ success: true, data: agent });
    } else {
      const index = memoryStore.agents.findIndex((a) => String(a._id) === id || a.id === Number(id));
      if (index === -1) return res.status(404).json({ success: false, message: 'Agent not found' });

      const oldAgent = memoryStore.agents[index];
      const oldName = oldAgent.name;
      const oldEmail = oldAgent.email;

      memoryStore.agents[index] = { ...oldAgent, ...updateData };
      const updatedAgent = memoryStore.agents[index];

      // Synchronize all in-memory properties assigned to this agent
      memoryStore.properties = memoryStore.properties.map((p) => {
        const matches =
          (p.agent && (String(p.agent._id) === String(id) || String(p.agent.id) === String(id))) ||
          (p.agent && (p.agent.email === oldEmail || p.agent.email === updatedAgent.email)) ||
          (p.agent && (p.agent.name === oldName || p.agent.name === updatedAgent.name));

        if (matches) {
          return {
            ...p,
            isSuperAgent: !!updatedAgent.isSuperAgent,
            agent: {
              ...p.agent,
              _id: String(updatedAgent._id || id),
              name: updatedAgent.name,
              company: updatedAgent.company,
              photo: updatedAgent.photo,
              phone: updatedAgent.phone,
              whatsapp: updatedAgent.whatsapp || updatedAgent.phone?.replace(/[^0-9]/g, ''),
              email: updatedAgent.email,
              closedDeals: updatedAgent.closedDeals,
              rating: updatedAgent.rating,
              isSuperAgent: !!updatedAgent.isSuperAgent,
              specialties: updatedAgent.specialties,
            },
          };
        }
        return p;
      });

      return res.json({ success: true, data: updatedAgent });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete agent
// @route   DELETE /api/agents/:id
exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const isConnected = getIsConnected();

    if (isConnected) {
      const deleted = await Agent.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Agent not found' });
      return res.json({ success: true, message: 'Agent deleted' });
    } else {
      const initLen = memoryStore.agents.length;
      memoryStore.agents = memoryStore.agents.filter((a) => String(a._id) !== id && a.id !== Number(id));
      if (memoryStore.agents.length === initLen) {
        return res.status(404).json({ success: false, message: 'Agent not found' });
      }
      return res.json({ success: true, message: 'Agent deleted' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
