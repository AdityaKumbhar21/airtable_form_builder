import axios from "axios";


export const getBases = async (req, res) => {
    try{
        
        
        const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
            headers: { Authorization: `Bearer ${req.user.accessToken}` },
        });

        return res.status(200).json({
            message: 'Bases fetched successfully',
            bases: response.data.bases,
        });
    }
    catch(error){
        console.error('Error fetching bases from Airtable:', error);
        return res.status(500).json({ message: 'Failed to fetch bases from Airtable'
        });
    }

}


export const getTables = async (req, res) => {
  try {
    const { baseId } = req.params;
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: { Authorization: `Bearer ${req.user.accessToken}` },
    });
    res.json({ tables: response.data.tables });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tables' });
  }
}


export const getFields = async (req, res) => {
  try {
    const { tableId } = req.params;
    const baseId = req.query.baseId || req.body.baseId;
    
    if (!baseId) {
      return res.status(400).json({ message: 'baseId is required' });
    }
    
    if (!tableId) {
      return res.status(400).json({ message: 'tableId is required' });
    }

    console.log('Fetching fields for baseId:', baseId, 'tableId:', tableId);
    
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: { Authorization: `Bearer ${req.user.accessToken}` },
    });

    const table = response.data.tables.find(t => t.id === tableId);
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const supportedTypes = [
      'singleLineText', 'multilineText', 'singleSelect', 'multipleSelects',
      'email', 'url', 'phoneNumber', 'checkbox', 'date', 'multipleAttachments'
    ];

    const fields = table.fields
      .filter(f => supportedTypes.includes(f.type))
      .map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        options: f.options || null,
      }));

    res.json({ fields });
  } catch (err) {
    console.error('Error fetching fields:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to fetch fields' });
  }
}