export const checkCondition = (itemValue, op, filterValue) => {
    const a = itemValue ?? "";
    const b = filterValue ?? "";

    switch (op) {
        case '==': return a === b;
        case '!=': return a !== b;
        case '>': return a > b;
        case '<': return a < b;
        case '>=': return a >= b;
        case '<=': return a <= b;
        case 'contains':
            return String(a).toLowerCase().includes(String(b).toLowerCase());
        case 'tag':
            return Array.isArray(a) && a.some(item => item.id === b);
        default: return true;
    }
};
