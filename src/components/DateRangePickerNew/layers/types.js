export const LAYER_TYPES = {
  BASE: 'base',
  BACKGROUND: 'background',
  EVENTS: 'events',
  // Can add more layer types as needed
};

export const LAYER_CAPABILITIES = {
  [LAYER_TYPES.BASE]: {
    canSelect: true,
    canRender: true,
    dataSchema: {
      // Define base layer data requirements
    }
  },
  [LAYER_TYPES.BACKGROUND]: {
    canSelect: false,
    canRender: true,
    applyBackground: true,
    dataSchema: {
      type: 'array',
      items: {
        startDate: 'string', // ISO date
        endDate: 'string',   // ISO date
        color: 'string'      // CSS color
      }
    }
  },
  [LAYER_TYPES.EVENTS]: {
    canSelect: false,
    canRender: true,
    dataSchema: {
      type: 'array',
      items: {
        date: 'string',
        title: 'string',
        type: 'string',
        time: 'string',
        description: 'string'
      }
    }
  }
}; 