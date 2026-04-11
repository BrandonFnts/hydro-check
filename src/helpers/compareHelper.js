// This code was made with the help of GEMINI, It solves the problem of use json.stringify in useEffect dependencies,
// it is a deep compare that returns true if the objects are equal, and false if they are not. It also memoizes the value to avoid unnecessary re-renders
export const isDeepEqual = (object1, object2) => {
    if (object1 === object2) return true;

    if (typeof object1 !== 'object' || object1 === null ||
        typeof object2 !== 'object' || object2 === null) {
        return false;
    }

    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!Object.prototype.hasOwnProperty.call(object2, key) ||
            !isDeepEqual(object1[key], object2[key])) {
            return false;
        }
    }

    return true;
};
