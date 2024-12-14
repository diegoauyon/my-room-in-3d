function sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      const sorted = obj.map(sortObjectKeys);  
      return [...new Set(sorted)];
    }
  
    const sortedKeys = Object.keys(obj).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
    const uniqueKeys = [...new Set(sortedKeys)];
    const result = {};
  
    for (const key of uniqueKeys) {
      result[key] = sortObjectKeys(obj[key]);
    }
  
    return result;
  }

  function filterEmptyProperties(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      return obj.map(filterEmptyProperties);
    }
  
    const result = {};
  
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value !== null && value !== undefined && value !== '') {
          result[key] = filterEmptyProperties(value);
        }
      }
    }
  
    return result;
  }


const newArray = array.map((item) => {
    const sorted = sortObjectKeys(item);
    const filtered = filterEmptyProperties(sorted);
    return filtered;
})




  

    